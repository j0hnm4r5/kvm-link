const { Menu } = require(`electron`).remote;
const { template } = require(`./components/menu`);

const Serial = require(`./components/serial`);
const hagen = require(`hagen`);

class Ignition {
	constructor() {
		// get video dom element
		this.videoElement = document.getElementById(`webcam`);

		// set pointer lock
		this.pointerLock = false;

		// create a new serial connection
		this.serial = new Serial(`/dev/tty.usbmodemKVML_H_001`);

		// start the app
		this.start();
	}

	async start() {
		// get input devices
		this.inputDevices = await this.getDevices();

		// add them to the menu template
		this.menuTemplate = this.createMenuItems(
			template,
			this.inputDevices
		);

		// create the menu
		this.menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(this.menu);

		// try to connect to the cam link
		try {
			this.handleStreamSelect({
				label: `Cam Link 4K (0fd9:0066)`,
			});
		} catch (error) {
			hagen.error(
				`KVM LINK`,
				`Could not connect to Cam Link. Try selecting another feed.`
			);
		}
	}

	async getDevices() {
		// get all devices attached to the computer
		const allDevices = await navigator.mediaDevices.enumerateDevices();

		// filter them for just video inputs
		const inputDevices = allDevices.filter(
			(device) => device.kind === `videoinput`
		);

		return inputDevices;
	}

	createMenuItems(menuTemplate, inputDevices) {
		// for each video input, add it to the "Source" menu
		const devices = inputDevices.map((device) => ({
			label: device.label,
			click: (source) => this.handleStreamSelect(source),
		}));

		// don't overwrite the existing template
		const temp = { ...menuTemplate };

		// update connect item with a click function
		temp[1].submenu[0].click = () => this.togglePointerLock();

		// add all of the video devices
		devices.forEach((device) => temp[1].submenu.push(device));

		return temp;
	}

	handleStreamSelect(source) {
		// stop any existing streams
		if (window.stream) {
			window.stream.getTracks().forEach((track) => {
				track.stop();
			});
		}

		// get the device
		const camLink = this.inputDevices.find(
			(device) => device.label === source.label
		);

		// get the stream and display it
		navigator.mediaDevices
			.getUserMedia({
				video: {
					width: { min: 1920, ideal: 3840 },
					height: { min: 1080, ideal: 2160 },
					deviceId: {
						exact: camLink.deviceId,
					},
				},
				audio: false,
			})
			.then((stream) => {
				// set the video's source
				window.stream = stream; // make stream available to hagen
				this.videoElement.srcObject = stream;
				return stream;
			})
			.then(() => {
				// remove the "noVideo" div if a video feed has been found
				const element = document.getElementById(`noVideo`);
				element.parentNode.removeChild(element);
				return element;
			})
			.catch(hagen.error);
	}

	mousePosition(x, y) {
		hagen.log(`MOUSE`, `${x}, ${y}`);
		this.serial.sendMouse(x, y);
	}

	mouseClick(button) {
		hagen.log(`CLICK`, button);
		this.serial.sendClick(button);
	}

	mouseScroll(amount) {
		hagen.log(`SCROLL`, amount);
		this.serial.sendScroll(amount);
	}

	handleEvent(e) {
		switch (e.type) {
			case `mousemove`:
				this.mousePosition(e.movementX, e.movementY);
				break;
			case `mousedown`:
				this.mouseClick(e.which);
				break;
			case `mouseup`:
				this.mouseClick(0);
				break;
			case `mousewheel`:
				this.mouseScroll(e.wheelDelta / 4);
				break;
			default:
				break;
		}
	}

	togglePointerLock() {
		hagen.log(
			`KVM LINK`,
			this.pointerLock ? `DISCONNECTED` : `CONNECTED`
		);

		if (this.pointerLock) {
			// if locked, unlock
			document.exitPointerLock();

			document.removeEventListener(`mousemove`, this);
			document.removeEventListener(`mousedown`, this);
			document.removeEventListener(`mouseup`, this);
			document.removeEventListener(`mousewheel`, this);
		} else {
			// if unlocked, lock
			this.videoElement.requestPointerLock();

			document.addEventListener(`mousemove`, this);
			document.addEventListener(`mousedown`, this);
			document.addEventListener(`mouseup`, this);
			document.addEventListener(`mousewheel`, this);
		}

		// set the lock
		this.pointerLock = !this.pointerLock;
	}
}

// start the app
const ignition = new Ignition();
window.ignition = ignition;
