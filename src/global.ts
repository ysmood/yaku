declare var global;

import _ from "./_";

try {
    global["Promise"] = _.Promise;
    window["Promise"] = _.Promise;
} catch (err) {
    null;
}