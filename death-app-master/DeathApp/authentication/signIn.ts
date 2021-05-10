import auth from '@react-native-firebase/auth';


const errorCodes = [
    'auth/wrong-password',
    'auth/user-not-found', 
    'auth/invalid-email'
];

export const signIn = async (
    email: string, 
    password: string, 
    setError: (error: string) => void,
    clearFields: () => void,
    dispatch: (action: LogInAction) => void,
    navigate: (destination: string) => void,
    ) => {

    setError("");
    try {
        const res = await auth().signInWithEmailAndPassword(email, password);
        const { uid, displayName } = res.user;

        clearFields();
        dispatch({ type: 'LOG_IN', email, uid, name: displayName });
        navigate('Home');
    } catch(error) {
        if (errorCodes.includes(error.code)) {
            setError('The email or password is incorrect');
        }
        console.error(error);
    }
};
