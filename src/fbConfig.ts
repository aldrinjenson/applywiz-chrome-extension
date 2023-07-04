import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
// import 'dotenv/config';

// Your web app's Firebase configuration

// const firebaseConfig = {
//   apiKey: process.env.APIKEY,
//   authDomain: process.env.AUTHDOMAIN,
//   projectId: process.env.PROJECTID,
//   storageBucket: process.env.STORAGEBUCKET,
//   messagingSenderId: process.env.MESSAGINGSENDERID,
//   appId: process.env.APPID,
// };

console.log(process.env);
console.log(process.env.APPID);

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};

console.log(firebaseConfig);

if (!firebase?.apps?.length) {
  firebase?.initializeApp(firebaseConfig);
}

export default firebase;
export const firestore = firebase.firestore();
