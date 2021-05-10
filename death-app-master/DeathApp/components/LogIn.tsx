import React, {useState, useContext} from 'react';
import {View, Text, TextInput, ScrollView, SafeAreaView} from 'react-native';
import {PrimaryButton, GhostButton} from './Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../App';
import {store} from '../AppContext';
import {styles} from '../styles/common';
import {signIn} from '../authentication/signIn';

type LoginScreenNavigationProp = StackNavigationProp<StackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LogIn: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const {dispatch} = globalState; // TODO why are the types here broken?

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const clearFields = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <SafeAreaView>
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
          Signing Back In
        </Text>
      </View>
      
      <ScrollView style={{marginTop: 12, marginHorizontal: 20}}>
        <Text style={{
          fontFamily: 'DMSans-Regular',
          marginBottom: 20,
        }}>
          We're glad to see you're back. Lorem ipsum any other text you might want to say here to be supportive or encouraging. 
        </Text>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
          {globalState.user && <Text>Welcome {globalState.user.email}</Text>}
          {!!error && <Text style={{color: 'red', margin: 4}}>{error}</Text>}
          <Text style={styles.textInputLabel}>Email*</Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
            placeholder={'Enter your email'}
            value={email}
          />
          <Text style={styles.textInputLabel}>Password*</Text>
          <TextInput
            style={{...styles.textInput, marginBottom: 30}}
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
            placeholder={'Enter your password'}
            secureTextEntry={true}
            value={password}
          />
          <PrimaryButton
            title={'Submit'}
            onPress={() =>
              signIn(
                email,
                password,
                setError,
                clearFields,
                dispatch,
                props.navigation.navigate,
              )
            }
          />
          <View style={{ marginTop: -10}}>
            <GhostButton
              title={'Forgot password?'}
              onPress={() => props.navigation.navigate('ResetPassword')}
            />
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
