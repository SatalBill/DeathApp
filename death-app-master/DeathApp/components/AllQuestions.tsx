import React, { useContext, useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App';
import { store } from '../AppContext';
import { Api } from '../api/Api';
import { PrimaryButton } from './Button';
import {
    QuestionList,
    QuestionType,
} from './Questions';
import { useDatabase } from '../DatabaseContext';
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid';
import { getDisplayQuestions } from '../selectors/questionSelectors';
import { AddCardModal, EditCardModal } from './Card';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getAnswersForCurrentUser } from '../selectors/answersSelector';
import { getEntityAnswersForCurrentUser } from '../selectors/entityAnswersSelector';
import { getTasksForCurrentUser } from '../selectors/tasksSelector';
import { Footer } from './Footer';

type AllQuestionsScreenNavigationProp = StackNavigationProp<
    StackParamList,
    "AllQuestions"
>;

interface Props {
    navigation: AllQuestionsScreenNavigationProp
}

const shouldAddTask = (questionType: QuestionType, value: any, triggerValue: any): boolean => {
    switch (questionType) {
        case QuestionType.boolean:
            return value === triggerValue;
        case QuestionType.singleSelect:
            return value === triggerValue;
        case QuestionType.multiSelect:
            return triggerValue.filter((x: number) => value.has(x));
        default:
            return false;
    }
}

