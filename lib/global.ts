import Yaku from "./yaku";

try {
    eval('global.Promise = Yaku');
    window['Promise'] = Yaku;
} catch (err) {
    null;
}