//import liraries
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../App';
import { store } from '../AppContext';
import { useDatabase } from '../DatabaseContext';
import { v4 as uuidv4 } from 'uuid';
import { Api } from '../api/Api';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';
import { Category, categoryToDisplayText } from './Category';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Priority, priorityToDisplayText } from './Priority';
import CheckBox from '@react-native-community/checkbox';
import { PrimaryButton, CancelButton } from './Button';

type EditTaskNavigationProp = StackNavigationProp<StackParamList, 'NewTask'>;

interface Props {
  navigation: EditTaskNavigationProp;
}

// create a component
export const NewTask: React.FC<Props> = (props: Props) => {
  const { navigation } = props;
  const globalState = useContext(store);
  const { user, dispatch } = globalState;
  const database = useDatabase();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [hasAcceptedTaC, setHasAcceptedTaC] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(Category.firstSteps);
  const [priority, setPriority] = useState<Priority>(Priority.High);
  const [name, setName] = useState('');

  const addTask = () => {
    if (name.length) {

      const newTask: Task = {
        uuid: uuidv4(),
        userId: user?.id,
        displayText: name,
        dueDate,
        priority,
        subTasks: [],
        status: "PENDING",
        note: "",
        category,
        level: 1,
        taskTemplateId: null,
        isDeleted: false,
      };

      database.updateTask(newTask)
        .then(() => {
          Api.updateTasks(newTask)
            .then((response) => {
            })
            .catch(error => {
              console.log(error)
            })
          dispatch({ type: 'UPDATE_TASKS', tasks: [newTask] })

        })
        .catch(error => console.error(error));

    }
    else
      setError('Please fill Task Name field')

  }

  return (
    <View style={styles.container}>
      <View style={styles.notification}>
        <AntDesign name="exclamationcircleo" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
        <Text>Make sure to save your changes below</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
        <Icon name="angle-left" size={20} color="#11b4c3" style={{ marginRight: 10 }} />
        <TouchableOpacity onPress={() => navigation.navigate('MyPath')}>
          <Text style={styles.back}>Back to My Tasks</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.formContainer}>
          {!!error && (
            <Text
              style={{
                color: 'red',
                textAlign: 'left',
                marginBottom: 18,
                width: '90%',
              }}>
              {error}
            </Text>
          )}
          <Text style={styles.textInputLabel}>Task Name</Text>
          <TextInput
            style={{ ...styles.textInput, marginBottom: 24 }}
            autoCapitalize="none"
            onChangeText={(text: string) => setName(text)}
            placeholder={'Schedule an initial appointment'}
            value={name}
          />
          <Text style={styles.textInputLabel}>Category</Text>
          <View style={{ ...styles.textInput, padding: 0, marginBottom: 24}}>
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

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <PrimaryButton title="Save" onPress={addTask} />
            <CancelButton title="Cancel" onPress={() => navigation.navigate('MyPath')} />
          </View>

        </View>
      </ScrollView>
    </View >
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
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    width: '100%',
  },
});