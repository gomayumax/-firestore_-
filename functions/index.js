const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.updateItemsInCart = functions.firestore
  .document('users/{uid}/items-in-cart/{item}')
  .onUpdate(async (change) => {
    if (change.after.get('quantity') <= 0) {
      await change.after.ref.delete()
    }
  })

exports.deleteDocumentZeroQuantity = functions.firestore
  .document('users/{uid}/item-in-cart/{item}')
  .onUpdate(async (change) =>{
    if (change.after.get('quantity') <= 0) {
      await change.after.ref.delete()
    }
  })
