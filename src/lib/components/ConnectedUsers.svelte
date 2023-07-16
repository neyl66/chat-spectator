<script>
    import {parseCronExpression} from "cron-schedule";
    import {TimerBasedCronScheduler as scheduler} from "cron-schedule/schedulers/timer-based.js";

    import dayjs from "dayjs";
    import relativeTime from "dayjs/plugin/relativeTime";
    dayjs.extend(relativeTime);

    import humanizeDuration from "humanize-duration";

    import {settings_db, user_stats_db} from "../db.js";
    import {active_users, time_since_room_update} from "../stores";

    import {debounce} from "../utils.js";

    let is_details_open = false;
    let selected_channel = (Object.keys($user_stats_db.data).includes($settings_db.data.channels[0])) ? $settings_db.data.channels[0] : Object.keys($user_stats_db.data)[0] ?? "";

    const check_selected_channel = debounce((channels) => {
        if (channels.length < 1) return;

        if (!selected_channel || !channels.includes(selected_channel)) {
            selected_channel = channels[0];
        }
    }, 500);

    $: check_selected_channel([...new Set([...Object.keys($user_stats_db.data), ...$settings_db.data.channels])]);

    let time_since;
    $: set_time_since(selected_channel);

    function set_time_since(current_channel) {
        if (!$time_since_room_update[current_channel]) return;

        const time_since_date = $time_since_room_update[current_channel];
        time_since = dayjs().to(dayjs(time_since_date));
    }

    scheduler.setInterval(parseCronExpression("* * * * * *"), () => {
        set_time_since(selected_channel);
    }, {
        errorHandler: (error) => {
            console.error(error);
        },
    });

</script>

<h2>Connected users</h2>

<p>List of users that are currently connected</p>

<div class="details-wrap">
    <details role="list" bind:open={is_details_open}>
        <!-- svelte-ignore a11y-no-redundant-roles -->
        <summary class="secondary" aria-haspopup="listbox" role="button">Channel: {selected_channel}</summary>

        <ul role="listbox">
            {#each Object.keys($user_stats_db.data) as channel}
                <li>
                    <button class="no-mb" class:outline={channel !== selected_channel} on:click={() => {
                        selected_channel = channel;
                        is_details_open = false;
                    }}>
                        {channel}
                    </button>
                </li>
            {/each}
        </ul>
    </details>

    <span>Found {$active_users[selected_channel]?.length ?? 0} users in chat.</span>

    <div class="room-update-info">
        {#if (time_since)}
            <span>Time since room update: <strong>{time_since}</strong>.</span>
        {:else}
            <strong>Haven't yet received room update. If this persists for more than 3 minutes, try refreshing!</strong>
        {/if}
    </div>
</div>

<figure>
    <table role="grid">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Username</th>
                <th scope="col">Time spent in channel</th>
            </tr>
        </thead>
        <tbody>
            {#if (Array.isArray($active_users[selected_channel]))}
                {#each $active_users[selected_channel] as username, index (username)}
                    {@const time_spent = $user_stats_db.data[selected_channel]?.[username]?.time_spent || 0}

                    <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{username}</td>
                        <td>{humanizeDuration(time_spent * 1000, {units: ["h", "m", "s"]})}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</figure>

<style>
    .details-wrap > details {
        display: inline-block;
    }

    .details-wrap > * {
        margin-right: 10px;
    }

    .room-update-info {
        margin-bottom: 15px;
    }
    @media (min-width: 850px) {
        .room-update-info {
            display: inline-block;
        }
    }
</style>