/// <reference lib="dom" />
declare const console: Console;
export declare const logger: typeof console & {
    success: (typeof console)["log"];
    subLog: (typeof console)["log"];
    allowDebug: boolean;
};
export {};
