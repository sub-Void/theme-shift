import * as converters from './converters.js'
import cssjson from 'cssjson';
import { namedColors } from './named-colors.js';

// Recursively find and alter all hex color values from a json object
export function processJSON(obj, hue = 0, sat = 0, lit = 0, indent = '') {
	const hexColorRegex = /#[\dABCDEF]{3,8}/gi;
	for (const i in obj) {
		if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
			processJSON(obj[i], hue, sat, lit, indent + ' > ' + i + ' > ');
		} else {
			if (hexColorRegex.test(obj[i])) {
				// Hex value found!
				const values = obj[i].match(hexColorRegex);
				for (let j = 0; j < values.length; j++) {
					obj[i] = obj[i].replace(values[j], converters.shiftHex(values[j], hue, sat, lit));

				}
			}
		}
	}
	return obj
}


// Traverses converted css object and does conversions for additional color types
export function preProcessCSS(obj, indent = '') {
	const rgbColorRegex = /(?:rgba?)\((?:\d+%?(?:deg|rad|grad|turn)?(?:,|\s)+){2,3}[\s\/]*[\d\.]+%?\)/gi;
	const hslColorRegex = /(?:hsla?)\((?:\d+%?(?:deg|rad|grad|turn)?(?:,|\s)+){2,3}[\s\/]*[\d\.]+%?\)/gi;

	for (const i in obj) {
		if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
			preProcessCSS(obj[i], indent + ' > ' + i + ' > ');
		} else {
			// Test for rgb() values, and convert to hex.
			if (rgbColorRegex.test(obj[i])) {
				const values = obj[i].match(rgbColorRegex);
				for (let j = 0; j < values.length; j++) {
					let rgbArray = converters.stringToRgb(values[j]);
					obj[i] = obj[i].replace(values[j], converters.rgbToHex(rgbArray));
				}
			}
			// Test for hsl() values, and convert to hex.

			// Test for color keywords, and convert to hex.
			// console.log(namedColors["whitesmoke"])

		}
	}
	return obj
}

// Finds and shifts all hex color values from a json object
export function processCSS(data, hue = 0, sat = 0, lit = 0) {
	data = cssjson.toJSON(data);

	data = preProcessCSS(data)

	data = processJSON(data, hue, sat, lit)
	data = cssjson.toCSS(data);
	return data
}