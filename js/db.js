// offline data
// This is doing all the legwork for data persistence and db syncing for offline behavior and when connection is re-established.
db.enablePersistence()
  .catch(err => {
    if(err.code === 'failed-precondition'){
      // probably multiple tabs open at once
      console.log('persistence failed - multiple tabs opened');
    }
    else if(err.code === 'unimplemented'){
      // lack of browser support
      console.log('persistence is not available - lack of browser support');
    }
  })

// real-time listener
// Reference db and call on 'recipes' collection set up in Firebase.
// onSnapshot() method is a listener on the 'recipes' collection. If there is a change to the collection, then Firebase will return a snapshot of the db at that moment.
db.collection('recipes').onSnapshot(snapshot => {
  // console.log(snapshot.docChanges());  // Can see db changes in browser by using .docChanges() method on the snapshot object. This is returns an array of changes. [{type: "added", doc: pd, ...}, {type: "removed", doc: pd, ...}]
  snapshot.docChanges().forEach(change => {
    // console.log(change, change.doc.data(), change.doc.id);
    if(change.type === "added") {
      // add the document data to the web page
      renderRecipe(change.doc.data(), change.doc.id)
    }
    if(change.type === "removed") {
      // remove the document data from the web page
    }
  }) 
})