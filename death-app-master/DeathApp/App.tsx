import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Welcome } from './components/Welcome';
import { About } from './components/About';
import { Home } from './components/Home';
import { SignUp } from './components/SignUp';
import { LogIn } from './components/LogIn';
import { ResetPassword } from './components/ResetPassword';
import { StateProvider } from './AppContext';
import { styles } from './styles/common';
import { RequiredInfo } from './components/RequiredInfo';
import { AllQuestions } from './components/AllQuestions';
import { DatabaseProvider } from './DatabaseContext';
import { MyPath } from './components/MyPath';
import { NewTask } from './components/NewTask';
import { NewSubTask } from './components/NewSubTask';
import { SubTask } from './components/SubTask';
import { Profile } from './components/Profile';
import { EditTask } from './components/EditTask';
import { EditProfile } from './components/EditProfile';
import { ResourcesList, ResourcesLanding } from './components/Resources'; 


export type StackParamList = {
  Welcome: undefined;
  About: undefined;
  Home: undefined;
  SignUp: undefined;
  LogIn: undefined;
  ResetPassword: undefined;
  RequiredInfo: undefined;
  AllQuestions: undefined;
  MyPath: undefined;
  NewTask: undefined;
  NewSubTask: undefined;
  SubTask: undefined;
  Profile: undefined;
  EditTask: undefined;
  EditProfile: undefined;
  ResourcesList: undefined;
  ResourcesLanding: undefined;
};

const Stack = createStackNavigator<StackParamList>();

const profileButton = (navigate: (destination: string) => void) => (
  <Icon.Button
    name="user-circle"
    size={24}
    backgroundColor="transparent"
    color="#11b4c3"
    onPress={() => navigate('Profile')}
  />
)

const App: () => React.ReactElement = () => {
  return (
    <NavigationContainer>
      <DatabaseProvider>
        <StateProvider>
          <Stack.Navigator 
          initialRouteName={'Welcome'}
          >
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{
                headerLeft: () => null,
                headerStyle: styles.header,
              }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={({ navigation }) => ({
                title: 'Home',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null, // Don't allow the user to go "back" from the home screen
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="MyPath"
              component={MyPath}
              options={({ navigation }) => ({
                title: 'My Path',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="ResourcesList"
              component={ResourcesList}
              options={({ navigation }) => ({
                title: 'Resources',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="ResourcesLanding"
              component={ResourcesLanding}
              options={({ navigation }) => ({
                title: 'Resources',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="AllQuestions"
              component={AllQuestions}
              options={({ navigation }) => ({
                title: 'All questions',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{
                title: 'Get started',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
              }}
            />
            <Stack.Screen
              name="LogIn"
              component={LogIn}
              options={{
                title: 'Log in',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
              }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPassword}
              options={{
                title: 'Reset password',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
              }}
            />
            <Stack.Screen
              name="RequiredInfo"
              component={RequiredInfo}
              options={{
                title: 'Required Info',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
              }}
            />
            <Stack.Screen
              name="NewTask"
              component={NewTask}
              options={({ navigation }) => ({
                title: 'New Task',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="NewSubTask"
              component={NewSubTask}
              options={({ navigation }) => ({
                title: 'New Subtask',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="SubTask"
              component={SubTask}
              options={({ navigation }) => ({
                title: 'My Path',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
            <Stack.Screen
              name="Profile"
              component={Profile}
              options={({ navigation }) => ({
                title: 'My Profile',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => (
                  <Icon.Button
                    name="edit"
                    size={24}
                    backgroundColor="transparent"
                    color="#11b4c3"
                    onPress={() => navigation.navigate('EditProfile')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{ 
                title: 'Edit Profile', 
                headerStyle: styles.header, 
                headerTitleStyle: styles.headerTitleStyle,
              }}
            />
            <Stack.Screen
              name="EditTask"
              component={EditTask}
              options={({ navigation }) => ({
                title: 'Edit Task',
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitleStyle,
                headerLeft: () => null,
                headerRight: () => profileButton(navigation.navigate),
              })}
            />
          </Stack.Navigator>
        </StateProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
};

export default App;
