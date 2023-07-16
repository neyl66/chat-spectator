import {get, writable} from "svelte/store";

import {LowSync} from "lowdb";
import {LocalStorage} from "lowdb/browser";

// Settings.
const settings_db = writable(new LowSync(new LocalStorage("settings"), {}));
const settings = get(settings_db);
settings.read();

// Settings defaults.
const settings_db_default = {
    channels: [""],
};

// Merge defaults with current data.
settings.data = {
    ...settings_db_default,
    ...settings.data,
}
settings_db.set(settings);

// User stats.
const user_stats_db = writable(new LowSync(new LocalStorage("user_stats"), {}));
const user_stats = get(user_stats_db);
user_stats.read();
user_stats_db.set(user_stats);

export {
    settings_db,
    user_stats_db,
};
