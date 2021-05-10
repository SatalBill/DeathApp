import React, {useContext, useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {store} from '../AppContext';
import {useDatabase} from '../DatabaseContext';
import {getQuestionBody, QuestionType } from './Questions';
import {Category} from './Category';
import Icon from 'react-native-vector-icons/FontAwesome';
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid';
import { getDisplayQuestions } from '../selectors/questionSelectors';
import { getAnswersForCurrentUser } from '../selectors/answersSelector';
import { getTasksForCurrentUser } from '../selectors/tasksSelector';
import { AddCardModal } from './Card';

interface Props {}

const shouldAddTask = (questionType: QuestionType, value: any, triggerValue: any): boolean => {
  switch(questionType){
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

export const TodaysQuestions: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const {
    dispatch, // TODO why are the types here broken?
    user, 
    taskTemplates,
    isDbLoaded
  } = globalState;

  if (!user) {
    return null;
  }

  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);
  const answers = getAnswersForCurrentUser(user.id, globalState.answers);

  const [questions, setQuestions] = useState<Question[] | undefined>();
  const [entityTemplates, setEntityTemplates] = useState<EntityTemplate[]>([]);
  const [addModalVisible, setAddModalVisible] = useState<string | null>(null); // Add new entity
  const [currentQuestion, setCurrentQuestions] = useState(0);
  

  const database = useDatabase();

  function getQuestions() {
    return database
      .getAllQuestions()
      .then((q) => 
        setQuestions(
          q.filter((v) => v.category !== Category.onboarding),
          // TODO also filter out unanswered questions
        ),
      );
  }

  function getAllEntityTemplates() {
    return database.getAllEntityTemplates().then((et: EntityTemplate[]) => setEntityTemplates(et));
  }

  useEffect(
    () => {
      if (isDbLoaded) {
        getQuestions();
      }
    },
    [
      isDbLoaded
    ],
  );

  useEffect(
    () => {
      if (isDbLoaded) {
        getAllEntityTemplates();
      }
    },
    [
      isDbLoaded
    ],
  );

  function updateAnswer(answer: Answer, questionType: QuestionType) {
    return database
      .updateAnswer(answer, questionType)
      .then((a) => console.log("Updated answer in db!"));
  }

  function updateTask(task: TaskUpsert) {
    return database
      .updateTask(task)
      .then((t) => dispatch({type: 'UPDATE_TASKS', tasks: [task]}));
  }

  // TODO consider pulling this out into a shared function
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

      triggerTasks.forEach((tt: {templateId: string; triggerValue: boolean | number | number[]; }) => {

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
              isDeleted: false,
              subTasks: subtaskUuids,
            };

            updateTask(newTask);
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

    dispatch({type: 'UPDATE_ANSWERS', answers: newAnswers});

    // Set answer in db
    updateAnswer(answer, questionType);
  };

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

  if (!questions || questions.length === 0) {
    return null;
  }

  let displayQuestions = getDisplayQuestions(questions, answers).filter((q) => {
    return !answers.has(q.id);
  });

  if (displayQuestions.length >= 6) {
    displayQuestions = [ ...displayQuestions ].slice(0, 6);
  }

  if (!displayQuestions || !displayQuestions.length) {
    return (
      <View
      style={{
        width: '100%',
        borderWidth: 2,
        borderColor: '#f0f1f4',
        borderRadius: 4,
        borderStyle: 'solid',
        backgroundColor: 'white',
        height: 246,
        display: 'flex',
        justifyContent: 'space-between',
        padding: 16,
        }}>
        <Text
          style={{
            flexDirection: 'row',
            fontSize: 16,
            marginLeft: 18,
            marginRight: 18,
            color: '#333',
            textAlign: 'center',
            fontFamily: 'DMSans-Regular'
          }}>
          Well done! There are no more questions to answer
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: '100%',
        borderWidth: 2,
        borderColor: '#f0f1f4',
        borderRadius: 4,
        borderStyle: 'solid',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingLeft: 16, 
        paddingRight: 16
      }}>
      <AddCardModal
          isModalVisible={addModalVisible !== null}
          setModalVisible={setAddModalVisible}
          entityTemplate={entityTemplates.find((et) => et.id === addModalVisible) || null}
      />
      <Text
        style={{
          fontWeight: '500',
          fontSize: 16,
          color: '#444',
          marginBottom: 8,
          fontFamily: 'DMSans-Regular'
        }}>
        {displayQuestions[currentQuestion].displayText}
      </Text>
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Icon.Button
          name="chevron-left"
          size={18}
          color={currentQuestion === 0 ? '#999' : '#055a73'}
          onPress={() =>
            currentQuestion > 0 && setCurrentQuestions(currentQuestion - 1)
          }
          backgroundColor={'transparent'}
        />
        {getQuestionBody(
          displayQuestions[currentQuestion],
          (value: any) => onChangeAnswer(user.id, displayQuestions[currentQuestion].id, value),
          answers.get(displayQuestions[currentQuestion].id)?.value,
        )}
        <Icon.Button
          name="chevron-right"
          size={18}
          color={currentQuestion === displayQuestions.length - 1 ? '#999' : '#055a73'}
          onPress={() =>
            currentQuestion < displayQuestions.length - 1 &&
            setCurrentQuestions(currentQuestion + 1)
          }
          backgroundColor={'transparent'}
        />
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        {[...Array(displayQuestions.length).keys()].map((i) => (
          <Icon
            key={i}
            name="circle"
            size={10}
            color={currentQuestion === i ? '#055a73' : 'grey'}
            style={{marginVertical: 22, marginHorizontal: 5}}
          />
        ))}
      </View>
    </View>
  );
};
