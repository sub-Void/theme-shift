// alter the color of a hex by the given H/S/L values. 
export const shiftHex = (hex, hue = 0, sat = 0, lit = 0) => {
    hex = hex.replace(/#/, '');
    let alpha = '';

    // alter shorthand values to regular ones
    if (hex.length <= 4) {
        let copy = '';
        for (let i = 0; i < hex.length; i++) {
            copy = copy + hex[i] + hex[i];
        }
        hex = copy;
    }

    if (hex.length == 5) {
        return '#' + hex
    }

    // remove and store alpha value
    if (hex.length == 8) {
        alpha = hex.substring(6, 8);
        hex = hex.substring(0, 6);
    }

    // hex -> hsl
    let hsl = hexToHsl(hex);

    // shift the HSL by given parameters
    //hue
    hsl[0] = (hsl[0] + hue) % 360;
    //saturation
    hsl[1] = hsl[1] + sat;
    if (hsl[1] < 0) hsl[1] = 0;
    if (hsl[1] > 100) hsl[1] = 100;
    //lightness
    hsl[2] = hsl[2] + lit;
    if (hsl[2] < 0) hsl[2] = 0;
    if (hsl[2] > 100) hsl[2] = 100;

    // back to hex, and restore alpha values
    return hslToHex(hsl) + alpha;
}


///////////////////////////////////////////////



export const hexToRgb = (hex) => {
    let rgb = [];
    for (let i = 0; i < 6; i += 2) {
        rgb.push(parseInt(hex.substr(i, 2), 16));
    }
    return rgb;
}

export const rgbToHsl = ([r, g, b]) => {
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

export const hueToRgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};


export const hslToHex = ([h, s, l]) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) r = g = b = l;
    // achromatic
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const hexToHsl = (hex) => {
    return rgbToHsl(hexToRgb(hex))
}