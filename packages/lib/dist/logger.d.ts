/// <reference lib="dom" />
declare const console: Console;
export type TLogger = typeof console & {
    success: (typeof console)["log"];
    subLog: (typeof console)["log"];
    allowDebug: boolean;
    prefix?: string | (() => string);
};
export declare const logger: TLogger;
export {};
