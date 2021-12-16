#define DEBUG true

#define DEVICE Serial1
#define COMPUTER Serial

const int ledPin = LED_BUILTIN;
int ledState = LOW;
unsigned long previousMillis = 0;
const long interval = 500;

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

	// blink the LED to show power status
	blinkLED();

	// if there's anything in the serial buffer
	int incomingByte;
	if (COMPUTER.available() > 0)
	{
		// read first byte in buffer
		incomingByte = COMPUTER.read();

		// send it to the TARGET device
		DEVICE.write(incomingByte);

		// if debug, print the character back to the computer
		if (DEBUG)
		{
			COMPUTER.print("»»» ");
			COMPUTER.write(incomingByte);

			COMPUTER.print(", dec: ");
			COMPUTER.print(incomingByte, DEC);

			COMPUTER.print(", hex: ");
			COMPUTER.print(incomingByte, HEX);

			COMPUTER.print(", oct: ");
			COMPUTER.print(incomingByte, OCT);

			COMPUTER.print(", bin: ");
			COMPUTER.println(incomingByte, BIN);
		}
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