import Promise from './yaku';
export interface Deferred<T> {
    resolve: Function;
    reject: Function;
    promise: Promise<T>;
}
declare var _default: <T>() => Deferred<T>;
export default _default;
