import React, {useState, useContext} from 'react';
import {View, Text, TextInput, ScrollView, SafeAreaView} from 'react-native';
import {PrimaryButton, GhostButton} from './Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../App';
import CheckBox from '@react-native-community/checkbox';
import {createUser} from '../authentication/signUp';
import {store} from '../AppContext';
import {styles} from '../styles/common';

type SignUpScreenNavigationProp = StackNavigationProp<StackParamList, 'Signup'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUp: React.FC<Props> = (props) => {
  const globalState = useContext(store);
  const {dispatch} = globalState; // TODO why are the types here broken?

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [hasAcceptedTaC, setHasAcceptedTaC] = useState(false);

  return (
    <SafeAreaView style={{flex: 1}}>
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
        }}>
          Create My Account
        </Text>
      </View>
      <ScrollView style={{marginTop: 12, marginHorizontal: 20}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text
            style={{
              width: '100%',
              marginBottom: 20,
              color: '#444444',
              fontSize: 14,
              lineHeight: 21, 
            }}>
            We guide you through the aftermath of a death one step at a time. 
            Create a free account to receive essential tasks, resources, tools, and reminders 
            to take care of yourself.
          </Text>
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
          <Text style={styles.textInputLabel}>First name*</Text>
          <TextInput
            style={{...styles.textInput, marginBottom: 24}}
            autoCapitalize="none"
            onChangeText={(text) => setName(text)}
            placeholder={'Enter your first name'}
            value={name}
          />
          <Text style={styles.textInputLabel}>Email*</Text>
          <TextInput
            style={{...styles.textInput, marginBottom: 24}}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
            placeholder={'Enter your email'}
            value={email}
          />
          <Text style={styles.textInputLabel}>Password*</Text>
          <TextInput
            style={{...styles.textInput, marginBottom: 24}}
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
            placeholder={'Create your password'}
            secureTextEntry={true}
            value={password}
          />
          <Text style={styles.textInputLabel}>Confirm Password*</Text>
          <TextInput
            style={{...styles.textInput}}
            autoCapitalize="none"
            onChangeText={(text) => setConfirmPassword(text)}
            placeholder={'Confirm your password'}
            secureTextEntry={true}
            value={confirmPassword}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '90%',
              marginBottom: 30,
            }}>
            <CheckBox
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]}}
              disabled={false}
              boxType={'square'}
              value={hasAcceptedTaC}
              tintColor={'#777777'}
              onFillColor={'#11b4c3'}
              onCheckColor={'#fff'}
              onTintColor={'#11b4c3'}
              onValueChange={(newValue) => setHasAcceptedTaC(newValue)}
              onAnimationType={'fade'}
              offAnimationType={'fade'}
            />
            <Text
              style={{
                marginLeft: 0,
                marginTop: -3, 
                fontSize: 16,
                fontFamily: 'DMSans-Medium',
              }}>
              {' '}
              I agree to the <Text 
            onPress={() => navigate('')} 
            style = {{
              color: '#055a73', 
              textDecorationLine: 'underline',
            }}>terms and conditions
          </Text>
            </Text>
          </View>
          <PrimaryButton
            onPress={() =>
              createUser(
                name,
                email,
                password,
                confirmPassword,
                hasAcceptedTaC,
                setError,
                dispatch,
                props.navigation.navigate,
              )
             }
            title="Create account"
          />
          <Text
          style={{
            fontFamily: 'DMSans-Regular',
            fontSize: 16,
            color: '#444444',
            marginBottom: 24,
          }}>
          Already a member? <Text 
            onPress={() => props.navigation.navigate('LogIn')} 
            style = {{
              color: '#055a73', 
              textDecorationLine: 'underline',
            }}>Log in
          </Text>
          </Text>              
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
