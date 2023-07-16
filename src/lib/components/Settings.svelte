<script>
    import {settings_db} from "../db.js";

    const settings_schema = {
        channels: {
            label: "Channels",
            type: "text",
            multiple: true,
            setting_key: "channels",
        },
    };

    function save_setting(key, value, schema, index) {
        // Skip same value.
        if ((!schema?.multiple && $settings_db.data[key] === value) || (schema?.multiple && $settings_db.data[key][index] === value)) return;

        // Save new setting.
        if (schema?.multiple) {
            $settings_db.data[key][index] = value;
        } else {
            $settings_db.data[key] = value;
        }

        $settings_db.write();
    }

    function add_new_setting_item(key, value, schema) {
        if (!Array.isArray($settings_db.data[key])) return;

        $settings_db.data[key].push(value);
        $settings_db.data = $settings_db.data;
        $settings_db.write();
    }

    function remove_setting_item(key, index, schema) {
        if (!Array.isArray($settings_db.data[key])) return;

        $settings_db.data[key].splice(index, 1);
        $settings_db.data = $settings_db.data;
        $settings_db.write();
    }

</script>

<h2>Settings:</h2>

<ul class="-no-bullets">
    {#each Object.entries($settings_db.data) as [key, value] (key)}
        {@const schema = settings_schema[key]}

        {#if (schema)}
            <li>
                {#if (schema.type === "boolean")}
                    <!-- Checkbox. -->
                    <label for={`settings-${key}`}>
                        <input type="checkbox" id={`settings-${key}`} checked={value} on:change={(event) => save_setting(key, event.target.checked, schema)}>
                        {schema.label}
                    </label>
                {:else if (schema.type == "text")}
                    {#if (schema?.multiple)}
                        <!-- Multiple text inputs. -->
                        <h3>{schema.label}</h3>

                        <p>Input Twitch channels you want to spectate</p>

                        <ul>
                            {#each value as value_item, index (index)}
                                <li>
                                    <div class="vertical-wrap -nowrap">
                                        <input type="text" placeholder="channel" value={value_item} on:input={(event) => save_setting(key, event.target.value, schema, index)}>

                                        <!-- Delete this item. -->
                                        <button class="delete-btn danger no-mb" on:click={() => remove_setting_item(key, index, schema)}>DELETE</button>
                                    </div>
                                </li>
                            {/each}

                            <!-- Add item button. -->
                            <li>
                                <button class="no-mb" on:click={() => add_new_setting_item(key, "", schema)}>add another channel</button>
                            </li>
                        </ul>
                    {:else}
                        <!-- Single text input. -->
                        <div class="vertical-wrap -nowrap">
                            <span class="label">{schema.label}</span>
                            <input type="text" placeholder={schema.label} value={value} on:input={(event) => save_setting(key, event.target.value, schema)}>
                        </div>
                    {/if}
                {/if}
            </li>
        {/if}
    {/each}
</ul>

<style>
    .delete-btn {
        width: auto;
    }
</style>