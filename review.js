// [START firestore_deps]
var admin = require("firebase-admin");
var firebase = require("firebase");

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
const user = {
  uid: '2hkCE7wqEg58sVYNxyr0'
}
