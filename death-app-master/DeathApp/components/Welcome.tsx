import React, {useContext, useEffect, Dispatch} from 'react';
import {View, Text, Image, SafeAreaView} from 'react-native';
import {PrimaryButton, GhostButton} from './Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../App';
import auth from '@react-native-firebase/auth';
import {store} from '../AppContext';

type WelcomeScreenNavigationProp = StackNavigationProp<
  StackParamList,
  'Welcome'
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

// Enable auto-login if the user is online
// TODO support auto-login offline if the user is already logged in to the device
export const onAuthStateChange = (
  dispatch: Dispatch<Action>,
  navigate: WelcomeScreenNavigationProp,
) => {
  return auth().onAuthStateChanged((user) => {
    if (user) {
      dispatch({
        type: 'LOG_IN',
        email: user.email,
        uid: user.uid,
        name: user.displayName,
      });
      navigate('Home');
    } else {
      dispatch({type: 'LOG_OUT'});
    }
  });
};

export const Welcome: React.FC<Props> = (props) => {
  const {navigate} = props.navigation;
  const globalState = useContext(store);
  const {dispatch} = globalState; // TODO why are the types here broken?

  useEffect(
    () => {
      const unsubscribe = onAuthStateChange(dispatch, navigate);
      return () => {
        unsubscribe();
      };
    },
    [
      /* Only on the first load */
    ],
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff', }}>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10,}}>
        <Text
          style={{
            textAlign: 'center',
            // TODO import this font
            marginBottom: 35,
            fontFamily: 'DMSans-Medium',
            fontWeight: '800',
            fontSize: 16,
            lineHeight: 21,
            color: '#777',
          }}>
          GRANATE
        </Text>
        <View style={{width: 208, height: 202, marginBottom: 18}}>
          <Image
            style={{
              width: 197,
              height: 143,
              marginBottom: -230,
              marginLeft: -10,
              marginTop: 40,
            }}
            source={require('./blob_1.png')}
          />
          <Image
            style={{
              width: 180,
              height: 180,
              borderRadius: 100,
              marginLeft: 20,
              marginTop: 40,
            }}
            source={require('./waves.jpeg')}
          />
        </View>
        <Text
          style={{
            textAlign: 'center',
            // TODO import this font
            width: 290,
            marginBottom: 12,
            fontFamily: 'Lora',
            fontWeight: '600',
            fontSize: 26,
            lineHeight: 32,
            color: '#2b2928',
          }}>
          Your guide to a life after death.
        </Text>
        {globalState.user && <Text>Welcome {globalState.user.email}</Text>}
        <Text
          style={{
            width: 339,
            marginBottom: 57,
            fontFamily: 'DMSans-Regular',
            fontSize: 14,
            lineHeight: 21,
            color: '#444444',
            textAlign: 'center',
          }}>
          We're here to help you navigate what comes next.
        </Text>
        <PrimaryButton title="Get Started" onPress={() => navigate('SignUp')} />
        <Text
          style={{
            marginTop: 5,
            fontFamily: 'DMSans-Regular',
            fontSize: 16,
            color: '#444444',
          }}>
          Already a member? <Text 
            onPress={() => navigate('LogIn')} 
            style = {{
              color: '#055a73', 
              textDecorationLine: 'underline',
            }}>Log in
          </Text>
        </Text>  
      </View>
    </SafeAreaView>
  );
};
