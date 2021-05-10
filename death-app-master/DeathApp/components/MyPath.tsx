/* eslint-disable prettier/prettier */
import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, Image, StyleSheet, TextInput, Dimensions } from 'react-native';
import { PrimaryButton, GhostButton } from './Button';
import { store } from '../AppContext';
import { Api } from '../api/Api';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ProgressBar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDatabase } from '../DatabaseContext';
import CheckBox from '@react-native-community/checkbox';
import { StackParamList } from '../App';
import { Footer } from './Footer';
import { DefaultBanner } from './Banner';
import { getTasksForCurrentUser } from '../selectors/tasksSelector';
import { categoryToDisplayText } from './Category';
import leaf from '../assets/images/leaf.png';
const { width } = Dimensions.get('window');

type EditTaskNavigationProp = StackNavigationProp<StackParamList, 'MyPath'>;


interface Props {
  navigation: EditTaskNavigationProp;
}

enum TaskDisplayType {
  priority,
  category,
}

export const MyPath: React.FC<Props> = (props: Props) => {
  const { navigation } = props;
  const globalState = useContext(store);
  const database = useDatabase();
  const { dispatch, user } = globalState;
  if (!user) {
    return null;
  }
  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);
  const [taskDisplayType, setTaskDisplayType] = useState(
    TaskDisplayType.priority,
  );

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

  // TODO: update this sorting logic when the enums are added
  let sortedTasks = [...tasks]
    .filter((t) => t.level === 1)
    .sort((a, b) => {
      if (a.priority === 'HIGH') {
        if (b.priority === 'HIGH') return 0;
        else return -1;
      } else if (b.priority === 'HIGH') return 1;
      else if (a.priority === 'MEDIUM') {
        if (b.priority === 'MEDIUM') return 0;
        else return -1;
      } else if (b.priority === 'MEDIUM') return 1;
      return 0;
    });

  if (selectedCategory !== undefined) {
    sortedTasks = sortedTasks.filter((t) => t.category === selectedCategory);
  }

  const taskStatusUpdateHandler = (uuid: string, status: 'PENDING' | 'COMPLETE') => {
    const task = tasks.find((t) => t.uuid === uuid);

    if (!task) {
      console.error(`Could not find a task with uuid ${uuid}`);
      return; // Should never get here, this indicates a problem. 
    }

    const updatedTask = {
      ...task,
      status: status === 'COMPLETE' ? 'PENDING' : 'COMPLETE',
    };

    return database
      .updateTask(updatedTask) // Update the task in SQLite DB
      .then(() => { // On success update the task in global state 
        Api.updateTasks(updatedTask)
          .then((response: any) => {
            console.log('response from update=> ', response)
          })
          .catch((error: Error) => {
            console.log(error)
          })
        dispatch({ type: 'EDIT_TASK_SAVED', task: updatedTask });
      }
      );
  };

  const taskNoteUpdateHandler = (uuid: string, note: string) => {
    const task = tasks.find((t) => t.uuid === uuid);

    if (!task) {
      console.error(`Could not find a task with uuid ${uuid}`);
      return; // Should never get here, this indicates a problem. 
    }

    const updatedTask = {
      ...task,
      note
    };

    dispatch({ type: 'EDIT_TASK_SAVED', task: updatedTask });
    // TODO we shouldn't update the DB on each keystroke, maybe just onBlur of the box?
    return database
      .updateTask(updatedTask) // Update the task in SQLite DB
      .then(() => { // On success update the task in global state 
        Api.updateTasks(updatedTask)
          .then((response) => {
            console.log('response from update=> ', response)
          })
          .catch(error => {
            console.log(error)
          })
      }
    );
  };

  const renderTaskContent = () => {

    const incompleteTasks = sortedTasks.filter((t) => t.status === 'PENDING');
    const completeTasks = sortedTasks.filter((t) => t.status === 'COMPLETE');
    const goToNewTask = () => {
      navigation.navigate('NewTask');
    }
  
    const newTaskButton = (
      <View style={styles.newBtnArea}>
        <PrimaryButton
          onPress={goToNewTask}
          title="New Task"
        />
      </View>
    )

    const taskContent =
      taskDisplayType == TaskDisplayType.priority ||
        selectedCategory !== undefined ? (
        <>
          <TasksByPriority 
            tasks={incompleteTasks} 
            navigation={navigation} 
            taskStatusUpdateHandler={taskStatusUpdateHandler}
            taskNoteUpdateHandler={taskNoteUpdateHandler}
             />
             {newTaskButton}
          <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: '#444', marginTop: 16 }}>
            Completed Tasks
          </Text>
          <TasksByPriority 
          tasks={completeTasks} 
          navigation={navigation} 
          taskStatusUpdateHandler={taskStatusUpdateHandler}
          taskNoteUpdateHandler={taskNoteUpdateHandler} 
          />
        </>
      ) : (
        <CategoryRows
          tasks={sortedTasks}
          setSelectedCategory={setSelectedCategory}
        />
      );
    return taskContent;
  }
  const buttonBar = (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
      {taskDisplayType === TaskDisplayType.priority ? (
        <PrimaryButton
          onPress={() => setTaskDisplayType(TaskDisplayType.priority)}
          title="By Priority"
        />
      ) : (
        <GhostButton
          onPress={() => setTaskDisplayType(TaskDisplayType.priority)}
          title="By Priority"
          fontSize={18}
        />
      )}
      {taskDisplayType === TaskDisplayType.category ? (
        <PrimaryButton
          onPress={() => setTaskDisplayType(TaskDisplayType.category)}
          title="By Category"
        />
      ) : (
        <GhostButton
          onPress={() => setTaskDisplayType(TaskDisplayType.category)}
          title="By Category"
          fontSize={18}
        />
      )}
    </View>
  );

  const backToCategoriesHeader = (
    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          marginBottom: 12,
          alignItems: 'center',
        }}
        onPress={() => setSelectedCategory(undefined)}>
        <Icon name="chevron-left"
              backgroundColor="transparent"
              color="#055a73"
              size={16} />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 21,
            color: "#055a73",
            fontFamily: 'DMSans-Medium',
            textDecorationLine: 'underline',
          }}>
          Back to All Categories
        </Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 21 }}>{selectedCategory}</Text>
    </View>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView>
          <DefaultBanner
            title="Its okay to not be okay."
            subtitle="Give yourself the time you need to grieve. This is hard. Have compassion and sympathy towards yourself. Don't be afraid to express your emotions."
          ></DefaultBanner>
          <View style={{ marginLeft: 18, marginRight: 18, marginTop: 18 }}>
            {selectedCategory === undefined ? buttonBar : backToCategoriesHeader}
            {renderTaskContent()}
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 50}}>
              <Image 
                source={require('../assets/images/parting-path-botanicals_botanical-1.png')} 
                resizeMode="contain" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Footer navigate={props.navigation.navigate} />
    </>
  );
};

