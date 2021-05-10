import React, {useContext, useState, useEffect} from 'react';
import {Text, ScrollView, SafeAreaView, View} from 'react-native';
import {PrimaryButton} from './Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../App';
import {store} from '../AppContext';
import {QuestionList, QuestionType } from './Questions';
import {Category} from './Category';
import {useDatabase} from '../DatabaseContext';
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid';

type RequiredInfoScreenNavigationProp = StackNavigationProp<
  StackParamList,
  'RequiredInfo'
>;

interface Props {
  navigation: RequiredInfoScreenNavigationProp;
}

// TODO this is shared code that should be codensed
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

export const RequiredInfo: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const {
    dispatch, // TODO why are the types here broken?
    user,
    taskTemplates,
    isDbLoaded,
  } = globalState;

  const [answers, setAnswers] = useState(new Map<string, Answer>());
  const [questions, setQuestions] = useState();

  const database = useDatabase();

  function updateAnswer(answer: Answer, questionType: QuestionType) {
    return database.updateAnswer(answer, questionType).then(() => {});
  }

  function getQuestions() {
    return database
      .getAllQuestions()
      .then((q) =>
        setQuestions(
          q.filter((q) => q.category === Category.onboarding),
        ),
      );
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
      value,
    };
    newAnswers.set(questionId, answer);

    setAnswers(newAnswers);
  };

  const saveAnswers = (userId: string, answers: Map<string, Answer>) => {
    // TODO update the db to support bulk inserts to avoid this garbage
    Promise.all(
      [...answers].map(([_, a]) => {
        const questionType = questions.find(
          (q: Question) => q.id === a.questionId,
        ).type;
        updateAnswer(a, questionType);
      }),
    ).then(() => {});

    saveDefaultTasks(userId);

    // Add any tasks that have been triggered based on the answers to 
    // the required questions (if any exist)
    [...answers].map(([_, a]) => {
      const question = questions.find(
        (q: Question) => q.id === a.questionId,
      );
      addTasksForQuestion(userId, question, a.value, [ /* at this point, we have no existing tasks */]);
    })

    dispatch({type: 'UPDATE_ANSWERS', answers});
    props.navigation.navigate('Home');
  };

  const addTasksForQuestion = (userId: string, question: Question, value: any, tasks: Task[]) => {
    const questionType = question.type;
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
  }

  const saveDefaultTasks = (userId: string) => {
    const taskTemplatesToUse = taskTemplates.filter((tt: TaskTemplate) => tt.isDefault);

    // Generate a task for each of the templates marked as default 
    taskTemplatesToUse.forEach((tt) => {
      // Generate the correct due date based on the number of days to complete
      let dueDate;
      if (tt.timeToComplete) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + tt.timeToComplete);
      }

      let subtaskUuids: string[] = [];
      if (tt.subTasks.length > 0) {
          subtaskUuids = addSubtasks(userId, tt.subTasks)
      }

      const newTask: TaskUpsert = {
        ...tt,
        uuid: uuidv4(),
        userId,
        status: "PENDING",
        dueDate: dueDate || null,  
        note: "", 
        level: tt.level, 
        taskTemplateId: tt.id,
        isDeleted: false,
        subTasks: subtaskUuids,
      };

      updateTask(newTask);
    })
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

  // We should have a logged-in user by this point, but just checking for type safety
  if (!user) {
    return null;
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f1f4'}}>
      <View>
          <Text style={{
          width: '100%',
          height: 42,
          paddingLeft: 20,
          backgroundColor: '#fff',
          fontFamily: 'DMSans-Medium',
          fontSize: 18,
          lineHeight: 42,
          color: '#2b2928',
          }}> Hi, {user.name} </Text>
        </View>
      <ScrollView style={{margin: 20}}>
        <Text style={{
              width: '100%',
              marginBottom: 20,
              color: '#444444',
              fontSize: 14,
              lineHeight: 21, 
        }}>
        First, we need to ask you a few important questions about the person who died. 
        Your answers will help us personalize your path — and provide you with the right tasks 
        at the right time. All of this information is 100% private, safe, and secure.
        </Text>
        {questions && (
          <QuestionList
            userId={user.id}
            questions={questions}
            answers={answers}
            onChangeAnswer={onChangeAnswer}
          />
        )}
        <View>
          <PrimaryButton title="Next" onPress={() => saveAnswers(user.id, answers)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


