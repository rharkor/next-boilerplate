/* eslint-disable no-process-env */
//! CHALK DOESNT SUPPORT EDGE RUNTIME (ex: middleware)
/// <reference lib="dom" />
import chalk from "chalk";
const allowDebug = process.env.NODE_ENV !== "production";
const console = globalThis.console;
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
const printColor = (bg, text) => (...args) => {
    const data = args
        .map((arg) => {
        if (typeof arg === "object" && arg) {
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
function addPrefixToArgs(prefix, ...args) {
    if (typeof prefix === "string") {
        return [log(prefix), ...args];
    }
    if (typeof prefix === "function") {
        return [log(prefix()), ...args];
    }
    return args;
}
export const logger = {
    ...console,
    allowDebug,
    log: (...args) => {
        if (isBrowser)
            return console.log(...addPrefixToArgs(logger.prefix, ...args));
        console.log(log(...addPrefixToArgs(logger.prefix, ...args)));
    },
    debug: (...args) => {
        if (allowDebug) {
            if (isBrowser)
                return console.debug(...addPrefixToArgs(logger.prefix, " DEBUG ", ...args));
            console.debug(...addPrefixToArgs(logger.prefix, debug(" DEBUG "), debugText(...args)));
        }
    },
    warn: (...args) => {
        if (isBrowser)
            return console.warn(...addPrefixToArgs(logger.prefix, " WARN ", ...args));
        console.warn(...addPrefixToArgs(logger.prefix, warn(" WARN "), warnText(...args)));
    },
    error: (...args) => {
        if (isBrowser)
            return console.error(...addPrefixToArgs(logger.prefix, " ERROR ", ...args));
        console.error(...addPrefixToArgs(logger.prefix, error(" ERROR "), errorText(...args)));
    },
    trace: (...args) => {
        if (isBrowser)
            return console.trace(...addPrefixToArgs(logger.prefix, " ERROR ", ...args));
        console.trace(...addPrefixToArgs(logger.prefix, error(" ERROR "), errorText(...args)));
    },
    success: (...args) => {
        if (isBrowser)
            return console.log(...addPrefixToArgs(logger.prefix, " SUCCESS ", ...args));
        console.log(...addPrefixToArgs(logger.prefix, success(" SUCCESS "), successText(...args)));
    },
    info: (...args) => {
        if (isBrowser)
            return console.log(...addPrefixToArgs(logger.prefix, " INFO ", ...args));
        console.log(...addPrefixToArgs(logger.prefix, info(" INFO "), infoText(...args)));
    },
    subLog: (...args) => {
        if (isBrowser)
            return console.log(...addPrefixToArgs(logger.prefix, ...args));
        console.log(...addPrefixToArgs(logger.prefix, subLog(...args)));
    },
};
//# sourceMappingURL=logger.js.map