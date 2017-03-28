var express        = require('express');  
var app            = express();  
var httpServer = require("http").createServer(app);  
var five = require("johnny-five");  
var io = require('socket.io')(httpServer);
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://assignment2-500d8.firebaseio.com/"  // IMPORTANT: repalce the url with yours 
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var LongMotionData = db.ref("/Long Motion");
LongMotionData.on("value", function(snapshot) {   //this callback will be invoked with each new object
  console.log(snapshot.val());         // How to retrive the new added object
}, function (errorObject) {             // if error
  console.log("The read failed: " + errorObject.code);
});
var ShortMotionData = db.ref("/Short Motion");
ShortMotionData.on("value", function(snapshot) {   
  console.log(snapshot.val());         
}, function (errorObject) {            
  console.log("The read failed: " + errorObject.code);
});
var TotalMotionData = db.ref("/Total Motion");
TotalMotionData.on("value", function(snapshot) {   
  console.log(snapshot.val());         
}, function (errorObject) {            
  console.log("The read failed: " + errorObject.code);
});

// How to push new object
app.get('/', function(req,res){

		//send the index.html file for all requests
		res.sendFile(__dirname + '/index.html');
	});

httpServer.listen(3000, function(){

		console.log('listening on http://localhost:3000');
	});

//Connect to arduino
var board = new five.Board();
var led;
var motion;
board.on('ready', function(){ //to
		console.log('Arduino connected');
		led = new five.Led(13);

		motion = new five.Motion(2);

	});

var time1;
var time2;
var diff;
var total = 0;
var longmotion = 0;
var shortmotion = 0;
var bool;
var booldata= true;
var IntruderArray =[];
var Intruder=0;
//socket connection handler
io.on('connection', function(socket){
		
		socket.on('led:on',  function(data){
			led.on();
			console.log('Led is on!');
		});

		socket.on('led:off', function(data){
			led.off();
			console.log('Led is off!');
		});

		socket.on('motion:bool', function(data){
			bool = true;
		});

		socket.on('sensor:on', function(data){
			bool = true;
			console.log('Motion On!');
			motion.on("motionstart", function() {
				if (booldata==false){
					var LongMotionData = db.ref("/Long Motion");
					LongMotionData.on("value", function(snapshot) {   //this callback will be invoked with each new object
					snapshot.val();         // How to retrive the new added object
					}, function (errorObject) {             // if error
					console.log("The read failed: " + errorObject.code);
					});
					var ShortMotionData = db.ref("/Short Motion");
					ShortMotionData.on("value", function(snapshot) {   
					snapshot.val();         
					}, function (errorObject) {             
					console.log("The read failed: " + errorObject.code);
					});
					var TotalMotionData = db.ref("/Total Motion");
					TotalMotionData.on("value", function(snapshot) {   
					snapshot.val();         
					}, function (errorObject) {    
					console.log("The read failed: " + errorObject.code);
					});
					booldata=true;

				}
				if (bool === true){
					console.log("Motion Detected!");
					time1 = new Date().getTime();
					total++;
				}
			});

			motion.on("motionend", function() {
				if (bool === true){
					console.log("Motion ended! ");
					time2 = new Date().getTime();
					diff = time2 - time1;
					console.log("The time taken is " + diff/1000 + " seconds.");
					console.log("The total motion detected is " + total + "\n");
					socket.emit('total:motion', {motionno: total});
					if (diff > 5000){
						longmotion++;
						IntruderArray.push("long");
						TotalMotionData.push({id:'Long' ,type:'Motion' ,action:'Total Motion'});
						LongMotionData.push({id:'Long' ,type:'Motion' ,action:'Long Motion',time:diff/1000});
					} else{
						shortmotion++;
						IntruderArray.push("short");
						TotalMotionData.push({id:'Short' ,type:'Motion' ,action:'Total Motion'});
						ShortMotionData.push({id:'Short' ,type:'Motion' ,action:'Short Motion',time:diff/1000});
					};
					socket.emit('long:motion', {motionlong: longmotion});
					socket.emit('short:motion', {motionshort: shortmotion});
					socket.emit('intruder:motion',{motionIntruder: Intruder });
					if (IntruderArray.length==4){
						if (IntruderArray==['long','short','long','long']){
							Intruder++;
							socket.emit('intruder:motion',{motionIntruder: Intruder });
							IntruderArray=[];

						}
					}

				}
			});
		});

		socket.on('reset', function(data){
			total = 0;
			longmotion = 0;
		 	shortmotion = 0;
			Intruder=0;
			IntruderArray=[]
			socket.emit('total:motion', {motionno: total});
			socket.emit('long:motion', {motionlong: longmotion});
			socket.emit('short:motion', {motionshort: shortmotion});
			socket.emit('intruder:motion',{motionIntruder: Intruder });
			ShortMotionData.remove();
			LongMotionData.remove();
			TotalMotionData.remove();
			booldata=false;

		});

		socket.on('sensor:off', function(data){
			bool = false;
			console.log('Motion Off')
		});

	});


		