export const AllQuestions: React.FC<Props> = (props: Props) => {
    const { navigate } = props.navigation;
    const globalState = useContext(store);
    const {
        dispatch, // TODO why are the types here broken?
        user,
        taskTemplates,
    } = globalState;
    if (!user) {
        return null;
    }

    const tasks = getTasksForCurrentUser(user.id, globalState.tasks);
    const answers = getAnswersForCurrentUser(user.id, globalState.answers);
    const entityAnswers = getEntityAnswersForCurrentUser(user.id, globalState.entityAnswers);

    const [questions, setQuestions] = useState<Question[] | undefined>();
    const [entityTemplates, setEntityTemplates] = useState<EntityTemplate[]>([]);
    const [addModalVisible, setAddModalVisible] = useState<string | null>(null); // Add new entity
    const [editModalVisible, setEditModalVisible] = useState<string | null>(null); // Edit existing entity

    const database = useDatabase();

    function updateAnswer(answer: Answer, questionType: QuestionType) {
        return database.updateAnswer(answer, questionType).then((a) => console.log("Updated answers in db"));
    }

    function getAllQuestions() {
        return database.getAllQuestions().then((q: Question[]) => setQuestions(q));
    }

    function getAllEntityTemplates() {
        return database.getAllEntityTemplates().then((et: EntityTemplate[]) => setEntityTemplates(et));
    }

    function updateTask(task: TaskUpsert) {
        return database
            .updateTask(task)
            .then((t) => dispatch({ type: 'UPDATE_TASKS', tasks: [task] }));
    }

    useEffect(() => {
        getAllQuestions()
    }, [/* only on first load */]);

    useEffect(() => {
        getAllEntityTemplates();
    }, [/* only on first load */]);

    const onChangeAnswer = (userId: string, questionId: string, value: any) => {
        // TODO what if .find() fails? We should have a valid question at this point but this will
        // throw a hard JS error if .find() fails.
        const question = questions!.find((q: Question) => q.id === questionId);
        const questionType = question!.type;

        // If we just answered an entity question, pop open the modal if appropriate
        if (questionType === QuestionType.boolean) {
            const { triggerEntities } = question as QuestionBoolean;
            if (triggerEntities.length) {
                triggerEntities.forEach((t: { templateId: string; triggerValue: boolean }) => {
                    const entityTemplate = entityTemplates.find((et) => et.id === t.templateId)!;
                    if (t.triggerValue === value) {
                        setAddModalVisible(entityTemplate.id);
                    }
                })
            }
        }

        if (questionType === QuestionType.boolean
            || questionType === QuestionType.singleSelect
            || questionType === QuestionType.multiSelect) {
            const { triggerTasks } = question as QuestionBoolean | QuestionSingleSelect | QuestionMultiSelect;

            triggerTasks.forEach((tt: { templateId: string; triggerValue: boolean | number | number[]; }) => {

                // If we already have a task for this templateId + answer we don't want to add a duplicate
                const existingTask = tasks.find((t) => t.taskTemplateId === tt.templateId);

                if (shouldAddTask(questionType, value, tt.triggerValue) && !existingTask) {
                    // TODO remove a task if the answer changes?

                    // Get the appropriate template to use
                    // We know that the template exists, but TS doesn't
                    let taskTemplateToUse: TaskTemplate = taskTemplates.find((t: TaskTemplate) => t.id === tt.templateId)!;

                    // Generate the correct due date based on the number of days to complete
                    let dueDate;
                    if (taskTemplateToUse.timeToComplete) {
                        dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + taskTemplateToUse.timeToComplete);
                    }

                    let subtaskUuids: string[] = [];
                    if (taskTemplateToUse.subTasks.length > 0) {
                        subtaskUuids = addSubtasks(userId, taskTemplateToUse.subTasks)
                    }

                    const newTask: TaskUpsert = {
                        ...taskTemplateToUse,
                        uuid: uuidv4(),
                        userId,
                        status: "PENDING",
                        dueDate: dueDate || null,
                        note: "",
                        level: taskTemplateToUse.level,
                        taskTemplateId: taskTemplateToUse.id,
                        subTasks: subtaskUuids,
                        isDeleted: false,
                    };
                    updateTask(newTask);
                    /*
                    Api.updateTasks(newTask)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(error => { 
                            console.error(error)
                        });
                        */
                }
            })
        }

        const newAnswers = new Map<string, Answer>(answers);
        const answer: Answer = {
            uuid: uuidv4(),
            userId,
            questionId,
            value
        };
        newAnswers.set(questionId, answer);

        // Update answers in global state
        // TODO should this actually just be local state and global state updates happen with a save button?
        dispatch({ type: 'UPDATE_ANSWERS', answers: newAnswers });

        // Set answer in db
        /*
        Api.updateAnswers(answer)
            .then(response => { }
            )
            .catch(error => { })
        */

        updateAnswer(answer, questionType);
    }

    function addSubtasks(userId: string, subtaskTemplateIds: string[]): string[] {
        const subtaskUuids: string[] = [];
        subtaskTemplateIds.forEach((sid: string) => {
            // Get the appropriate template to use
            // We know that the template exists, but TS doesn't
            let taskTemplateToUse: TaskTemplate = taskTemplates.find((t: TaskTemplate) => t.id === sid)!;
            
            let dueDate;
            if (taskTemplateToUse.timeToComplete) {
                dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + taskTemplateToUse.timeToComplete);
            }

            const uuid = uuidv4();
            const newTask: TaskUpsert = {
                ...taskTemplateToUse,
                uuid,
                userId,
                status: "PENDING",
                dueDate: dueDate || null,
                note: "",
                level: taskTemplateToUse.level,
                taskTemplateId: taskTemplateToUse.id,
                isDeleted: false,
            };
            subtaskUuids.push(uuid);

            // TODO condense this into a single request
            updateTask(newTask);
        });
        return subtaskUuids;
    }

    // We should have a logged-in user by this point, but just checking for type safety
    if (!user || !questions || !entityTemplates) {
        return null;
    }

    const displayQuestions = getDisplayQuestions(questions, answers);

    const entityAnswer = editModalVisible ? entityAnswers.get(editModalVisible) : undefined;

    return (
        <>
        <SafeAreaView style={{ flex: 1 }} >
            <ScrollView style={{ marginLeft: 18, marginRight: 18, marginTop: 18 }}>
                <AddCardModal
                    isModalVisible={addModalVisible !== null}
                    setModalVisible={setAddModalVisible}
                    entityTemplate={entityTemplates.find((et) => et.id === addModalVisible) || null}
                />
                {entityAnswer !== undefined && <EditCardModal
                    isModalVisible={editModalVisible !== null}
                    setModalVisible={setEditModalVisible}
                    entityAnswer={entityAnswer}
                    entityTemplates={entityTemplates}
                />}
                <TouchableOpacity onPress = {() => navigate('Home')}
                    style={{ 
                        marginTop: 8,
                    }}
                >
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 18,
                    }}>
                        <FontAwesome 
                            name="chevron-left"
                            backgroundColor="transparent"
                            color="#055a73"
                            size={16}
                        /> 
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 21,
                            color: "#055a73",
                            fontFamily: 'DMSans-Medium',
                            textDecorationLine: 'underline',
                        }}>Back to Home</Text>
                    </View>
                </TouchableOpacity>
                {displayQuestions && <QuestionList
                    userId={user.id}
                    questions={displayQuestions}
                    answers={answers}
                    onChangeAnswer={onChangeAnswer}
                    setAddModalVisible={setAddModalVisible}
                    setEditModalVisible={setEditModalVisible}
                    entityAnswers={entityAnswers}
                    entityTemplates={entityTemplates}
                />
                }
                <View style={{ marginBottom: 18 }}>
                    <PrimaryButton title="Save" onPress={() => navigate('Home')} />
                </View>
            </ScrollView>
        </SafeAreaView>
        <Footer navigate={props.navigation.navigate} />
        </>
    )
};

