import React, { useContext, useState, useEffect } from 'react';
import { 
    Modal, 
    SafeAreaView, 
    ScrollView, 
    View, 
    StyleSheet,
    Text,
} from 'react-native';
import { QuestionList, QuestionText } from './Questions';    
import { store } from '../AppContext';
import { useDatabase } from '../DatabaseContext';
import { PrimaryButton, SecondaryButton } from './Button';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    isModalVisible: boolean;
    onClose: (userId: string, entityTemplate: EntityTemplate) => void; // This is a little sketchy
    onCancel: () => void;
    entityTemplate: EntityTemplate;
    userId: string;
    name: string;
    setName: (name: string) => void; 
    answers: Map<string, Answer>;
    displayQuestions: Question[];
    onChangeAnswer: (userId: string, questionId: string, value: any) => void;
}

interface AddProps {
    entityTemplate: EntityTemplate | null;
    isModalVisible: boolean;
    setModalVisible: (visibleModal: string | null) => void;
}

interface EditProps {
    entityAnswer: EntityAnswer;
    entityTemplates: EntityTemplate[];
    isModalVisible: boolean;
    setModalVisible: (visibleModal: string | null) => void;
}

export const EditCardModal: React.FC<EditProps> = (props: EditProps) => {
    const { entityAnswer, entityTemplates, setModalVisible, isModalVisible } = props;
    const globalState = useContext(store);
    const {
        dispatch, // TODO fix the typings for this
        user, 
    } = globalState;

    const entityTemplate = entityTemplates.find((et) => et.id === entityAnswer.templateId);

    // Set initial answer values
    const initialAnswers = new Map();
    entityAnswer.answers.forEach((ea) => {
        initialAnswers.set(ea.questionId, ea);
    });

    const [questions, setQuestions] = useState<Question[] | undefined>();
    const [answers, setAnswers] = useState<Map<string, Answer>>(initialAnswers);
    const [name, setName] = useState<string>(entityAnswer.name || "");

    const database = useDatabase();

    function getAllQuestions() {
        return database.getAllQuestions().then((q: Question[]) => setQuestions(q));
    }

    function updateEntityAnswer(entityAnswer: EntityAnswer) {
        return database
            .updateEntityAnswer(entityAnswer)
            .then((a) => console.log("Updated entity answer in db!"));
    }

    const onChangeAnswer = (userId: string, questionId: string, value: any) => {
        const newAnswers = new Map<string, Answer>(answers);
        const answer: Answer = { 
          uuid: uuidv4(), // Should we re-use the uuid?
          userId, 
          questionId, 
          value
        };

        newAnswers.set(questionId, answer);
        setAnswers(newAnswers);
    }

    const onCancel = () => setModalVisible(null);

    const onClose = (userId: string, entityTemplate: EntityTemplate) => {
        let answerList: Answer[] = [];
        answers.forEach((a) => answerList.push(a));

        // TODO validate form inputs
        const newEntityAnswer: EntityAnswer = {
            uuid: entityAnswer.uuid,
            userId,
            name,
            answers: answerList, // This is a list rather than a map so it is JSON serializable...
            templateId: entityTemplate.id,
            isDeleted: false,
        };

        // Tasks should have already been triggered, so I think we don't need to do that again
        // This is really the only difference between the onClose of the add modal, so we can probably
        // condense this.

        // Update global state with the changes
        dispatch({ type: 'UPDATE_ENTITY_ANSWERS', entityAnswers: [newEntityAnswer] });

        updateEntityAnswer(newEntityAnswer);
        
        // Clear the answers and the name from the modal
        setAnswers(new Map());
        setName("");

        // Close the modal
        setModalVisible(null);
    }

    useEffect(() => {
        getAllQuestions();
    }, [/* only on first load */]);

    if (!user || !questions || !entityTemplate) {
        return null;
    }

    // Get all of the questions associated with this entity template
    const displayQuestions = questions.filter((q) => entityTemplate.questions.includes(q.id));

    return (
        <CardModal 
            isModalVisible={isModalVisible}
            onClose={onClose}
            onCancel={onCancel}
            entityTemplate={entityTemplate}
            userId={user.id}
            name={name}
            setName={setName}
            answers={answers}
            displayQuestions={displayQuestions}
            onChangeAnswer={onChangeAnswer}
        />
    )
}

