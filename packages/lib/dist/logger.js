//! CHALK DOESNT SUPPORT EDGE RUNTIME (ex: middleware)
/// <reference lib="dom" />
import chalk from "chalk";
const allowDebug = process.env.NODE_ENV !== "production";
const console = global.console;
// Basic Colors
const black = "#000000";
const text = "#CDCDCD";
const yellow = "#F3F99D";
const orange = "#F9CB8F";
const red = "#F09393";
const green = "#7EE081";
const blue = "#7DCFEA";
const gray = "#686868";
const isBrowser = typeof window !== "undefined";
const printColor = (bg, text) => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(...args) => {
    const data = args
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((arg) => {
        if (typeof arg === "object") {
            const str = arg.toString();
            if (str === "[object Object]") {
                return JSON.stringify(arg, null, 2);
            }
            return str;
        }
        return arg;
    })
        .join(" ");
    if (bg && text)
        return chalk.bgHex(bg).hex(text)(data);
    if (bg)
        return chalk.bgHex(bg)(data);
    if (text)
        return chalk.hex(text)(data);
};
const log = printColor(undefined, text);
const warn = printColor(yellow, black);
const warnText = printColor(undefined, yellow);
const debug = printColor(orange, black);
const debugText = printColor(undefined, orange);
const error = printColor(red, black);
const errorText = printColor(undefined, red);
const success = printColor(green, black);
const successText = printColor(undefined, green);
const info = printColor(blue, black);
const infoText = printColor(undefined, blue);
const subLog = printColor(undefined, gray);
export const logger = {
    ...console,
    allowDebug,
    log: (...args) => {
        if (isBrowser)
            return console.log(...args);
        console.log(log(...args));
    },
    debug: (...args) => {
        if (allowDebug) {
            if (isBrowser)
                return console.debug(" DEBUG ", ...args);
            console.debug(debug(" DEBUG "), debugText(...args));
        }
    },
    warn: (...args) => {
        if (isBrowser)
            return console.warn(" WARN ", ...args);
        console.warn(warn(" WARN "), warnText(...args));
    },
    error: (...args) => {
        if (isBrowser)
            return console.error(" ERROR ", ...args);
        console.error(error(" ERROR "), errorText(...args));
    },
    trace: (...args) => {
        if (isBrowser)
            return console.trace(" ERROR ", ...args);
        console.trace(error(" ERROR "), errorText(...args));
    },
    success: (...args) => {
        if (isBrowser)
            return console.log(" SUCCESS ", ...args);
        console.log(success(" SUCCESS "), successText(...args));
    },
    info: (...args) => {
        if (isBrowser)
            return console.log(" INFO ", ...args);
        console.log(info(" INFO "), infoText(...args));
    },
    subLog: (...args) => {
        if (isBrowser)
            return console.log(...args);
        console.log(subLog(...args));
    },
};
//# sourceMappingURL=logger.js.map