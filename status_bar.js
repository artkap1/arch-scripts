#!/usr/bin/node

const process = require('process');
const net = require('net');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const SOCKET_PATH = '/tmp/status_bar.sock';

const BACKGROUND = '#2E3440';
const SEPARATOR = '  ';

const MODULES = [
	{
		module: 'backup',
		command: '[ -f /tmp/b2backup ] && cat /tmp/b2backup || echo 0',
		color: '#96ebeb',
		process: result => result[0] === '1' ? '[Backup]' : ''
	},
	{
		module: 'batteryConsumption',
		command: `cat /sys/class/power_supply/BAT0/energy_now && cat /sys/class/power_supply/BAT0/energy_full`,
		color: '#96ebeb', 
		process: result => (`[ ${batteryConsumption(result)}%/m ]`)
	},
	{
		module: 'battery',
		command: `cat /sys/class/power_supply/BAT0/capacity`,
		color: '#96ebeb',
		process: result => `[ ${result}% ${batteryIcon(Number(result))} ]`
	},
	{
		module: 'volume',
		command: `amixer get Master | grep "Front Left: Playback" | sed -E "s/.*\\[([0-9]+)%\\].*/\\1/g"`,
		color: '#96ebeb',
		process: result => `[ ${result}% ${Number(result) == 0 ? ' ' : ' '} ]`
	},
	{
		module: 'microphone',
		command: `amixer get Capture | grep "\\[on\\]" | wc -l`,
		color: '#96ebeb',
		process: result => (Number(result) == 0 ? '[   ]' : '[  ]')
	},
	{
		module: 'language',
		command: `xset -q | grep LED | awk '{ print $10 }'`,
		color: '#96ebeb', 
		process: result => (Number(result) == 0 ? '[ EN ]' : '[ RU ]')
	},
	{ module: 'date', command: `date +"%a, %d %b %H:%M"`, color: '#46c7bf' }
];

let prevEnergyNow;

const find_module = (module) => MODULES.filter(current => current.module === module)[0];

const status_bar = async () => {
	const run_module = async ({ module, command, color, process }) => {
		const { stdout } = await exec(command);

		let output = stdout.trim();
		if (process) output = process(output);

		find_module(module).value = output;
		return output;
	};

	const update_status_bar = async () => {
		const values = MODULES.filter(module => module.value.length > 0).map(module => `^c${module.color}^${module.value}`);
		exec(`xsetroot -name "^b${BACKGROUND}^ ${values.join(SEPARATOR)} "`);
	};

	const start_server = () => {
		try {
			fs.unlinkSync(SOCKET_PATH);
		} catch {}

		const server = net.createServer();

		server.listen(SOCKET_PATH);
		server.on('close', () => fs.unlinkSync(SOCKET_PATH));

		server.on('connection', socket => {
			socket.on('data', async data => {
				await run_module(find_module(data.toString()));
				await update_status_bar();
			});
		});
	};

	const refresh_date = async () => {
		const sleep = ms => new Promise(res => setTimeout(() => res(null), ms));

		await sleep((60 - new Date().getSeconds()) * 1000);

		let minutes = new Date().getMinutes();
		setInterval(async () => {
			while (new Date().getMinutes() == minutes) await sleep(100);

			minutes = new Date().getMinutes();
			await run_module(find_module('date'));
			await run_module(find_module('battery'));
			await run_module(find_module('batteryConsumption'))
			await update_status_bar();
		}, 60000 - 500);
	};

	await Promise.all(MODULES.map(run_module));
	await update_status_bar();

	start_server();

	refresh_date();
};

const refresh = (module) => {
	if (!MODULES.some(current => current.module === module)) return console.error(`No module ${module}!`);

	const socket = net.createConnection(SOCKET_PATH);
	socket.on('data', data => console.log(data.toString()));
	socket.write(module, error => error && console.error(error));
	socket.end();
};

const batteryIcon = (charge) => {
	if (charge > 90 && charge <=100){
		return ' '
	} else if (charge > 60 && charge <=90){
		return ' '
	} else if (charge > 30 && charge <=60){
		return ' '
	} else if (charge > 10 && charge <=30){
		return ' '
	} else if (charge <= 10){
		return ' '
	}
}

const batteryConsumption = (energyNowAndEnergyFull) => {
	const arr = energyNowAndEnergyFull.split('\n');
	const energyNow = parseInt(arr[0]);
	const energyFull = parseInt(arr[1]);
	let consumption;

	console.log(energyNowAndEnergyFull, arr, energyNow, energyFull);

	if (!prevEnergyNow) {
		prevEnergyNow = energyNow;
		return 0;
	} else {
		consumption = energyNow - prevEnergyNow;
		prevEnergyNow = energyNow;

		if (consumption > 0) {
			return `+${toPrecent(consumption, energyFull)}`;
		}

		return toPrecent(consumption, energyFull);
	}
}

const toPrecent = (value, maxValue) => {
	return (value * 100.0 / maxValue).toFixed(3);
}

const main = () => {
	if (process.argv[0].endsWith('node')) process.argv.shift();

	if (process.argv.length == 1) status_bar();
	else if (process.argv.length == 3 && process.argv[1] == 'refresh') refresh(process.argv[2]);
	else {
		const command = process.argv[0].split('/').pop();
		console.error(`usage:`);
		console.error(`${command}                  - status bar`);
		console.error(`${command} refresh [module] - refresh module`);
		process.exit(1);
	}
};

main();
