import * as converters from './converters.js'
import cssjson from 'cssjson';

// Recursively find and alter all hex color values from a json object
export function processJSON(obj, hue = 0, sat = 0, lit = 0, indent = '') {
	const hexColorRegex = /#[\dABCDEF]{3,8}/gi;
	for (const i in obj) {
		if (Array.isArray(obj[i]) || typeof obj[i] === 'object') {
			processJSON(obj[i], hue, sat, lit, indent + ' > ' + i + ' > ');
		} else {
			if (hexColorRegex.test(obj[i])) {
				// Hex value found!
				const colors = obj[i].match(hexColorRegex);
				for (let j = 0; j < colors.length; j++) {
					obj[i] = obj[i].replace(colors[j], converters.shiftHex(colors[j], hue, sat, lit));
				}
			}
		}
	}
	return obj
}

// Finds and shifts all hex color values from a json object
export function processCSS(data, hue = 0, sat = 0, lit = 0) {
	data = cssjson.toJSON(data);
	data = processJSON(data, hue, sat, lit)
	data = cssjson.toCSS(data);
	return data
}