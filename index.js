// [START firestore_deps]
var admin = require("firebase-admin");

const serviceAccount = require("./config/serviceAccountKey.json");

// https://github.com/firebase/snippets-node/blob/d769695bd1159103e7c877849ccaccab3db37039/firestore/main/index.js#L41
function initializeAppSA() {
  // [START initialize_app_service_account]

  // let serviceAccount = require('path/to/serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  let db = admin.firestore();

  // [END initialize_app_service_account]
  return db;
}

const db = initializeAppSA();

function getUsers() {
  // https://github.com/firebase/snippets-node/blob/d769695bd1159103e7c877849ccaccab3db37039/firestore/main/index.js#L41
  db.collection('users').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
}

function getProducts() {
  // https://github.com/firebase/snippets-node/blob/d769695bd1159103e7c877849ccaccab3db37039/firestore/main/index.js#L41
  db.collection('products').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
}

getProducts();
