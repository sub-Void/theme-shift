const fs = require('fs');
const path = require('path');
const cssjson = require('cssjson');
const yargs = require('yargs');


const argv = yargs
	.scriptName('theme-shift')
	.version('0.2.1')
	.usage('$0 <cmd> [args]')
	.options({
		path: {
			alias: 'p',
			describe: 'provide a path to the file to read',
			type: 'string',
			demandOption: true
		},
		output: {
			alias: 'o',
			describe: 'provide a path for the output file',
			default: 'shifted.json',
			type: 'string',
			demandOption: false
		},
		hue: {
			alias: 'h',
			describe: 'desired shift in hue. example: -110',
			default: 0,
			type: 'number',
			demandOption: false
		},
		saturation: {
			alias: 's',
			describe: 'desired shift in saturation. example: 35',
			default: 0,
			type: 'number',
			demandOption: false
		},
		lightness: {
			alias: 'l',
			describe: 'desired shift in lightness. example: -10',
			default: 0,
			type: 'number',
			demandOption: false
		}
	})
	.help().argv;


var inPath = argv.p;
var ext = path.extname(inPath);
var outPath = argv.o;


// validate number args
if (isNaN(argv.h) || isNaN(argv.s) || isNaN(argv.l)) {
	console.log('Must supply numerical values for h, s, l');
	return null;
} else if (argv.h == 0 && argv.s == 0 && argv.l == 0) {
	console.log('Must supply at least one shift value. h, s, or l');
	return null;
}

// read the file
var data;
try {
	data = fs.readFileSync(inPath);
} catch (error) {
	console.error('Error reading file.');
	return null;
}

// ensure output path has proper file extension
if (path.extname(inPath) != path.extname(outPath)) {
	outPath = outPath.split('.')[0] + ext;
}

// if css, convert to json and set flag.
if (ext == '.css') {
	data = cssjson.toJSON(data);
} else {
	data = JSON.parse(data);
}

// args are valid -- process
var dataChanged = false;
processJSON(data);

if (!dataChanged) {
	console.log(`No hex colors found in ${inPath}`);
	return null;
}

// jobs done. write file
if (ext == '.css') data = cssjson.toCSS(data);
else data = JSON.stringify(data, null, '\t');

try {
	fs.writeFileSync(outPath, data);
} catch (error) {
	console.log(`Unable to write file: ${outPath}`);
	return null;
}

console.log(`File written to: ${outPath}`);