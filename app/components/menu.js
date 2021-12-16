const { app } = require(`electron`).remote;

const template = [
	{
		label: `Source`,
		submenu: [
			{
				label: `Connect/Disconnect Keyboard`,
				accelerator: `CommandOrControl+Shift+D`,
				click: () => {},
			},
			{ type: `separator` },
		],
	},
	{
		label: `View`,
		submenu: [
			{ role: `reload` },
			{ role: `forcereload` },
			{ role: `toggledevtools` },
			{ type: `separator` },
			{ role: `resetzoom` },
			{ role: `zoomin` },
			{ role: `zoomout` },
			{ type: `separator` },
			{ role: `togglefullscreen` },
		],
	},
	{
		role: `window`,
		submenu: [{ role: `minimize` }, { role: `close` }],
	},
];

if (process.platform === `darwin`) {
	template.unshift({
		label: app.getName(),
		submenu: [
			{ role: `about` },
			{ type: `separator` },
			{ role: `hide` },
			{ role: `hideothers` },
			{ role: `unhide` },
			{ type: `separator` },
			{ role: `quit` },
		],
	});

	// Window menu
	template[template.length - 1].submenu = [
		{ role: `close` },
		{ role: `minimize` },
		{ role: `zoom` },
		{ type: `separator` },
		{ role: `front` },
	];
}

module.exports = { template };