interface TasksByPriorityProps {
  tasks: Task[];
  navigation: EditTaskNavigationProp;
  taskStatusUpdateHandler: (uuid: string, status: 'PENDING' | 'COMPLETE') => void;
  taskNoteUpdateHandler: (uuid: string, note: string) => void;
}

const TasksByPriority: React.FC<TasksByPriorityProps> = (
  props: TasksByPriorityProps,
) => {
  const globalState = useContext(store);
  const { dispatch } = globalState; // TODO: fix typings
  const { tasks, navigation, taskStatusUpdateHandler, taskNoteUpdateHandler } = props;
  const today = new Date();
  const [ notesToShow, setNotesToShow ] = useState<Set<string>>(new Set());

  return (
    <View>
      {tasks.map((t) => {
        // TODO: update this logic to account for months
        const numDaysLeftToComplete =
          t.dueDate !== null
            ? Math.abs(t.dueDate!.getDate() - today.getDate())
            : 0;
        return (
          <TouchableOpacity
            key={t.uuid}
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderColor: '#f0f1f4',
              borderRadius: 4,
              borderWidth: 2,
              marginBottom: 16,
            }}
            onPress={() => navigation.navigate('SubTask', { parentTaskUuid: t.uuid })}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginVertical: 8,
                marginHorizontal: 12,
              }}>
              <Text
                style={{
                  color: '#777777',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 13,
                  textTransform: "uppercase",
                }}>
                {categoryToDisplayText(t.category)}
              </Text>
              {/* <View
                style={styles.titleCheckboxContainer}
              >
                <TouchableOpacity>
                  <CheckBox
                    disabled={false}
                    boxType={'square'}
                    value={t.status === 'COMPLETE' ? true : false}
                    tintColor={'#11B4C3'}
                    onCheckColor={'#11B4C3'}
                    onTintColor={'#11B4C3'}
                    animationDuration={0}
                    style={{ marginRight: 10 }}
                    onValueChange={() => taskStatusUpdateHandler(t.uuid, t.status)}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    marginVertical: 4,
                    textDecorationLine:
                      t.status === 'COMPLETE' ? 'line-through' : 'none',
                  }}>
                  {t.displayText}
                </Text>
              </View> */}
              <View>
                <Text
                style={{
                  fontFamily: 'DMSans-Regular',
                  fontSize: 18,
                  marginVertical: 4,
                  textDecorationLine:
                    t.status === 'COMPLETE' ? 'line-through' : 'none',
                }}>
                  {t.displayText}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: '#777777',
                  textAlign: 'right',
                }}>{`${t.subTasks.length} Subtasks`}</Text>
            </View>
            <View
              style={{
                marginTop: 6,
                backgroundColor: '#f0f1f4',
                display: 'flex',
                flexDirection: 'row',
                paddingVertical: 5,
                justifyContent: 'space-between',
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  minHeight: 22,
                  marginHorizontal: 12,
                  marginVertical: 5,
                  backgroundColor: getRibbonColorFromPriority(t.priority),
                  width: 4,
                  borderRadius: 4,
                }}
                />
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ fontSize: 11, color: '#2b2928' }}>
                    {getPriorityTextFromPriority(t.priority)}
                  </Text>
                  {t.status === 'COMPLETE' ? (
                    <Text style={{ fontSize: 9, }}>Complete</Text>
                  ) : (
                    t.dueDate !== null && (
                      <Text style={{ fontSize: 9, color: '#777' }}>{`Complete within ${numDaysLeftToComplete} days`}</Text>
                    )
                  )}
                </View>
              </View>
              {t.status !== 'COMPLETE' && (
                <Icon.Button
                  name="edit"
                  size={24}
                  color="#11b4c3"
                  onPress={() => {
                    dispatch({ type: 'EDIT_TASK', taskUuid: t.uuid });
                    navigation.navigate('EditTask');
                  }}
                  backgroundColor={'transparent'}
                  style={{ alignSelf: 'flex-end' }}
                />
              )}
            </View>
            {/* <View style={{ width: '100%', padding: 10 }}>
              <TouchableOpacity onPress={() => {
                const newNotesToShow = new Set(notesToShow);
                if (notesToShow.has(t.uuid)) {
                  newNotesToShow.delete(t.uuid);
                } else {
                  newNotesToShow.add(t.uuid);
                }
                setNotesToShow(newNotesToShow);
              }}>
                <Text style={styles.hide}>{!notesToShow.has(t.uuid) ? 'My Notes' : 'Hide Notes'}</Text>
              </TouchableOpacity>
              {notesToShow.has(t.uuid) &&
                <>
                  <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>Notes</Text>
                  <TextInput
                    onChangeText={(text) => taskNoteUpdateHandler(t.uuid, text)}
                    value={t.note || undefined}
                    style={styles.textarea}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholder="Keep track of any personal notes, questions, or concerns here"
                  />
                </>
              }
            </View> */}
          </TouchableOpacity>
        );
      })}
    </View>

  );
};

