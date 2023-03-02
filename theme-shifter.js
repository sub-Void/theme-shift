const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const cssjson = require('cssjson');

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
        },
        verbose: {
            alias: 'v',
            describe: 'lists all original and changex hex values',
            default: false,
            type: 'boolean',
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


function processJSON(obj, indent) {
    // Extracts all values from a json object, in this case finding all hex color values.
    const hexColorRegex = /#[\dABCDEF]{3,8}/gi;
    for (const i in obj) {
        if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
            processJSON(obj[i], indent + ' > ' + i + ' > ');
        } else {
            if (hexColorRegex.test(obj[i])) {
                // Hex value found!
                const colors = obj[i].match(hexColorRegex);
                for (let j = 0; j < colors.length; j++) {
                    obj[i] = obj[i].replace(colors[j], shiftColor(colors[j]));
                }
                dataChanged = true;
            }
        }
    }
}

function shiftColor(original) {
    original = original.replace(/#/, '');
    let shiftedColor = '';
    let alpha = '';

    // altering shorthand values
    if (original.length <= 4) {
        for (let i = 0; i < original.length; i++) {
            shiftedColor = shiftedColor + original[i] + original[i];
        }
    } else {
        shiftedColor = original;
    }

    // remove the alpha value (if it's there) temporarily
    if (shiftedColor.length == 8) {
        alpha = shiftedColor.substring(6, 8);
        shiftedColor = shiftedColor.substring(0, 6);
    }

    // convert to HSL
    let hsl = rgbToHsl(hexToRgb(shiftedColor));

    // shift the HSL
    //hue
    hsl[0] = (hsl[0] + argv.hue) % 360;
    //saturation
    hsl[1] = hsl[1] + argv.saturation;
    if (hsl[1] < 0) hsl[1] = 0;
    if (hsl[1] > 100) hsl[1] = 100;
    //lightness
    hsl[2] = hsl[2] + argv.lightness;
    if (hsl[2] < 0) hsl[2] = 0;
    if (hsl[2] > 100) hsl[2] = 100;

    // back to hex
    shiftedColor = hslToHex(hsl);

    if (argv.v) console.log(`#${original} -> ${shiftedColor + alpha}`);

    return shiftedColor + alpha;
}

function hexToRgb(hex) {
    let rgb = [];
    for (let i = 0; i < 6; i += 2) {
        rgb.push(parseInt(hex.substr(i, 2), 16));
    }
    return rgb;
}

function rgbToHsl([r, g, b]) {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0) h = 0;
    // Red is max
    else if (cmax == r) h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g) h = (b - r) / delta + 2;
    // Blue is max
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0) h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = Math.round(+(s * 100).toFixed(1));
    l = Math.round(+(l * 100).toFixed(1));

    return [h, s, l];
}

function hslToHex([h, s, l]) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) r = g = b = l;
    // achromatic
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
