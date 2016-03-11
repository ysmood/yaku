import "./Promise.d.ts";

interface Yaku<T> extends Promise<T> {}

/**
 * Some extra helper of Yaku
 */
interface YakuConstructor extends PromiseConstructor {
    prototype: Yaku<any>;

    Symbol: SymbolConstructor;

    speciesConstructor(O, defaultConstructor: Function): void;

    unhandledRejection<T>(reason, p: Yaku<T>): void;

    rejectionHandled<T>(reason, p: Yaku<T>): void;

    enableLongStackTrace(): void;

    nextTick(fn: Function): void;
}

declare var Yaku: YakuConstructor;

export default Yaku;
