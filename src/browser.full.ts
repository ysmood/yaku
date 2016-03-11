// This file is intended for browser only.

import Yaku from "./yaku";

import utils from "./utils";

for (let key in utils) {
    Yaku[key] = utils[key];
}

export default window["Yaku"] = Yaku;
