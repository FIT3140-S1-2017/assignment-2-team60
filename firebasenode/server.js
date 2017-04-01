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
var sensordb = db.ref("/motionSensorData"); // channel name
var motiondb = db.ref("/Motion");


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
var intruder;

sensordb.on("value", function(snapshot) {   //this callback will be invoked with each new object
	var datasensor = snapshot.val();         // How to retrive the new added object
	console.log(datasensor);
	if (datasensor === 'null'){
		sensordb.push({totaldata:0, longdata:0, shortdata:0, intruderdata:0});
	}
}, function (errorObject) {             // if error
	console.log("The read failed: " + errorObject.code);
});

sensordb.on("child_added", function(snapshot){
	total = snapshot.val().totaldata;
	longmotion = snapshot.val().longdata;
	shortmotion = snapshot.val().shortdata;
	intruder = snapshot.val().intruderdata;
	console.log("total: " + total);
	console.log("longmotion: " + longmotion);
	console.log("shortmotion: " + shortmotion);
	console.log("intruder: " + intruder);
});



var bool = false;
var time1;
var time2;
var diff;
var once = 0;
var list;
var compare = ["long", "short", "long", "long"];

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
				list = [];
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
						total++;
						console.log(diff);
						if (diff > 5000){
							longmotion++;
							list.push("long");
						} else{
							shortmotion++;
							list.push("short");
						};
						console.log(list);
						if (list.length === 4){
							var a = compare.toString();
							var b = list.toString();
							if (a === b){
								intruder++;
								list.splice(0, 4);
							}else{
								list.splice(0, 1);
							}
						}
						sensordb.push({totaldata:total, longdata:longmotion, shortdata:shortmotion, intruderdata:intruder});
					}
				});
			}else{
				if (bool === true){
					console.log("Motion end");
					time2 = new Date().getTime();
					diff = time2 - time1;
					total++;
					console.log(diff);
					if (diff > 5000){
						longmotion++;
						list.push("long");
					} else{
						shortmotion++;
						list.push("short");
					};
					console.log(list);
					if (list.length === 4){
						var a = compare.toString();
						var b = list.toString();
						if (a === b){
							intruder++;
							list.splice(0, 4);
						}else{
							list.splice(0, 1);
						}
					}
					sensordb.push({totaldata:total, longdata:longmotion, shortdata:shortmotion, intruderdata:intruder});
				}
			}
		}else{
			bool = false;
		}
	}
}, function (errorObject) {             // if error
  console.log("The read failed: " + errorObject.code);
});
