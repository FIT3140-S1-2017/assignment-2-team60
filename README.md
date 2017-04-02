# assignment-2-team60
Team 60 -Assignment2
Name: Chuen Wern Wai (26077086), Kin Seng Chan (25656716).

This assignment consist of Intruder Counter for Task 1, project scope and risk register.


Packages are used for Task 2 Assignment 1, which are:
  Google Firebase:  It is a real time communication database. It is a communication platform for the server and the client side so that both of them can pass data to each other.
	Johnny Five: 	It is a platform for Javascript robotics and IOT. It is used to connect the Arduino board.
	HTML:			The interface for the client side so that user are able to perform action.
	Node.js:		A file that consists all actions of the Aruino board and send information to firebase so that user are able to use the application.


Hardware that are used for this assignment:
	Arduino board.
	LED light.
	Motion sensor.
	an USB cable to connect Arduino board to the machine(desktop / laptop).
	Few wires to connect the motion sensor and LED light to the Arduino board.


To setup the Arduino board for Intruder Counter:
	To connect the LED:
		Plug in the positive side of the LED to the Port 13.
		Plug in the negative side of the LED to the GND.

	To connect the motion sensor:
		Plug in Out to Port 2.
		Plug in VCC to 5V.
		Plug in GND of PIR to GND of Arduino board.

	Lastly, plug in Arduino board to machine (desktop / laptop).


In order for it to work properly, Node.js, Johnny five and firebase are required to be installed. Open the LXTerminal and write the lines given below:
	$ npm install express
	$ npm install johnny-five
	$ npm install firebase-admin --save
  $ npm install -g firebase-tools


To run Intruder Counter:
	Step 1. Open Arduino IDE
	Step 2. Go File > Examples > Firmata > StandardFirmataPlus
	Step 3. Connect Arduino board and click upload StandardFirmataPlus 
	Step 4. Open Terminal
  Step 5. Change the directory to where all the files are located.
  Step 6. Type instruction "firebase serve"
  Step 7. Open another Terminal
	Step 8. Type instruction "node server.js" 
	Step 9. Terminal will show that Arduino board connected.
	Step 10. Go to browser, open http://localhost:5000/.


Last but not least, user are able to perform actions from the client side which are:
	Switching the LED on and off.
	Switching the motion sensor on and off.
	Display total number of motion detected from the motion sensor.
	Display total number of long and short motion detected from the motion sensor.
  Display total number of intrusion.
  A reset button to reset all the motion values.
  
  
To consider that there is an intrusion, the motion sensor will need to have a sequence of motion, "Long Short Long Long", which Long is motion that is more than 5 seconds and Short is motion that is less than 5 seconds.


To understand how firebase work:
Firstly, firebase is used to store all the data such as action to on/of the LED and motion sensor, total number of motion detected, total number of long and short motion, total number of intrusion and lastly, reset value to reset all the motion values.
After that, when all hardware and software are all connected, LED and motion sensor will always be off once the code has been run. If there is motion values exists in the firebase, the server side will eventually continue using the values and continue adding values to them. When user click the button on/off for the LED and motion sensor, a value will be sent to firebase such as "ON" to on them or "OFF" to of them. In the server side, it will retrieve the data from firebase and perform actions to turn the LED or motion sensor on/off. When the motion sensor detects a motion, it will increase the value of total motion. If the motion is more than 5 seconds, it will increase the value of long motion. If the motion is less than 5 seconds, it will increase the value of short motion. After that, the values will be psuh to firebase. A file called, firebaseWebApi.js will retrieve the motion values so that they can be displayed on the client side. Once users click on the reset button, it will then push to firebase where all the motion values will be 0. On the client side, it will always retrieve the newest pushed values in the firebase to continue the increment of the motion values.



