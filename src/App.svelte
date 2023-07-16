<script>
    import "@picocss/pico";
    import "./assets/styles.css";

    import {onMount} from "svelte";

    import Settings from "./lib/components/Settings.svelte";
    import ConnectedUsers from "./lib/components/ConnectedUsers.svelte";

    import tmi from "tmi.js";

    import {settings_db} from "./lib/db.js";

    import {debounce} from "./lib/utils.js";
    import {on_join, on_part, on_names, start_users_check, remove_all_active_users} from "./lib/spectator.js";

    let show_settings = false;

    let client = new tmi.Client({
        channels: [],
    });
    client.connect().then(() => connect($settings_db.data.channels));
    start_users_check();

    // Detect joined users.
    client.on("join", on_join);

    // Detect already joined users.
    client.on("names", on_names);

    // Detect users that left.
    client.on("part", on_part);

    // Connect to channel.
    const connect = debounce(async (channels) => {
        // Channels check.
        if (!Array.isArray(channels)) return;

        // Empty channel names check.
        channels = channels.filter((channel) => channel.trim() !== "");
        if (channels.length < 1) return;

        const connected_channels = client.getChannels().map((channel) => channel.replace("#", "").toLowerCase());

        // New channels that we are not connected to yet.
        let new_channels = channels.filter((channel) => !connected_channels.includes(channel.toLowerCase()));

        // Old channels that we no longer want to be connected to.
        let old_channels = connected_channels.filter((channel) => !channels.includes(channel.toLowerCase()));

        // Changes check.
        if (new_channels.length < 1 && old_channels.length < 1) return;

        // Leave old channels.
        for (const old_channel of old_channels) {
            await client.part(old_channel);

            window.toast.push(`Left channel ${old_channel.replace("#", "")}`, {
                duration: 3500,
                classes: ["secondary"],
            });
            remove_all_active_users(old_channel.replace("#", ""));
        }

        // Join new channel.
        for (const channel of new_channels) {
            await client.join(channel);

            window.toast.push(`Joined channel ${channel}`, {
                duration: 3500,
                classes: ["primary"],
            });
        }

    }, 1500);

    // Connect to channel.
    $: connect($settings_db.data.channels);

    // Detect and display error notifications.
    onMount(() => {
        const report_error = (error = "unknown error") => {
            const error_icon = `<svg xmlns="http://www.w3.org/2000/svg" class="error-icon" fill="none" viewBox="0 0 24 24"><title>Error</title><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
            window.toast.push(`${error_icon} <span>${error}</span>`, {
                initial: 0,
                classes: ["danger"],
            });
        }

        const handle_rejection = (event) => {
            event.preventDefault();
            console.error(event);
            report_error(event?.reason);
        }

        const handle_error = (event) => {
            event.preventDefault();
            console.error(event);
            report_error(event?.message);
        }

        window.addEventListener("unhandledrejection", handle_rejection);
        window.addEventListener("error", handle_error);

        return () => {
            window.removeEventListener("unhandledrejection", handle_rejection);
            window.removeEventListener("error", handle_error);
        }
    });

    // Estimate used storage.
    navigator.storage.estimate().then((estimate) => {
        console.log("estimated storage usage", (
            (estimate.usage / estimate.quota) *
            100
        ).toFixed(2));
    });

</script>

<main class="container-fluid">
    <h1>Twitch chat spectator</h1>

    <p>
        Spectate over users that join / leave particular twitch channels. <br>
        Not available on large channels and is also sent in batch every 30-60 seconds.
    </p>

    <button class="btn-small" on:click={() => show_settings = !show_settings}>
        {#if (show_settings)}
            Hide settings
        {:else}
            Show settings
        {/if}
    </button>

    {#if (show_settings)}
        <Settings />
    {/if}

    <ConnectedUsers />
</main>
