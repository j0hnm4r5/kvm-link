const { app, BrowserWindow } = require(`electron`);

const RATIO = 16 / 9;

const WIDTH = 1280;
const HEIGHT = (1 / RATIO) * WIDTH;

function createWindow() {
	// create browser window
	const win = new BrowserWindow({
		width: WIDTH,
		height: HEIGHT,
		title: `KVM Link`,
		useContentSize: true,
	});

	// load the html file
	win.loadFile(`app/index.html`);

	// open devtools
	win.webContents.openDevTools();

	win.setAspectRatio(RATIO);
}

app.on(`ready`, () => {
	createWindow();
});
