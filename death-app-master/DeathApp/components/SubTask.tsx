import React, { useState, useContext } from 'react';
import { useDatabase } from '../DatabaseContext';
import { Text, View, Image, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App';
import CheckBox from '@react-native-community/checkbox';
import leaf from '../assets/images/leaf.png';
import { getTasksForCurrentUser } from '../selectors/tasksSelector';
import { store } from '../AppContext';
import { categoryToDisplayText } from './Category';
const { width, } = Dimensions.get('window');

type BackToTasksNavigationProp = StackNavigationProp<
  StackParamList,
  'SubTask'
>;

interface Props {
  navigation: BackToTasksNavigationProp;
  route: any; // TODO fix the typings
}

export const SubTask: React.FC<Props> = (props: Props) => {
  const { navigation, route } = props;
  const { parentTaskUuid } = route.params;
  const globalState = useContext(store);
  const database = useDatabase();

  const [ notesToShow, setNotesToShow ] = useState<Set<string>>(new Set());

  const { user, dispatch, taskTemplates } = globalState;
  if (!user) {
    return null;
  }

  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);

  // We know the parent task must exist by the time we have gotten to this page
  const parentTask = tasks.find((t) => t.uuid === parentTaskUuid)!;

  // The parent task template may be undefined if this is a custom task
  let parentTaskTemplate: TaskTemplate;
  if (parentTask) {
    parentTaskTemplate = taskTemplates.find((tt) => tt.id === parentTask.taskTemplateId)!;
  }

  // Need to include the sub-task uuids, not the tempalate ids
  const subTasksData = tasks.filter((t) => parentTask.subTasks.includes(t.uuid));

  const newSubTask = () => {
    navigation.navigate('NewSubTask', { parentTaskUuid: parentTaskUuid });
  }
  const changeCheck = (uuid: string, status: "PENDING" | "COMPLETE") => {
    // We know this task must exist if we are already viewing/editing it
    const task = tasks.find((t) => t.uuid === uuid)!;
    const updatedTask = {
      ...task,
      status
    };

    return database
      .updateTask(updatedTask)
      .then(() => {
        /*
        Api.updateTasks(updatedTaskForRDB)
          .then((response) => {
            console.log('response from update=> ', response)
          })
          .catch(error => {
            console.log(error)
          })
          */
        dispatch({ type: 'EDIT_TASK_SAVED', task: updatedTask });
      }
    );
  };

  const onChangeNote = (uuid: string, note: string) => {
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
        /*Api.updateTasks(updatedTask)
          .then((response) => {
            console.log('response from update=> ', response)
          })
          .catch(error => {
            console.log(error)
          })
        */
      }
    );
  };

  const renderCompleteTasks = () => {
    const completedTasks = subTasksData.filter(t => t.status === "COMPLETE")
    return (
      <>
      {completedTasks.
        map((t) => (
          <View key={t.uuid} style={styles.completedchk}>
            <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox
                disabled={false}
                boxType={'square'}
                value={t.status === "COMPLETE"}
                tintColor={'#11B4C3'}
                onCheckColor={'#11B4C3'}
                onTintColor={'#11B4C3'}
                animationDuration={0}
                style={{ marginRight: 10 }}
                onValueChange={() => changeCheck(t.uuid, "PENDING")}
              />
              <Text style={styles.content}>{t.displayText}</Text>
            </View>
          </View>
        ))}
        </>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ margin: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
          <Icon name="angle-left" size={20} color="#055a73" style={{ marginRight: 10 }} />
          <TouchableOpacity onPress={() => navigation.navigate('MyPath')}>
            <Text style={styles.back}>Back to My Tasks</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Text style={styles.planning}>{categoryToDisplayText(parentTask.category)} | </Text>
            <Text style={styles.high}>{parentTask.priority}</Text>
          </View>
          <Text style={styles.title}>{parentTask.displayText}</Text>
          <Text style={styles.des}>{parentTaskTemplate?.extraInfo}<Text style={styles.readmore}>Read more</Text> </Text>
        </View>
        {
          subTasksData
            .filter(t => t.status === "PENDING")
            .map((t) => (
              <View key={t.uuid} style={styles.subTaskContainer}>
                <View style={styles.topCont}>
                  <View style={styles.txtCont}>
                    <View style={styles.markBar}></View>
                    <View>
                      <Text>Complete by {t.dueDate && t.dueDate.toLocaleString().split(',')[0]}</Text>
                      <Text style={{ fontSize: 11 }}>{t.priority} Priority</Text>
                    </View>
                  </View>
                  <View style={styles.iconGroup}>
                    <TouchableOpacity><MaterialCommunityIcons name="calendar-today" color="#11B4C3" size={25} /></TouchableOpacity>
                    <TouchableOpacity><Ionicons name="share-social-outline" color="#11B4C3" size={25} /></TouchableOpacity>
                    <TouchableOpacity><Icon name="edit" color="#11B4C3" size={25} /></TouchableOpacity>
                  </View>
                </View>
                <View style={{ padding: 9 }}>
                  <View style={styles.chkboxGroup}>
                    <CheckBox
                      disabled={false}
                      boxType={'square'}
                      value={t.status === "COMPLETE"}
                      tintColor={'#11B4C3'}
                      onCheckColor={'#11B4C3'}
                      onTintColor={'#11B4C3'}
                      animationDuration={0}
                      style={{ marginRight: 10 }}

                      onValueChange={() => changeCheck(t.uuid, t.status === "COMPLETE" ? "PENDING" : "COMPLETE")}
                    />
                    <View>
                      <Text style={styles.subtitle}>{t.displayText}</Text>
                      {notesToShow.has(t.uuid) && <Text style={{ fontSize: 11 }}><Text style={{ fontWeight: 'bold' }}>Editor's Tip:</Text>TODO Pull extra info from the task template if applicable</Text>}
                    </View>
                  </View>
                  <View style={{ width: '100%', paddingVertical: 10 }}>
                    <TouchableOpacity onPress={() => {
                const newNotesToShow = new Set(notesToShow);
                if (notesToShow.has(t.uuid)) {
                  newNotesToShow.delete(t.uuid);
                } else {
                  newNotesToShow.add(t.uuid);
                }
                setNotesToShow(newNotesToShow);
              }}><Text style={styles.hide}>{!notesToShow.has(t.uuid) ? 'My Notes' : 'Hide Notes'}</Text></TouchableOpacity>
                    {notesToShow.has(t.uuid) &&
                      <>
                        <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>Notes</Text>
                        <TextInput
                          onChangeText={(text) => onChangeNote(t.uuid, text)}
                          value={t.note || undefined}
                          style={styles.textarea}
                          multiline={true}
                          numberOfLines={4}
                          textAlignVertical="top"
                          placeholder="Keep track of any personal notes, questions, or concerns here"
                        />
                      </>
                    }
                  </View>
                </View>
              </View>
            ))
        }
        <View>
          <Text>Completed Subtasks</Text>
          {
            renderCompleteTasks()
          }
          <TouchableOpacity style={styles.createBtn} onPress={newSubTask}>
            <Text style={styles.btnTxt}>Create a New Subtask</Text>
          </TouchableOpacity>
        </View>
        <Image source={leaf} style={styles.leafImg} resizeMode="contain" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  textInput: {
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: 'DMSans-Medium',
    width: '100%',
    fontSize: 18,
    padding: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  textInputLabel: {
    width: '100%',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
  },
  homepageHeader: {
    fontSize: 26,
    fontFamily: 'Lora',
    color: '#2b2928',
  },
  back: {
    fontSize: 20,
    color: '#055a73',
    textDecorationLine: 'underline'
  },
  planning: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    color: '#666',
  },
  high: {
    fontSize: 12,
    fontFamily: 'DM Sans',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lora',
  },
  des: {
    fontSize: 15,
    fontFamily: 'DM Sans',
    lineHeight: 25,
    marginBottom: 40
  },
  readmore: {
    textDecorationLine: 'underline',
    color: '#055a73',
  },
  subTaskContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10
  },
  iconGroup:
  {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    justifyContent: 'space-around'
  },
  chkboxGroup:
  {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  subtitle: {
    fontSize: 17,
    marginVertical: 4
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
  completedchk: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10
  },
  content: {
    textDecorationLine: 'line-through',
    fontSize: 15
  },
  createBtn: {
    alignSelf: 'center',
    marginVertical: 20,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#055a73",
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  btnTxt: {
    color: 'white',
    fontWeight: '700',
    fontSize: 17
  },
  topCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  txtCont: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%'
  },
  markBar: {
    width: 4,
    height: 30,
    margin: 7,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'red'
  },
  leafImg: {
    width: width * 0.7,
    alignSelf: 'center',
    height: width * 0.7
  }
})