#define DEBUG true

#define DEVICE Serial1
#define COMPUTER Serial

const byte numChars = 32;
char receivedChars[numChars];
boolean newData = false;

const int ledPin = LED_BUILTIN;
int ledState = LOW;
unsigned long previousMillis = 0;
const long interval = 250;

void setup()
{
	// start serial
	COMPUTER.begin(38400);
	DEVICE.begin(38400);

	// activate LED pin
	pinMode(ledPin, OUTPUT);
}

void loop()
{
	// blink onboard LED
	blinkLED();

	// receive a message
	receiveMessage();

	// parse the message
	parseMessage();
}

void receiveMessage()
{
	static boolean recvInProgress = false;
	static byte i = 0;

	char startMarker = '«';
	char endMarker = '»';

	char rc;

	// if there are bytes in the buffer
	while (DEVICE.available() > 0 && newData == false)
	{
		// read a byte
		rc = DEVICE.read();

		// if we haven't started a new message
		if (recvInProgress == false)
		{
			// check if the byte is the start marker
			if (rc == startMarker)
			{
				// if it is, start a new message
				recvInProgress = true;
			}
		}
		// if we are reading a message
		else
		{
			// check if the byte is the end marker
			if (rc != endMarker)
			{
				// if it isn't, add it to the message string
				receivedChars[i] = rc;

				// increment the index
				i++;
				if (i >= numChars)
				{
					i = numChars - 1;
				}
			}
			else
			{
				// if it is, end the message string
				receivedChars[i] = '\0';

				// reset the message reader
				recvInProgress = false;
				i = 0;
				newData = true;
			}
		}
	}
}

void parseMessage()
{
	// if the message is finished
	if (newData == true)
	{

		// if debug, print it
		if (DEBUG)
		{
			COMPUTER.print("»»» ");
			COMPUTER.println(receivedChars);
		}

		// mouse position
		if (receivedChars[0] == 77) // M
		{

			// get the x value
			char *command = strtok(&receivedChars[1], ",");
			int x = atoi(command);

			// get the y value
			command = strtok(0, ",");
			int y = atoi(command);

			// move the mouse
			Mouse.move(x, y);
		}

		// mouse click
		if (receivedChars[0] == 67) // C
		{

			switch (receivedChars[1])
			{
			case '0':
				// unclick
				Mouse.set_buttons(0, 0, 0);

				if (DEBUG)
				{
					COMPUTER.println("UNCLICK");
				}
				break;
			case '1':
				// left click
				Mouse.set_buttons(1, 0, 0);

				if (DEBUG)
				{
					COMPUTER.println("LEFT CLICK");
				}
				break;
			case '2':
				// middle click
				Mouse.set_buttons(0, 1, 0);

				if (DEBUG)
				{
					COMPUTER.println("MIDDLE CLICK");
				}
				break;
			case '3':
				// right click
				Mouse.set_buttons(0, 0, 1);

				if (DEBUG)
				{
					COMPUTER.println("RIGHT CLICK");
				}
				break;
			}
		}

		// scroll
		if (receivedChars[0] == 83) // S
		{
			// write to keyboard
			Mouse.scroll(atoi(&receivedChars[1]));
		}

		// keyboard
		if (receivedChars[0] == 75) // K
		{
			// write to keyboard
			Keyboard.print(&receivedChars[1]);
		}

		// reset the new message flag
		newData = false;
	}
}

void blinkLED()
{
	// check to see if it's time to blink the LED; that is, if the difference
	// between the current time and last time you blinked the LED is bigger than
	// the interval at which you want to blink the LED.
	unsigned long currentMillis = millis();

	if (currentMillis - previousMillis >= interval)
	{
		// save the last time you blinked the LED
		previousMillis = currentMillis;

		// if the LED is off turn it on and vice-versa:
		if (ledState == LOW)
		{
			ledState = HIGH;
		}
		else
		{
			ledState = LOW;
		}

		// set the LED with the ledState of the variable:
		digitalWrite(ledPin, ledState);
	}
}
