import auth from '@react-native-firebase/auth';

export const signOut = async (dispatch: (action: LogOutAction) => void, navigate: (destination: string) => void) => {
    try {
        await auth().signOut();
        dispatch({ type: 'LOG_OUT' });
        navigate('Welcome');
    } catch(error) {
        console.log(`Unable to log the user out ${error}`);
    }
};