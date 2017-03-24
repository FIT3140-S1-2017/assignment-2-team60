function Fit3140() {
  this.checkSetup();
  this.initFirebase();
  this.loadMessages();
}

  Fit3140.prototype.initFirebase = function () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };


  Fit3140.prototype.loadMessages = function () {
    // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('motionSensorData');
    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    // Loads the last 50 messages and listen for new ones.
    var setMessage = function (data) {
      var val = data.val();
      this.displayMessage(val.action, val.id, val.time, val.type);
    }.bind(this);
    this.messagesRef.limitToLast(50).on('child_added', setMessage);
    this.messagesRef.limitToLast(50).on('child_changed', setMessage);
  };

  // Saves a new message on the Firebase DB.
  Fit3140.prototype.saveMessage = function (e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      action: 'off',
      id: 2,
      time: 123456, // you can use Date.now()
      type: 'motion'
    }).then(function () {
      console.log('Done')
    }.bind(this)).catch(function (error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  };

  Fit3140.prototype.displayMessage = function (action, id, time, type) {
    document.getElementById('msg').innerText = action + '  ' + time + '  ' + type;
  };


  // Checks that the Firebase SDK has been correctly setup and configured.
  Fit3140.prototype.checkSetup = function () {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
      window.alert('Your Firebase Storage bucket has not been enabled.');
    }
  };


window.onload = function () {
  window.Fit3140 = new Fit3140();
};