export const AddCardModal: React.FC<AddProps> = (props: AddProps) => {
    const { entityTemplate, setModalVisible, isModalVisible } = props;
    const globalState = useContext(store);
    const {
        dispatch, // TODO fix the typings for this
        user, 
        taskTemplates,
    } = globalState; 

    const [questions, setQuestions] = useState<Question[] | undefined>();
    const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
    const [name, setName] = useState<string>("");

    const database = useDatabase();

    function getAllQuestions() {
        return database.getAllQuestions().then((q: Question[]) => setQuestions(q));
    }

    function updateEntityAnswer(entityAnswer: EntityAnswer) {
        return database
            .updateEntityAnswer(entityAnswer)
            .then((a) => console.log("Updated entity answer in db!"));
    }

    function updateTask(task: TaskUpsert) {
        return database
            .updateTask(task)
            .then((t) => dispatch({type: 'UPDATE_TASKS', tasks: [task]}));
    }

    const onChangeAnswer = (userId: string, questionId: string, value: any) => {
        const newAnswers = new Map<string, Answer>(answers);
        const answer: Answer = { 
          uuid: uuidv4(),
          userId, 
          questionId, 
          value
        };

        newAnswers.set(questionId, answer);
        setAnswers(newAnswers);
    }
    const onCancel = () => setModalVisible(null);

    const onClose = (userId: string, entityTemplate: EntityTemplate) => {
        let answerList: Answer[] = [];
        answers.forEach((a) => answerList.push(a));

        // TODO validate form inputs
        const entityAnswer: EntityAnswer = {
            uuid: uuidv4(),
            userId,
            name,
            answers: answerList, // This is a list rather than a map so it is JSON serializable...
            templateId: entityTemplate.id,
            isDeleted: false,
        };

        // Trigger any relevant tasks
        const { triggerTasks } = entityTemplate;
        triggerTasks.forEach((tt: {templateId: string; triggerValue: boolean | number | number[]; }) => { 
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
            
        })

        // Update global state with the changes
        dispatch({ type: 'UPDATE_ENTITY_ANSWERS', entityAnswers: [entityAnswer] });

        updateEntityAnswer(entityAnswer);
        
        // Clear the answers and the name from the moda
        setAnswers(new Map());
        setName("");

        // Close the modal
        setModalVisible(null);
    }

    // TODO pull this out for re-use
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

    useEffect(() => {
        getAllQuestions();
    }, [/* only on first load */]);

    if (!user || !entityTemplate || !questions) {
        return null;
    }

    // Get all of the questions associated with this entity template
    const displayQuestions = questions.filter((q) => entityTemplate.questions.includes(q.id));

    return (
        <CardModal 
            isModalVisible={isModalVisible}
            onClose={onClose}
            onCancel={onCancel}
            entityTemplate={entityTemplate}
            userId={user.id}
            name={name}
            setName={setName}
            answers={answers}
            displayQuestions={displayQuestions}
            onChangeAnswer={onChangeAnswer}
        />
    )
}

const CardModal: React.FC<Props> = (props: Props) => {
    const {
        isModalVisible,
        onClose,
        onCancel,
        entityTemplate,
        userId,
        name,
        setName, 
        answers,
        displayQuestions,
        onChangeAnswer,
    } = props;
    
    return (
        <SafeAreaView style={{ flex: 1 }} >
            <ScrollView style={{ margin: 18 }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isModalVisible}
                    onRequestClose={() => onClose(userId, entityTemplate)} // This should be close without saving?
                >
                    <View style={styles.modalView}>
                        <QuestionText 
                            displayText={`What is the name of this ${entityTemplate.name}?`}
                            currentValue={name}
                            callback={setName}
                            placeholderText={"Name"}
                        />
                        <Text style={{ fontSize: 16, paddingBottom: 8 }}>{entityTemplate.name}</Text>
                        { displayQuestions && <QuestionList 
                            userId={userId} 
                            questions={displayQuestions}
                            answers={answers}
                            onChangeAnswer={onChangeAnswer}
                            />
                        }
                    </View>
                
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                    }}>
                    <SecondaryButton
                        title="Cancel"
                        onPress={onCancel}
                    />
                    <PrimaryButton 
                        title={"Save"} 
                        onPress={() => onClose(userId, entityTemplate)} 
                    />
                </View>
            </Modal>
        </ScrollView>
    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    centeredView: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24
    },
    modalView: {
      flex: 1,
      marginRight: 18,
      marginBottom: 24,
      marginTop: 48,
      marginLeft: 18,
      backgroundColor: "white",
      borderRadius: 18,
      padding: 35,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    }
});