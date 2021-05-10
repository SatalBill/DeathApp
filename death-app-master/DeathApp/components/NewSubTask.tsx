//import liraries
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App';
import { Api } from '../api/Api';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';
import { store } from '../AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Priority, priorityToDisplayText } from './Priority';
import CheckBox from '@react-native-community/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { PrimaryButton, CancelButton } from './Button';
import { useDatabase } from '../DatabaseContext';
import {getTasksForCurrentUser} from '../selectors/tasksSelector';

type EditTaskNavigationProp = StackNavigationProp<StackParamList, 'NewSubTask'>;

interface Props {
  navigation: EditTaskNavigationProp;
  route: any; // TODO fix typings
}

// create a component
export const NewSubTask: React.FC<Props> = (props: Props) => {
  const { navigation, route } = props;
  const { parentTaskUuid } = route.params;
  const globalState = useContext(store);
  const database = useDatabase();

  const { dispatch, user } = globalState;
  if (!user) {
    return null;
  }

  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);
  const parentTask = tasks.find((t) => t.uuid === parentTaskUuid );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [hasAcceptedTaC, setHasAcceptedTaC] = useState(false);
  const [note, setNote] = useState("");

  if (!parentTask || !user ) {
    return null;
  }

  const [priority, setPriority] = useState(parentTask.priority);
  const [name, setName] = useState('');

  const addSubTask = () => {

    const subTaskUuid = uuidv4();
    const newSubTask: Task = {
      uuid: subTaskUuid,
      userId: user.id,
      displayText: name,
      dueDate, // Should this be the same as the parent task? Or does only the parent have a due date?
      priority,
      subTasks: [],
      status: "PENDING",
      note,
      category: parentTask.category,
      level: 2,
      taskTemplateId: null,
      isDeleted: false,
    };

    const updatedParentTask: Task = {
      ...parentTask,
      subTasks: [ ...parentTask.subTasks, subTaskUuid ],
    };

    // TODO this is pretty ugly, let's at least condense these requests
    database.updateTask(newSubTask)
    .then(() => {

      Api.updateTasks(newSubTask)
        .then((response) => {
        })
        .catch(error => {
          console.log(error)
        });
      dispatch({ type: 'UPDATE_TASKS', tasks: [newSubTask] })
    })
    .catch(error => console.error(error));

    database.updateTask(updatedParentTask)
    .then(() => {
      Api.updateTasks(updatedParentTask)
        .then((response) => {
        })
        .catch(error => {
          console.log(error)
        });
        dispatch({ type: 'EDIT_TASK_SAVED', task: updatedParentTask });

    })
    .catch(error => console.error(error));

    navigation.navigate('SubTask');
  }

  return (
    <View style={styles.container}>
      <View style={styles.notification}>
        <AntDesign name="exclamationcircleo" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
        <Text>Make sure to save your changes below</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
        <Icon name="angle-left" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
        <TouchableOpacity onPress={() => navigation.navigate('SubTask')}>
          <Text style={styles.back}>Back to Subtasks</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.formContainer}>
          <Text style={styles.textInputLabel}>Subtask Name</Text>
          <TextInput
            style={{ ...styles.textInput, marginBottom: 24 }}
            autoCapitalize="none"
            onChangeText={(text: string) => setName(text)}
            placeholder={'Schedule an initial appointment'}
            value={name}
          />

          <Text style={styles.textInputLabel}>Complete By</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                padding: 12,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#333',
                flexDirection: 'row',
                width: '50%',
                marginVertical: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{ fontSize: 18, color: '#777777' }}>
                {dueDate !== null ? dueDate.toDateString() : null}
              </Text>
              <Icon name="calendar" size={16} color="#11b4c3" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '40%' }}>
              <CheckBox
                disabled={false}
                boxType={'square'}
                value={hasAcceptedTaC}
                tintColor={'#11b4c3'}
                onCheckColor={'#11b4c3'}
                onTintColor={'#11b4c3'}
                onValueChange={(newValue) => setHasAcceptedTaC(newValue)}
              />
              <Text style={{ fontSize: 17 }}>Default Date</Text>
            </View>
          </View>
          {showDatePicker && (
            <DateTimePicker
              style={{ width: '100%' }}
              testID="dateTimePicker"
              value={dueDate ? dueDate : new Date()}
              mode={'date'}
              is24Hour={false}
              display="default"
              onChange={(event: any, date) => {
                setShowDatePicker(false); // this must be upper than setDueDate func
                setDueDate(date === undefined ? null : date);
              }}
            />
          )}

          <View
            style={{
              flexDirection: 'column',
              marginVertical: 18,
            }}>
            <Text style={styles.textInputLabel}>Priority</Text>
            <View style={{ ...styles.textInput, padding: 0 }}>
              <Picker
                selectedValue={priority}
                onValueChange={(v) => setPriority(v)}>
                {Object.values(Priority)
                  .filter((k) => typeof k === 'string')
                  .map((k) => (
                    <Picker.Item key={k} label={priorityToDisplayText(k)} value={k} />
                  ))}
              </Picker>
            </View>
          </View>

          <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>Notes</Text>
          <TextInput
            onChangeText={setNote}
            value={note}
            style={styles.textarea}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Keep track of any personal notes, questions, or concerns here"
          />

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 40,
              marginBottom: 80
            }}>
            <PrimaryButton title="Save" onPress={addSubTask} />
            <CancelButton title="Cancel" onPress={() => navigation.navigate('SubTask')} />
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  back: {
    fontSize: 20,
    color: '#055a73',
    textDecorationLine: 'underline'
  },
  notification: {
    width: '100%',
    height: 44,
    backgroundColor: '#cde7ee',
    flexDirection: 'row',
    paddingLeft: 30,
    alignItems: 'center',
  },
  textInputLabel: {
    width: '100%',
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
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
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 18
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
});