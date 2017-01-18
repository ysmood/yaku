import Yaku from "./yaku";

try {
    global.Promise = Yaku;
    window.Promise = Yaku;
} catch (err) {
    null;
}