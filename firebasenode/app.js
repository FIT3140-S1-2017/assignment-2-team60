var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project1-cb101.firebaseio.com/"  // IMPORTANT: repalce the url with yours 
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/motionSensorData"); // channel name
ref.on("value", function(snapshot) {   //this callback will be invoked with each new object
  console.log(snapshot.val());         // How to retrive the new added object
}, function (errorObject) {             // if error
  console.log("The read failed: " + errorObject.code);
});

ref.remove();
// How to push new object
ref.push({
    id:1,
    type:'motion',
    action:'on',
    time:12346789
});

var data = [{
  id: 1,
  type: 'led',
  action: 'off',
  time: 1
}, {
  id: 2,
  type: 'led',
  action: 'on',
  time: 2
}, {
  id: 3,
  type: 'motion',
  action: 'off',
  time: 3
}, {
  id: 4,
  type: 'motion',
  action: 'on',
  time: 4
}];

var index = 0; //index for array data
/**
 * The setInterval() method calls a function or evaluates an expression at specified intervals (in milliseconds).
   The setInterval() method will continue calling the function until clearInterval() is called, or the window is closed.
   The ID value returned by setInterval() is used as the parameter for the clearInterval() method.
*/
var pnt = setInterval(function () { //pnt pointer to setInterval
  ref.push(data[index]);
  index++; // increate the index by one
  console.log('index='+index)
  if (index == data.length)
    clearInterval(pnt);
}, 3000); // delay is 1000ms