interface TaskInfo {
  numComplete: number;
  tasks: Task[];
}

interface CategoryRowsProps {
  tasks: Task[];
  setSelectedCategory: (category: string) => void;
}
const CategoryRows: React.FC<CategoryRowsProps> = (
  props: CategoryRowsProps,
) => {
  const { tasks, setSelectedCategory } = props;
  const categoryToTaskMapping: { [category: string]: TaskInfo } = {};
  tasks.forEach((t) => {
    if (categoryToTaskMapping[t.category] === undefined) {
      categoryToTaskMapping[t.category] = { numComplete: 0, tasks: [] };
    }
    const currentVal = categoryToTaskMapping[t.category];
    categoryToTaskMapping[t.category] = {
      numComplete:
        t.status === 'COMPLETE'
          ? currentVal!.numComplete + 1
          : currentVal!.numComplete,
      tasks: [...currentVal!.tasks, t],
    };
  });

  return (
    <>
      {Object.keys(categoryToTaskMapping).map((c) => {
        const numComplete = categoryToTaskMapping[c].numComplete;
        const total = categoryToTaskMapping[c].tasks.length;
        return (
          <TouchableOpacity
            key={c}
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderColor: '#f0f1f4',
              borderRadius: 4,
              borderWidth: 2,
              marginBottom: 12,
            }}
            onPress={() => setSelectedCategory(c)}>
            <Text
              style={{
                marginTop: 12,
                marginHorizontal: 12,
                fontSize: 13,
                textTransform: 'uppercase',
              }}>
              {categoryToDisplayText(c)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#777777',
                marginHorizontal: 12,
                lineHeight: 21,
              }}>{`${numComplete}/${total} Tasks Complete`}</Text>
            <ProgressBar
              progress={numComplete / total}
              color="#f4d58d"
              style={{
                marginTop: 25,
                marginBottom: 45,
                marginHorizontal: 12,
                borderRadius: 10,
                height: 10,
                backgroundColor: '#cccccc',
              }}
            />
          </TouchableOpacity>
          
        );
      })}
    </>
  );
};

export const getRibbonColorFromPriority = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return '#ae2b0a';
    case 'MEDIUM':
      return '#faa65a';
    case 'LOW':
      return '#cde7ee';
    default:
      return '';
  }
};

export const getPriorityTextFromPriority = (priority: string): string => {
  switch (priority) {
    case 'HIGH':
      return 'High Priority';
    case 'MEDIUM':
      return 'Medium Priority';
    case 'LOW':
      return 'Low Priority';
    default:
      return '';
  }
};

const styles = StyleSheet.create({
  newBtnArea: {
    width: '100%',
    marginTop: 24,
    marginBottom: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#055A73',
    height: 50,
    borderRadius: 30,
    paddingHorizontal: 25
  },
  btnTxt: {
    fontWeight: '600',
    fontSize: 20,
    color: 'white'
  },
  hide: {
    alignSelf: 'flex-end',
    textDecorationLine: 'underline',
    color: '#055a73'
  },
  textarea: {
    width: '100%',
    borderRadius: 5,
    fontSize: 18,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10
  },
  titleCheckboxContainer: {
    flexDirection: 'row', marginVertical: 8
  },
  leafImg: {
    width: width * 0.7,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    height: width * 0.7
  }
})