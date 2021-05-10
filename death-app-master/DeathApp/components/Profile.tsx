import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useContext} from 'react';
import {Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StackParamList} from '../App';
import {store} from '../AppContext';
import {signOut} from '../authentication/signOut';
import {GhostButton} from './Button';
import {Footer} from './Footer';

type LogoutNavigationProp = StackNavigationProp<StackParamList, 'Profile'>;

interface Props {
  navigation: LogoutNavigationProp;
}

export const Profile: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const {user} = globalState;
  const {dispatch} = globalState;
  const {navigate} = props.navigation;

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView style={{margin: 18}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <View
              style={{
                height: 76,
                width: 76,
                borderRadius: 38,
                backgroundColor: '#dadada',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 15,
              }}>
              <Icon name="user" size={55} color="#11b4c3" />
            </View>
            {user?.name && <Text>{user?.name}</Text>}
            <Text onPress={() => navigate('EditProfile')}>{user?.email}</Text>
            <GhostButton
              onPress={() => signOut(dispatch, navigate)}
              title="Log out"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    <Footer navigate={navigate} />
    </>
  );
};
