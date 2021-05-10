import React, { useState } from 'react';
import {
  ScrollView,
  SafeAreaView,
  Text,
  TextInput,
} from 'react-native';
import { PrimaryButton } from './Button';
import auth from '@react-native-firebase/auth';
import { styles } from '../styles/common';

const sendResetEmail = async (
    email: string, 
    clearFields: () => void,
    setError: (error: string) => void,
    setInfo: (info: string) => void,
    ) => {
    try {
        await auth().sendPasswordResetEmail(email);
        clearFields();
        setInfo("Sent password reset email");
    } catch (error) {
        setError("Unable to send password re-set email");
        console.error(error);
    }
}

export const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const clearFields = () => {
        setEmail("");
        setError("");
    }

    return (
        <SafeAreaView style={{ flex: 1 }} >
            <ScrollView style={{ margin: 18}}>
                <Text style={{color: "#333", margin: 8}}>{"We will send a reset link to the email address provided below"}</Text>
                {!!error && 
                    <Text style={{color: "red", margin: 4}}>{error}</Text>
                }
                {!!info && 
                    <Text style={{color: "#333", margin: 4}}>{info}</Text>
                }
                <TextInput 
                    style={{ ...styles.textInput, marginBottom: 18 }}
                    autoCapitalize = 'none'
                    onChangeText={(text) => setEmail(text)} placeholder={"Email"} 
                    value={email} />
                <PrimaryButton
                    title={"Submit"}
                    onPress={() => sendResetEmail(
                        email, 
                        clearFields,
                        setError,
                        setInfo
                    )}
                /> 
            </ScrollView>
        </SafeAreaView>
    )
};
