import Promise from './yaku';
export interface IDeferred<T> {
    resolve: Function;
    reject: Function;
    promise: Promise<T>;
}
declare var _default: <T>() => IDeferred<T>;
export default _default;
