import auth from '@react-native-firebase/auth';

const validate = (
    email: string,
    password: string, 
    confirmPassword: string, 
    hasAcceptedTaC: boolean): string => {
    if (!email) {
        return "Please enter a valid email address";
    }
    if (!hasAcceptedTaC) {
        return "Please accept the terms and conditions";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match";
    }

    return "";
}

// TODO find or make types for user
// TODO test this flow on the phone itself
const verifyEmail = async (user: any) => {
    try {
        await user.sendEmailVerification();
        // Email sent
    } catch(error) {
        console.log(error);
    }
}

export const createUser = async (
    name: string,
    email: string, 
    password: string, 
    confirmPassword: string,
    hasAcceptedTaC: boolean,
    setError: (error: string) => void,
    dispatch: (action: LogInAction) => void,
    navigate: (destination: string) => void,
    ) => {
    setError("");
    const validationError = validate(email, password, confirmPassword, hasAcceptedTaC);
    if (validationError) {
        setError(validationError);
        return; 
    } 

    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);

        const { user } = userCredential;
        console.log(user);
        const { uid } = user;
        dispatch({ type: 'LOG_IN', email, uid, name });
        navigate("RequiredInfo");

        // TODO Fix the verify email
        /*
        if (user) {
            await userCredential.user.updateProfile({ displayName: name });
        
            const { uid } = user;

            verifyEmail(user); // This sends an email so I'm hoping we can just fire and forget

            dispatch({ type: 'LOG_IN', email, uid, name });
            navigate("RequiredInfo");
        }*/
    } catch(error) {
        switch(error.code) {
            case 'auth/email-already-in-use':
                // This might not be a good idea to keep in the app long term
                // It gives a lot of info about which emails already exist in our system
                setError('That email address is already in use!');
                break;
            case 'auth/invalid-email':
                setError('Please enter a valid email address');
                break;
            default:
                console.error(error);
                setError('Unknown login error');
        }    
    }
};
