import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState, useContext} from 'react';
import {Text, View} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackParamList} from '../App';
import {store} from '../AppContext';
import {styles} from '../styles/common';
import {PrimaryButton, SecondaryButton} from './Button';
import auth from '@react-native-firebase/auth';

type SaveProfileNavigationProp = StackNavigationProp<
  StackParamList,
  'EditProfile'
>;

interface Props {
  navigation: SaveProfileNavigationProp;
}

export const EditProfile: React.FC<Props> = (props: Props) => {
  const globalState = useContext(store);
  const {user, dispatch} = globalState;
  const {navigation} = props;

  // We know that the user is logged in at this point so we'll use this throughout
  const currentUser = user!;

  const [name, setName] = useState(
    currentUser.name === null ? undefined : currentUser.name,
  );
  const [email, setEmail] = useState(
    currentUser.email === null ? undefined : currentUser.email,
  );

  const saveProfile = () => {
    const updateNameReq = auth().currentUser?.updateProfile({displayName: name});
    const updateEmailReq = auth().currentUser?.updateEmail(
      email === undefined ? '' : email,
    );
    Promise.all([updateEmailReq, updateNameReq]).then((res) => {
      console.log(res);
      dispatch({type: 'EDIT_PROFILE', name: name, email: email});
      navigation.navigate('Profile');
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{margin: 18}}>
        <View>
          <EditRow label="Name" value={name} setText={setName} />
          <EditRow label="Email" value={email} setText={setEmail} />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}>
            <SecondaryButton
              title="Cancel"
              onPress={() => navigation.navigate('Profile')}
            />
            <PrimaryButton title="Save" onPress={saveProfile} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface EditRowProps {
  label: string;
  value?: string;
  setText: (v: string) => void;
  editable?: boolean;
}

const EditRow: React.FC<EditRowProps> = (props: EditRowProps) => {
  const {label, value, setText, editable = true} = props;
  return (
    <View>
      <Text style={styles.textInputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={(v) => setText(v)}
        editable={editable}></TextInput>
    </View>
  );
};
