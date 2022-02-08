import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

// Get a Firestore instance
const firebaseApp = firebase
  .initializeApp({ apiKey: 'AIzaSyA3adHgrxcRU7iRpukUFpPV15Icf236WZY',
    authDomain: 'conceptc-carte-cadeaux.firebaseapp.com',
    databaseURL: 'https://conceptc-carte-cadeaux-default-rtdb.firebaseio.com/',
    projectId: 'conceptc-carte-cadeaux',
    storageBucket: 'conceptc-carte-cadeaux.appspot.com',
    messagingSenderId: '65201083590',
    appId: '1:65201083590:web:c203e1f8061dbf339b33c7' })

const firebaseApp2 = firebase
  .initializeApp({ apiKey: 'AIzaSyA3adHgrxcRU7iRpukUFpPV15Icf236WZY',
    authDomain: 'conceptc-carte-cadeaux.firebaseapp.com',
    databaseURL: 'https://conceptc-carte-cadeaux-default-rtdb.firebaseio.com/',
    projectId: 'conceptc-carte-cadeaux',
    storageBucket: 'conceptc-carte-cadeaux.appspot.com',
    messagingSenderId: '65201083590',
    appId: '1:65201083590:web:c203e1f8061dbf339b33c7' }, 'Secondary')

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }
export const db = firebaseApp.firestore()
export const rtdb = firebaseApp.database()
export const auth = firebaseApp.auth()
export const auth2 = firebaseApp2.auth()
