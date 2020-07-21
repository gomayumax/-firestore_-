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

async function add(product, quantity){
  const user = {
    uid: '2hkCE7wqEg58sVYNxyr0'
  }

  // 商品がかごの中に入っているかどうかのチェック
  const item = await db
    .doc(`users/${user.uid}/items-in-cart/${product.id}`)
    .get()

  // 既に商品がかごに入っている場合
  if (item.exists) {
    await item.ref.update({
      quantity: admin.firestore.FieldValue.increment(quantity),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    return
  }

  // 商品がかごに入っていない場合
  await item.ref.set({
    product: {
      ref: db.doc(`products/${product.id}`)
    },
    quantity: admin.firestore.FieldValue.increment(quantity),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

async function getProductDocument (document) {
 return await db.collection('products').doc(document).get()
}

getProductDocument('bWDgh46LtdLrrMJceQo2').then((product) => {
  add(product, 2).then(r => console.log('add item to cart'))
})
