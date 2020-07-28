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

exports.order = functions.https.onCall(async (data, { auth }) => {
  // 未認証の場合はエラー
  // if (auth === undefined) {
  //   throw new functions.https
  //     .HttpsError('unauthenticated', 'authorization required')
  // }
  // トランザクションの開始
  const orderId = await admin.firestore()
    .runTransaction(async (transaction) => {
      // 注文の合計金額
      let billingAmount = 0

      // かごの中身を取得
      const items = await transaction.get(admin.firestore()
        .collection(`users/${auth.uid}/items-in-cart`)
        .where('quantity', '>', 0))

      // かごが空だった場合はエラー
      if (items.empty) {
        throw new functions.https
          .HttpsError('failed-precondition', 'cart is empty')
      }

      // 注文明細の作成
      const details = []
      await Promise.all(items.docs.map((item) => {
          const product = transaction.get(item.get('product.ref'))

          // 在庫チェック
          if (product.get('stock') < item.get('quantity')) {
            throw new functions.https
              .HttpsError('failed-precondition', 'no enough stock')
          }

          details.push({
            ref: item.get('product.ref'),
            name: product.get('name'),
            photoURL: product.get('photoURL'),
            price: product.get('price'),
            quantity: item.get('quantity'),
          })

          // 合計金額に加算
          billingAmount += product.get('price') * item.get('quantity')
        }
      ))

      // for (const item of items.docs) {
      //   const product = await transaction.get(item.get('product.ref'))
      //
      //   // 在庫チェック
      //   if (product.get('stock') < item.get('quantity')) {
      //     throw new functions.https
      //       .HttpsError('failed-precondition', 'no enough stock')
      //   }
      //
      //   details.push({
      //     ref: item.get('product.ref'),
      //     name: product.get('name'),
      //     photoURL: product.get('photoURL'),
      //     price: product.get('price'),
      //     quantity: item.get('quantity'),
      //   })
      //
      //   // 合計金額に加算
      //   billingAmount += product.get('price') * item.get('quantity')
      // }
      // 会員情報から発送先の住所を取得
      const user = await transaction
        .get(admin.firestore().doc(`users/${auth.uid}`))

      // 注文ドキュメントの作成
      const order = admin.firestore()
        .collection(`users/${auth.uid}/orders`).doc()
      await transaction.set(order, {
        details: details,
        billingAmount: billingAmount,
        shippingAddress: {
          name: user.get('name'),
          address: user.get('address'),
          phoneNumber: user.get('phoneNumber')
        },
        status: 'ORDERED',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      // 在庫数の減算
      for (const detail of details) {
        transaction.update(detail.ref, {
          stock: admin.firestore.FieldValue.increment(-1 * detail.quantity),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }

      // かごの中身を空にする
      items.forEach((snapshot) => transaction.delete(snapshot.ref))

      return order.id
    })

  // Callable Functionsの戻り値として注文書IDを返す
  return { id: orderId }
})
