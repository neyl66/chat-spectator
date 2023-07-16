import {parseCronExpression} from "cron-schedule";
import {TimerBasedCronScheduler as scheduler} from "cron-schedule/schedulers/timer-based.js";

import {user_stats_db} from "./db.js";

import {active_users, time_since_room_update} from "./stores.js";

let active_users_local = {};
active_users.subscribe(($active_users) => active_users_local = $active_users);

let user_stats = {};
user_stats_db.subscribe(($user_stats) => user_stats = $user_stats);

let users_handle;

export function on_join(channel, username, is_self) {
    if (is_self) return;

    channel = channel.replace("#", "");
    console.log(username, "JOINED", channel);

    add_active_user(channel, username);
}

export function on_names(channel, users) {
    channel = channel.replace("#", "");

    for (const username of users) {
        if (username.includes("justinfan")) continue;

        console.log(username, "WAS ALREADY IN", channel);
        add_active_user(channel, username);
    }
}

function add_active_user(channel, username) {

    active_users.update(($active_users) => {
        // Initialize new channel.
        if (!(channel in $active_users)) {
            $active_users[channel] = [];
        }

        // Add new active user to channel.
        if (!$active_users[channel].includes(username)) {
            $active_users[channel].push(username);
        }

        return $active_users;
    });

    set_time_of_room_update(channel);
}

export function on_part(channel, username, is_self)  {
    if (is_self) return;

    channel = channel.replace("#", "");
    console.log(username, "LEFT", channel);
    remove_active_user(channel, username);

    set_time_of_room_update(channel);
}

function remove_active_user(channel, username) {
    active_users.update(($active_users) => {
        if (Array.isArray($active_users[channel])) {
            $active_users[channel] = $active_users[channel].filter((old_username) => old_username !== username);
        }

        return $active_users;
    });

    set_time_of_room_update(channel);
}

export function remove_all_active_users(channel) {
    active_users.update(($active_users) => {
        if (channel in $active_users) {
            $active_users[channel] = [];
        }

        return $active_users;
    });
}

function set_time_of_room_update(channel) {
    time_since_room_update.update(($time_since_room_update) => {
        $time_since_room_update[channel] = new Date().toISOString();

        return $time_since_room_update;
    });
}

function log_active_user_time() {
    if (Object.keys(active_users_local).length < 1) return;

    for (const [channel, users] of Object.entries(active_users_local)) {
        user_stats_db.update(($user_stats) => {
            if (!(channel in $user_stats.data)) {
                $user_stats.data[channel] = {};
            }

            for (const user of users) {
                if (!(user in $user_stats.data[channel])) {
                    $user_stats.data[channel][user] = {
                        time_spent: 0,
                        messages_sent: 0,
                        messages_deleted: 0,
                    };
                }

                $user_stats.data[channel][user].time_spent += 1;
            }

            $user_stats.write();

            return $user_stats;
        });
    }
}

export function start_users_check() {
    users_handle = scheduler.setInterval(parseCronExpression("* * * * * *"), log_active_user_time, {
        errorHandler: (error) => {
            console.error(error);
        },
    });
}

export function stop_users_check() {
    scheduler.clearTimeoutOrInterval(users_handle);
}
