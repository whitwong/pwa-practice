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
    if(change.type === "added") {
      // add the document data to the web page
      renderRecipe(change.doc.data(), change.doc.id)    // Function defined in ui.js
    }
    if(change.type === "removed") {
      // remove the document data from the web page
      removeRecipe(change.doc.id);                      // Function defined in ui.js
    }
  }) 
})

// add new recipe
// Query select <form> tag and set a 'submit' event listener on that form.
const form = document.querySelector('form');
form.addEventListener('submit', evt => {
  // Prevent default action of refreshing the page
  evt.preventDefault();

  // Document to save to db
  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };

  // Add document to db in specified collection
  db.collection('recipes').add(recipe)
    .catch(err => console.log(err))

  // Reset form values to empty strings
  form.title.value = '';
  form.ingredients.value = '';
});

// delete recipe
// Query select recipes class and add click event listener to items in <div> containing recipes class
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt => {
  // If user selects trashcan icon, get the 'data-id' attribute of the icon from the DOM so that we can delete the correct recipe doc from db.
  // Select the doc from recipes collection with matching id and delete doc from collection.
  // This change is captured by onSnapshot() listener, so we can update the DOM accordingly.
  if(evt.target.tagName === "I") {
    const id = evt.target.getAttribute('data-id');
    db.collection('recipes').doc(id).delete();
  }
});