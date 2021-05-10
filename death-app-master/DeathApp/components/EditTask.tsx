import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import { store } from '../AppContext';
import { Api } from '../api/Api';
// import { styles } from '../styles/common';
import { Picker } from '@react-native-picker/picker';
import { Category, categoryToDisplayText } from './Category';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Priority, priorityToDisplayText } from './Priority';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { PrimaryButton, CancelButton } from './Button';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App';
import { useDatabase } from '../DatabaseContext';
import {getTasksForCurrentUser} from '../selectors/tasksSelector';

type BackToTasksNavigationProp = StackNavigationProp<
  StackParamList,
  'EditTask'
>;

interface Props {
  navigation: BackToTasksNavigationProp;
}

export const EditTask: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const { dispatch, taskBeingEditedId, user } = globalState;
  const { navigation } = props;

  const database = useDatabase();
  if (!user) {
      return null;
  }

  const tasks = getTasksForCurrentUser(user.id, globalState.tasks);
  // We know that the task uuid that we have here will exist in the list of tasks
  const taskBeingEdited = tasks.find((t: Task) => t.uuid === taskBeingEditedId)!;

  const [name, setName] = useState(taskBeingEdited.displayText);
  const [category, setCategory] = useState(taskBeingEdited.category);
  const [dueDate, setDueDate] = useState(taskBeingEdited.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(taskBeingEdited.priority);

  const updateTask = () => {
    const task: TaskUpsert = {
      ...taskBeingEdited,
      displayText: name,
      category,
      dueDate,
      priority
    }
    return database
      .updateTask(task)
      .then(() => {

        const updatedTaskForRDB = {
          ...task,
          isDeleted: false
        }
        Api.updateTasks(updatedTaskForRDB)
          .then((response) => {
            console.log('response from update=> ', response)
          })
          .catch(error => {
            console.log(error)
          })
        dispatch({ type: 'EDIT_TASK_SAVED', task });
        navigation.navigate('MyPath');
      }
      );
  };

  return (
    <View style={customStyles.container}>
    <View style={customStyles.notification}>
      <AntDesign name="exclamationcircleo" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
      <Text>Make sure to save your changes below</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
      <Icon name="angle-left" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
      <TouchableOpacity onPress={() => navigation.navigate('MyPath')}>
        <Text style={customStyles.back}>Back to My Tasks</Text>
      </TouchableOpacity>
    </View>
    <ScrollView>
      <View style={customStyles.formContainer}>
        <Text style={customStyles.textInputLabel}>Task Name</Text>
        <TextInput
          style={{ ...customStyles.textInput, marginBottom: 24 }}
          autoCapitalize="none"
          onChangeText={(text: string) => setName(text)}
          placeholder={'Schedule an initial appointment'}
          value={name}
        />
        <Text style={customStyles.textInputLabel}>Category</Text>
        <View style={{ ...customStyles.textInput, padding: 0, marginBottom: 24}}>
          <Picker
            style={{
              padding: 12,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#333',
            }}
            selectedValue={category}
            onValueChange={(v) => setCategory(v)}>
            {Object.values(Category)
              .filter((k) => typeof k === 'string')
              .map((k) => (
                <Picker.Item key={k} label={categoryToDisplayText(k)} value={k} />
              ))}
          </Picker>
        </View>


        <Text style={customStyles.textInputLabel}>Complete By</Text>
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
          {showDatePicker && (
            <DateTimePicker
              style={{ width: '100%' }}
              testID="dateTimePicker"
              value={dueDate ? dueDate : new Date()}
              mode={'date'}
              is24Hour={false}
              display="default"
              onChange={(event: any, date) => {
                setShowDatePicker(false);
                setDueDate(date === undefined ? null : date);
              }}
            />
          )}
        </View>


        <View
          style={{
            flexDirection: 'column',
            marginVertical: 18,
          }}>
          <Text style={customStyles.textInputLabel}>Priority</Text>
          <View style={{ ...customStyles.textInput, padding: 0 }}>
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

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <PrimaryButton title="Save" onPress={() => updateTask()} />
          <CancelButton title="Cancel" onPress={() => navigation.navigate('MyPath')} />
        </View>

      </View>
    </ScrollView>
  </View >
  );
};

const customStyles = StyleSheet.create({
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
  }
});