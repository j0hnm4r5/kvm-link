const hagen = require(`hagen`);
const SerialPort = require(`serialport`);

class Serial {
	constructor(device) {
		hagen.log(`SERIAL`, `Connecting...`);
		this.serialport = new SerialPort(
			device,
			{
				baudRate: 38400,
			},
			(err) => {
				if (err)
					hagen.warn(
						`SERIAL`,
						`Port ${device} could not be opened`
					);
			}
		);

		this.serialport.on(`open`, () => {
			hagen.log(`SERIAL`, `PORT OPENED: ${device}`);
		});

		this.serialport.on(`close`, () => {
			hagen.log(`SERIAL`, `PORT CLOSED`);
		});
	}

	sendMouse(x, y) {
		this.sendMessage(
			`M`,
			`${this.clamp(x, -127, 127)},${this.clamp(y, -127, 127)}`
		);
	}

	sendClick(button) {
		this.sendMessage(`C`, button);
	}

	sendScroll(amount) {
		this.sendMessage(`S`, this.clamp(amount, -1, 1));
	}

	sendKeyboard(char) {
		this.sendMessage(`K`, char);
	}

	sendMessage(token, payload) {
		const message = `«${token}${payload}»`;
		this.serialport.write(message);
	}

	clamp(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}
}

module.exports = Serial;
