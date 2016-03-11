import Promise from "./yaku";

export default function (fn: Function, thisArg?: any): (...args) => Promise<any>;
