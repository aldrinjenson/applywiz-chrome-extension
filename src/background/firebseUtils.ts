import firebase from '../fbConfig';

export const handleEmailSignin = async (email: string, password: string) => {
  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('User logged in:', user);
    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Login error:', errorCode, errorMessage);
  }
};

export const handleSignOut = async () => {
  try {
    await firebase.auth().signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
