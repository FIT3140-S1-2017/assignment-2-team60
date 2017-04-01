var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var five = require("johnny-five");  
// var io = require('socket.io')(httpServer);
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project1-cb101.firebaseio.com/"  // IMPORTANT: repalce the url with yours 
});

//Connect to arduino
var board = new five.Board();
var led;
var motion;
board.on('ready', function(){
	console.log('Arduino connected');
	led = new five.Led(13);

	motion = new five.Motion(2);
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();

var leddb = db.ref("/LED"); // channel name

// if (leddb === null){
// 	leddb.push({id:'LED', type:'OFF'});
// }else{
// 	leddb.update({id:'LED', type:'OFF'});
// }
var ledcounter = 0;
leddb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	var dataled = snapshot.val();         // How to retrive the new added object
	console.log(dataled);
	if (ledcounter === 0){
		ledcounter++
		if (dataled !== 'null'){
			leddb.update({id:'LED', type:'OFF'});
		}else{
			leddb.push({id:'LED', type:'OFF'});
		}
	}else{
		var ledtype = snapshot.val().type;
		if (ledtype === 'ON'){
			led.on();
		}else{
			led.off();
		}
	}
}, function (errorObject) {             // if error
	console.log("The read failed: " + errorObject.code);
});



var total;
var longmotion;
var shortmotion;

var sensordb = db.ref("/motionSensorData"); // channel name

sensordb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	var datasensor = snapshot.val();         // How to retrive the new added object
	console.log(datasensor);
	total = snapshot.val().totaldata;
	longmotion = snapshot.val().longdata;
	shortmotion = snapshot.val().shortdata;
	console.log("total: " + total);
	console.log("longmotion: " + longmotion);
	console.log("shortmotion: " + shortmotion);
}, function (errorObject) {             // if error
	console.log("The read failed: " + errorObject.code);
});



var bool = false;
var time1;
var time2;
var diff;
var once = 0;
var motiondb = db.ref("/Motion");

var motioncounter = 0;
motiondb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	datamotion = snapshot.val();
	console.log(datamotion);         // How to retrive the new added object
	if (motioncounter === 0){
		motioncounter++
		if (datamotion !== 'null'){
			motiondb.update({id:'motion', type:'OFF'});
		}else{
			motiondb.push({id:'motion', type:'OFF'});
		}
	}else{
		var motiontype = snapshot.val().type;
		if (motiontype === 'ON'){
			bool = true;
			if (once === 0){
				motion.on("motionstart", function() {
					if (bool === true){
						console.log("Motion start");
						time1 = new Date().getTime();
					}
				});
			}else{
				if (bool === true){
					console.log("Motion start");
					time1 = new Date().getTime();
				}
			}
			if (once === 0){
				once++;
				motion.on("motionend", function() {
					if (bool === true){
						console.log("Motion end");
						time2 = new Date().getTime();
						diff = time2 - time1;
						total = total + 1;
						console.log(diff);
						if (diff > 5000){
							longmotion = longmotion + 1;
						} else{
							shortmotion= shortmotion +1;
						};
						sensordb.update({id:'data', totaldata:total, longdata:longmotion, shortdata:shortmotion});
					}
				});
			}else{
				if (bool === true){
					console.log("Motion end");
					time2 = new Date().getTime();
					diff = time2 - time1;
					total = total + 1;
					console.log(diff);
					if (diff > 5000){
						longmotion = longmotion + 1;
					} else{
						shortmotion= shortmotion +1;
					};
					sensordb.update({id:'data', totaldata:total, longdata:longmotion, shortdata:shortmotion});
				}
			}
		}else{
			bool = false;
		}
	}
}, function (errorObject) {             // if error
  console.log("The read failed: " + errorObject.code);
});



		
