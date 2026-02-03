---
layout: default
title: Api Reference
---

# PlayFab for GameMaker - API Reference

Complete documentation for all public functions in the PlayFab GameMaker Extension.

## Table of Contents

- [Callback Pattern](#callback-pattern)
- [Core Module](#core-module)
- [Authentication Module](#authentication-module)
- [Player Data Module](#player-data-module)
- [Leaderboard Module](#leaderboard-module)
- [Economy Module](#economy-module)
- [Cloud Script Module](#cloud-script-module)
- [Friends Module](#friends-module)
- [Analytics Module](#analytics-module)

---

## Callback Pattern

All async PlayFab functions use a consistent callback pattern:

```gml
function(success, data) {
    if (success) {
        // Request succeeded
        // data contains the response from PlayFab
    } else {
        // Request failed
        // data contains error information:
        //   data.error        - Error type string
        //   data.errorCode    - Numeric error code
        //   data.errorMessage - Human-readable message
        //   data.errorDetails - Additional details (optional)
    }
}
```

### Common Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1000 | InvalidParams | Invalid request parameters |
| 1001 | AccountNotFound | Player account doesn't exist |
| 1002 | AccountBanned | Player account is banned |
| 1003 | InvalidUsernameOrPassword | Incorrect credentials |
| 1135 | FriendshipAlreadyExists | Already friends with player |
| 1142 | EmailAddressNotLinked | No email linked to account |

---

## Core Module

Functions for initializing and managing the PlayFab SDK.

### playfab_init

Initialize the PlayFab SDK. **Must be called before any other PlayFab function.**

```gml
playfab_init(title_id, [options])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| title_id | string | Your PlayFab Title ID |
| options | struct | Optional configuration |

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| debug_mode | bool | false | Enable verbose logging |
| timeout | real | 30000 | Request timeout in ms |
| retry_count | real | 0 | Retry attempts on failure |

**Returns:** `bool` - True if initialization successful

```gml
// Basic initialization
playfab_init("ABCD1");

// With options
playfab_init("ABCD1", {
    debug_mode: true,
    timeout: 60000
});

// Check result
if (playfab_init("ABCD1")) {
    show_debug_message("PlayFab ready!");
}
```

---

### playfab_reset

Reset the SDK to uninitialized state. Clears all configuration and session data.

```gml
playfab_reset()
```

**Returns:** `undefined`

```gml
// Reset and reinitialize with different title
playfab_reset();
playfab_init("NEW_TITLE");
```

---

### playfab_is_initialized

Check if the SDK has been initialized.

```gml
playfab_is_initialized()
```

**Returns:** `bool` - True if initialized

```gml
if (!playfab_is_initialized()) {
    playfab_init("ABCD1");
}
```

---

### playfab_is_logged_in

Check if a user is currently logged in.

```gml
playfab_is_logged_in()
```

**Returns:** `bool` - True if logged in

```gml
if (playfab_is_logged_in()) {
    // Show main menu
} else {
    // Show login screen
}
```

---

### playfab_get_player_id

Get the current player's PlayFab ID.

```gml
playfab_get_player_id()
```

**Returns:** `string` - PlayFab ID, or empty string if not logged in

```gml
var player_id = playfab_get_player_id();
show_debug_message("Player: " + player_id);
```

---

### playfab_get_entity_id

Get the current player's Entity ID (used for Entity API calls).

```gml
playfab_get_entity_id()
```

**Returns:** `string` - Entity ID, or empty string if not logged in

---

### playfab_get_session_ticket

Get the current session authentication ticket.

```gml
playfab_get_session_ticket()
```

**Returns:** `string` - Session ticket, or empty string if not logged in

---

### playfab_set_debug_mode

Enable or disable debug logging.

```gml
playfab_set_debug_mode(enabled)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| enabled | bool | True to enable logging |

```gml
// Enable detailed logging during development
playfab_set_debug_mode(true);
```

---

### playfab_get_debug_mode

Check if debug mode is enabled.

```gml
playfab_get_debug_mode()
```

**Returns:** `bool` - True if debug mode is on

---

## Authentication Module

Functions for player authentication and account management.

### playfab_login_with_device_id

Login using the device's unique identifier. Creates a new account if one doesn't exist.

```gml
playfab_login_with_device_id(callback, [create_account])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |
| create_account | bool | Create account if not exists (default: true) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    PlayFabId: "ABC123DEF456",
    SessionTicket: "...",
    NewlyCreated: true/false,
    EntityToken: { ... },
    InfoResultPayload: { PlayerProfile: { ... } }
}
```

```gml
playfab_login_with_device_id(function(success, data) {
    if (success) {
        show_debug_message("Logged in: " + data.PlayFabId);

        if (data.NewlyCreated) {
            show_debug_message("New account created!");
        }
    } else {
        show_debug_message("Login failed: " + data.errorMessage);
    }
});
```

---

### playfab_login_with_email

Login with email and password.

```gml
playfab_login_with_email(email, password, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| email | string | Player's email address |
| password | string | Account password |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_login_with_email("player@email.com", "YOUR_PASSWORD", function(success, data) {
    if (success) {
        show_debug_message("Welcome back!");
    } else {
        if (data.errorCode == 1001) {
            show_debug_message("Account not found");
        } else if (data.errorCode == 1003) {
            show_debug_message("Wrong password");
        }
    }
});
```

---

### playfab_login_with_username

Login with username and password.

```gml
playfab_login_with_username(username, password, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Player's username |
| password | string | Account password |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_login_with_username("PlayerOne", "YOUR_PASSWORD", function(success, data) {
    if (success) {
        show_debug_message("Logged in as: " + data.PlayFabId);
    }
});
```

---

### playfab_login_with_custom_id

Login with a custom identifier string.

```gml
playfab_login_with_custom_id(custom_id, callback, [create_account])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| custom_id | string | Custom identifier (1-100 chars) |
| callback | function | Callback function |
| create_account | bool | Create if not exists (default: true) |

**Returns:** `real` - Request ID

```gml
// Use your own identifier system
var my_id = "user_" + string(global.user_id);
playfab_login_with_custom_id(my_id, function(success, data) {
    if (success) {
        show_debug_message("Logged in with custom ID");
    }
});
```

---

### playfab_login_with_steam

Login using Steam authentication.

```gml
playfab_login_with_steam(steam_ticket, callback, [create_account])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| steam_ticket | string | Steam auth session ticket |
| callback | function | Callback function |
| create_account | bool | Create if not exists (default: true) |

**Returns:** `real` - Request ID

```gml
// Get Steam ticket from Steamworks extension
var steam_ticket = steam_get_auth_session_ticket();

playfab_login_with_steam(steam_ticket, function(success, data) {
    if (success) {
        show_debug_message("Steam login successful!");
    }
});
```

---

### playfab_is_steam_available

Check if Steam functions are available.

```gml
playfab_is_steam_available()
```

**Returns:** `bool` - True if Steam is available

---

### playfab_register_with_email

Register a new account with email, password, and username. Automatically logs in on success.

```gml
playfab_register_with_email(email, password, username, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| email | string | Email address |
| password | string | Password (6-100 chars) |
| username | string | Display name (3-25 chars) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_register_with_email("new@player.com", "YOUR_PASSWORD", "NewPlayer", function(success, data) {
    if (success) {
        show_debug_message("Account created! ID: " + data.PlayFabId);
    } else {
        if (data.errorCode == 1006) {
            show_debug_message("Email already registered");
        }
    }
});
```

---

### playfab_register_with_username

Register with username and password only (no email required).

```gml
playfab_register_with_username(username, password, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Username (3-20 chars) |
| password | string | Password (6-100 chars) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_logout

Log out the current player (synchronous).

```gml
playfab_logout()
```

**Returns:** `undefined`

```gml
playfab_logout();
show_debug_message("Logged out");
room_goto(rm_login);
```

---

### playfab_force_logout

Force logout even if requests are pending.

```gml
playfab_force_logout()
```

**Returns:** `undefined`

---

### playfab_is_session_valid

Check if the current session appears valid (local check only).

```gml
playfab_is_session_valid()
```

**Returns:** `bool` - True if session appears valid

---

### playfab_get_login_info

Get current login state as a struct.

```gml
playfab_get_login_info()
```

**Returns:** `struct`
```gml
{
    logged_in: true/false,
    player_id: "ABC123",
    entity_id: "...",
    entity_type: "title_player_account",
    has_session_ticket: true/false,
    has_entity_token: true/false
}
```

---

### playfab_get_session_time_remaining

Get estimated time remaining on session.

```gml
playfab_get_session_time_remaining()
```

**Returns:** `real` - Seconds remaining, or -1 if unknown

---

### playfab_link_email

Link email and password to current account (upgrade guest account).

```gml
playfab_link_email(email, password, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| email | string | Email address |
| password | string | Password |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// After device login, offer account upgrade
playfab_link_email("player@email.com", "YOUR_PASSWORD", function(success, data) {
    if (success) {
        show_debug_message("Account upgraded! You can now login with email.");
    }
});
```

---

### playfab_link_email_with_username

Link email, password, and username to current account.

```gml
playfab_link_email_with_username(email, password, username, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| email | string | Email address |
| password | string | Password |
| username | string | Display name |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_link_device_id

Link current device to account.

```gml
playfab_link_device_id(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_unlink_device_id

Unlink current device from account.

```gml
playfab_unlink_device_id(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_link_custom_id

Link a custom ID to current account.

```gml
playfab_link_custom_id(custom_id, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| custom_id | string | Custom identifier |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_unlink_custom_id

Unlink a custom ID from account.

```gml
playfab_unlink_custom_id(custom_id, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| custom_id | string | Custom identifier to unlink |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_link_steam

Link Steam account to current account.

```gml
playfab_link_steam(steam_ticket, callback, [force_link])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| steam_ticket | string | Steam auth ticket |
| callback | function | Callback function |
| force_link | bool | Force link even if Steam is linked elsewhere (default: false) |

**Returns:** `real` - Request ID

---

### playfab_unlink_steam

Unlink Steam account.

```gml
playfab_unlink_steam(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_get_linked_accounts

Get information about all linked authentication methods.

```gml
playfab_get_linked_accounts(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    AccountInfo: {
        Username: "PlayerName",
        Email: "player@email.com",
        CustomIdInfo: { ... },
        SteamInfo: { ... }
    }
}
```

---

### playfab_update_display_name

Update the player's display name.

```gml
playfab_update_display_name(display_name, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| display_name | string | New display name (3-25 chars) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_update_display_name("CoolPlayer99", function(success, data) {
    if (success) {
        show_debug_message("Name updated!");
    }
});
```

---

## Player Data Module

Functions for storing and retrieving player data.

### playfab_player_data_get

Get player data for specific keys.

```gml
playfab_player_data_get(keys, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| keys | string/array | Key or array of keys to retrieve |
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Data: {
        "key_name": {
            Value: "stored_value",
            LastUpdated: "2024-01-15T10:30:00Z",
            Permission: "Private"
        }
    }
}
```

```gml
// Get single key
playfab_player_data_get("high_score", function(success, data) {
    if (success) {
        var score = playfab_data_extract_value(data, "high_score", "0");
        global.high_score = real(score);
    }
});

// Get multiple keys
playfab_player_data_get(["level", "coins", "inventory"], function(success, data) {
    if (success) {
        global.level = real(playfab_data_extract_value(data, "level", "1"));
        global.coins = real(playfab_data_extract_value(data, "coins", "0"));
        global.inventory = playfab_data_extract_json(data, "inventory", []);
    }
});
```

---

### playfab_player_data_get_all

Get all player data.

```gml
playfab_player_data_get_all(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_player_data_get_all(function(success, data) {
    if (success) {
        // data.Data contains all stored key-value pairs
        var keys = variable_struct_get_names(data.Data);
        show_debug_message("Found " + string(array_length(keys)) + " keys");
    }
});
```

---

### playfab_player_data_get_for_player

Get another player's public data.

```gml
playfab_player_data_get_for_player(player_id, keys, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| player_id | string | Other player's PlayFab ID |
| keys | string/array | Keys to retrieve |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Get friend's public profile
playfab_player_data_get_for_player(friend_id, "profile", function(success, data) {
    if (success) {
        var profile = playfab_data_extract_json(data, "profile", {});
    }
});
```

---

### playfab_player_readonly_data_get

Get read-only player data (can only be set by server/CloudScript).

```gml
playfab_player_readonly_data_get(keys, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| keys | string/array | Keys to retrieve |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_player_data_set

Set a single player data key.

```gml
playfab_player_data_set(key, value, callback, [permission])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | Key name (max 50 chars) |
| value | any | Value (max 10KB, auto-converted to JSON if struct/array) |
| callback | function | Callback function |
| permission | string | "Private" or "Public" (default: "Private") |

**Returns:** `real` - Request ID

```gml
// Save simple value
playfab_player_data_set("level", 5, function(success, data) {
    if (success) show_debug_message("Level saved!");
});

// Save complex object (automatically JSON-encoded)
var save_game = {
    level: 5,
    coins: 1000,
    position: { x: 100, y: 200 },
    inventory: ["sword", "shield"]
};
playfab_player_data_set("save_game", save_game, function(success, data) {
    if (success) show_debug_message("Game saved!");
});

// Save public data (visible to other players)
playfab_player_data_set("profile_bio", "I love gaming!", function(s, d) {
    // Saved as public
}, "Public");
```

---

### playfab_player_data_set_multiple

Set multiple player data keys at once.

```gml
playfab_player_data_set_multiple(data_struct, callback, [permission])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| data_struct | struct | Struct of key-value pairs |
| callback | function | Callback function |
| permission | string | "Private" or "Public" (default: "Private") |

**Returns:** `real` - Request ID

```gml
playfab_player_data_set_multiple({
    level: 5,
    coins: 1000,
    last_played: date_datetime_string(date_current_datetime())
}, function(success, data) {
    if (success) show_debug_message("All data saved!");
});
```

---

### playfab_player_data_delete

Delete one or more player data keys.

```gml
playfab_player_data_delete(keys, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| keys | string/array | Key(s) to delete |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Delete single key
playfab_player_data_delete("old_save", function(success, data) {
    if (success) show_debug_message("Deleted!");
});

// Delete multiple keys
playfab_player_data_delete(["temp1", "temp2", "temp3"], function(success, data) {
    // All deleted
});
```

---

### playfab_player_data_clear_all

Delete ALL player data. **Warning: This is irreversible!**

```gml
playfab_player_data_clear_all(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Use with confirmation!
if (show_question("Delete ALL save data? This cannot be undone!")) {
    playfab_player_data_clear_all(function(success, data) {
        if (success) show_debug_message("All data deleted");
    });
}
```

---

### playfab_title_data_get

Get title data (read-only game configuration set in PlayFab dashboard).

```gml
playfab_title_data_get(keys, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| keys | string/array/undefined | Keys to get, or undefined for all |
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Data: {
        "game_version": "1.0.0",
        "maintenance_mode": "false",
        "daily_reward": "{\"coins\":100,\"gems\":5}"
    }
}
```

```gml
// Get specific title data
playfab_title_data_get("game_version", function(success, data) {
    if (success) {
        var version = playfab_title_data_extract(data, "game_version", "1.0.0");
        show_debug_message("Game version: " + version);
    }
});

// Get all title data
playfab_title_data_get(undefined, function(success, data) {
    if (success) {
        // Check maintenance mode
        var maintenance = playfab_title_data_extract(data, "maintenance_mode", "false");
        if (maintenance == "true") {
            show_message("Game is under maintenance!");
        }
    }
});
```

---

### playfab_title_news_get

Get title news/announcements.

```gml
playfab_title_news_get(callback, [count])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |
| count | real | Number of news items (default: 10) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    News: [
        {
            NewsId: "...",
            Title: "Update 1.5 Released!",
            Body: "We've added new features...",
            Timestamp: "2024-01-15T10:00:00Z"
        }
    ]
}
```

---

### Data Helper Functions

#### playfab_data_extract_value

Safely extract a value from player data response.

```gml
playfab_data_extract_value(data, key, [default_value])
```

**Returns:** `string` - The value, or default if not found

```gml
var score = playfab_data_extract_value(data, "high_score", "0");
global.high_score = real(score);
```

---

#### playfab_data_extract_json

Extract and parse JSON from player data.

```gml
playfab_data_extract_json(data, key, [default_value])
```

**Returns:** `any` - Parsed JSON value, or default if not found

```gml
var inventory = playfab_data_extract_json(data, "inventory", []);
// inventory is now an array
```

---

#### playfab_data_key_exists

Check if a key exists in player data.

```gml
playfab_data_key_exists(data, key)
```

**Returns:** `bool` - True if key exists

---

#### playfab_title_data_extract

Extract a value from title data response.

```gml
playfab_title_data_extract(data, key, [default_value])
```

**Returns:** `string` - The value, or default if not found

---

#### playfab_title_data_extract_json

Extract and parse JSON from title data.

```gml
playfab_title_data_extract_json(data, key, [default_value])
```

**Returns:** `any` - Parsed JSON value

---

## Leaderboard Module

Functions for leaderboards and player statistics.

### playfab_leaderboard_get

Get leaderboard entries starting from a specific position.

```gml
playfab_leaderboard_get(statistic_name, start_position, max_results, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic/leaderboard |
| start_position | real | Starting rank (0-indexed) |
| max_results | real | Number of entries (1-100) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Leaderboard: [
        {
            Position: 0,          // 0-indexed rank
            PlayFabId: "ABC123",
            DisplayName: "Player1",
            StatValue: 10000
        },
        // ... more entries
    ],
    Version: 1,
    NextReset: "2024-01-22T00:00:00Z"  // For resetting leaderboards
}
```

```gml
// Get positions 10-19 (ranks 11-20)
playfab_leaderboard_get("HighScore", 10, 10, function(success, data) {
    if (success) {
        var entries = data.Leaderboard;
        for (var i = 0; i < array_length(entries); i++) {
            var entry = entries[i];
            show_debug_message("#" + string(entry.Position + 1) + " " +
                entry.DisplayName + ": " + string(entry.StatValue));
        }
    }
});
```

---

### playfab_leaderboard_get_top

Convenience function to get top N entries.

```gml
playfab_leaderboard_get_top(statistic_name, count, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| count | real | Number of top entries (1-100) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Get top 10 players
playfab_leaderboard_get_top("HighScore", 10, function(success, data) {
    if (success) {
        var entries = data.Leaderboard;
        // Display leaderboard...
    }
});
```

---

### playfab_leaderboard_get_around_player

Get leaderboard entries centered on the current player.

```gml
playfab_leaderboard_get_around_player(statistic_name, max_above_below, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| max_above_below | real | Entries above/below player (0-50) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Get 5 players above and below current player
playfab_leaderboard_get_around_player("HighScore", 5, function(success, data) {
    if (success) {
        // Player is in the middle of the results
        var entries = data.Leaderboard;
        // Find current player
        for (var i = 0; i < array_length(entries); i++) {
            if (entries[i].PlayFabId == playfab_get_player_id()) {
                show_debug_message("Your rank: #" + string(entries[i].Position + 1));
                break;
            }
        }
    }
});
```

---

### playfab_leaderboard_get_player_rank

Get only the current player's rank.

```gml
playfab_leaderboard_get_player_rank(statistic_name, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_leaderboard_get_player_rank("HighScore", function(success, data) {
    if (success && array_length(data.Leaderboard) > 0) {
        var my_entry = data.Leaderboard[0];
        show_debug_message("Your rank: #" + string(my_entry.Position + 1));
        show_debug_message("Your score: " + string(my_entry.StatValue));
    }
});
```

---

### playfab_leaderboard_get_around_other_player

Get leaderboard centered on another player.

```gml
playfab_leaderboard_get_around_other_player(statistic_name, player_id, max_above_below, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| player_id | string | Other player's PlayFab ID |
| max_above_below | real | Entries above/below (0-50) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_leaderboard_get_friends

Get leaderboard for friends only.

```gml
playfab_leaderboard_get_friends(statistic_name, callback, [max_results])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| callback | function | Callback function |
| max_results | real | Max entries (default: 100) |

**Returns:** `real` - Request ID

```gml
playfab_leaderboard_get_friends("HighScore", function(success, data) {
    if (success) {
        show_debug_message("Friends leaderboard:");
        var entries = data.Leaderboard;
        for (var i = 0; i < array_length(entries); i++) {
            show_debug_message(entries[i].DisplayName + ": " + string(entries[i].StatValue));
        }
    }
});
```

---

### playfab_leaderboard_get_friends_with_steam

Get friends leaderboard including Steam friends.

```gml
playfab_leaderboard_get_friends_with_steam(statistic_name, callback, [max_results])
```

---

### playfab_leaderboard_get_friends_with_facebook

Get friends leaderboard including Facebook friends.

```gml
playfab_leaderboard_get_friends_with_facebook(statistic_name, callback, [max_results])
```

---

### playfab_leaderboard_get_friends_all_platforms

Get friends leaderboard from all connected platforms.

```gml
playfab_leaderboard_get_friends_all_platforms(statistic_name, callback, [max_results])
```

---

### playfab_statistic_update

Update a single player statistic.

```gml
playfab_statistic_update(statistic_name, value, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_name | string | Name of the statistic |
| value | real | New value (floored to integer) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Submit high score
playfab_statistic_update("HighScore", global.score, function(success, data) {
    if (success) {
        show_debug_message("Score submitted to leaderboard!");
    }
});
```

**Note:** Statistic aggregation (max, min, last, sum) is configured in PlayFab dashboard. Default is "Last" (overwrites).

---

### playfab_statistics_update_multiple

Update multiple statistics at once.

```gml
playfab_statistics_update_multiple(statistics_array, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistics_array | array | Array of {name, value} structs |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_statistics_update_multiple([
    { name: "HighScore", value: 10000 },
    { name: "GamesPlayed", value: 1 },
    { name: "TotalCoins", value: 500 }
], function(success, data) {
    if (success) {
        show_debug_message("All statistics updated!");
    }
});
```

---

### playfab_statistics_get

Get specific statistics for the current player.

```gml
playfab_statistics_get(statistic_names, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| statistic_names | string/array | Statistic name(s) |
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Statistics: [
        {
            StatisticName: "HighScore",
            Value: 10000,
            Version: 1
        }
    ]
}
```

---

### playfab_statistics_get_all

Get all statistics for the current player.

```gml
playfab_statistics_get_all(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_statistics_get_all(function(success, data) {
    if (success) {
        var stats = playfab_statistics_to_struct(data);
        // stats is now { HighScore: 10000, GamesPlayed: 50, ... }
    }
});
```

---

### Leaderboard Helper Functions

#### playfab_leaderboard_extract_entries

Extract entries array from leaderboard response.

```gml
playfab_leaderboard_extract_entries(data)
```

**Returns:** `array` - Array of leaderboard entries

---

#### playfab_leaderboard_find_player

Find a specific player in leaderboard data.

```gml
playfab_leaderboard_find_player(data, player_id)
```

**Returns:** `struct` or `undefined`

---

#### playfab_statistic_extract_value

Extract a statistic value from response.

```gml
playfab_statistic_extract_value(data, statistic_name, [default_value])
```

**Returns:** `real` - The value, or default

---

#### playfab_statistics_to_struct

Convert statistics array to struct for easy access.

```gml
playfab_statistics_to_struct(data)
```

**Returns:** `struct` - { StatName: value, ... }

---

## Economy Module

Functions for virtual currencies, catalogs, and purchases.

### playfab_get_catalog_items

Get all items in the game catalog.

```gml
playfab_get_catalog_items(callback, [catalog_version])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |
| catalog_version | string | Catalog version (optional) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Catalog: [
        {
            ItemId: "sword_01",
            DisplayName: "Iron Sword",
            Description: "A basic sword",
            ItemClass: "weapon",
            VirtualCurrencyPrices: {
                "GC": 100  // 100 Gold Coins
            },
            Tags: ["starter", "weapon"],
            CustomData: "..."
        }
    ]
}
```

```gml
playfab_get_catalog_items(function(success, data) {
    if (success) {
        global.catalog = data.Catalog;
        show_debug_message("Loaded " + string(array_length(global.catalog)) + " items");
    }
});
```

---

### playfab_get_player_inventory

Get player's inventory items and virtual currency balances.

```gml
playfab_get_player_inventory(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Inventory: [
        {
            ItemId: "sword_01",
            ItemInstanceId: "instance_123",  // Unique instance ID
            DisplayName: "Iron Sword",
            RemainingUses: 10,  // For consumables
            CustomData: { ... }
        }
    ],
    VirtualCurrency: {
        "GC": 1000,  // Gold Coins
        "DI": 50     // Diamonds
    }
}
```

```gml
playfab_get_player_inventory(function(success, data) {
    if (success) {
        // Get currency balances
        global.gold = playfab_currency_get_balance(data, "GC");
        global.gems = playfab_currency_get_balance(data, "DI");

        // Get inventory items
        global.inventory = data.Inventory;
    }
});
```

---

### playfab_get_virtual_currency

Get only virtual currency balances (no inventory).

```gml
playfab_get_virtual_currency(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_purchase_item

Purchase an item with virtual currency.

```gml
playfab_purchase_item(item_id, virtual_currency, price, callback, [catalog_version])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| item_id | string | Item ID to purchase |
| virtual_currency | string | Currency code (e.g., "GC") |
| price | real | Price (must match catalog for security) |
| callback | function | Callback function |
| catalog_version | string | Catalog version (optional) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Items: [
        {
            ItemId: "sword_01",
            ItemInstanceId: "new_instance_456"
        }
    ]
}
```

```gml
// Purchase item for 100 gold
playfab_purchase_item("sword_01", "GC", 100, function(success, data) {
    if (success) {
        show_debug_message("Purchased! Instance ID: " + data.Items[0].ItemInstanceId);
        // Refresh inventory
        playfab_get_player_inventory(refresh_callback);
    } else {
        if (data.errorCode == 1059) {
            show_debug_message("Not enough currency!");
        }
    }
});
```

---

### playfab_purchase_item_from_store

Purchase from a specific store with store pricing.

```gml
playfab_purchase_item_from_store(item_id, virtual_currency, price, callback, [catalog_version], [store_id])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| item_id | string | Item ID |
| virtual_currency | string | Currency code |
| price | real | Store price |
| callback | function | Callback function |
| catalog_version | string | Catalog version (optional) |
| store_id | string | Store ID (optional) |

**Returns:** `real` - Request ID

---

### playfab_get_store_items

Get items from a specific store.

```gml
playfab_get_store_items(store_id, callback, [catalog_version])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| store_id | string | Store ID |
| callback | function | Callback function |
| catalog_version | string | Catalog version (optional) |

**Returns:** `real` - Request ID

---

### playfab_consume_item

Consume/use an inventory item.

```gml
playfab_consume_item(item_instance_id, consume_count, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| item_instance_id | string | **Instance ID** (not ItemId!) |
| consume_count | real | Number of uses to consume |
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Important:** Use the `ItemInstanceId` from inventory, not the catalog `ItemId`.

**Callback Data (success):**
```gml
{
    ItemInstanceId: "instance_123",
    RemainingUses: 9  // Remaining uses after consumption
}
```

```gml
// Use a health potion
var potion = playfab_inventory_find_item(inventory_data, "health_potion");
if (potion != undefined) {
    playfab_consume_item(potion.ItemInstanceId, 1, function(success, data) {
        if (success) {
            show_debug_message("Potion used! Remaining: " + string(data.RemainingUses));
            // Apply potion effect
            global.health = min(global.health + 50, global.max_health);
        }
    });
}
```

---

### playfab_unlock_container

Open a container/lootbox item.

```gml
playfab_unlock_container(container_instance_id, callback, [key_instance_id])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| container_instance_id | string | Container instance ID |
| callback | function | Callback function |
| key_instance_id | string | Key instance ID if required (optional) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    GrantedItems: [
        { ItemId: "rare_sword", ItemInstanceId: "..." }
    ],
    VirtualCurrency: {
        "GC": 100  // Currency granted
    }
}
```

---

### Economy Helper Functions

#### playfab_catalog_find_item

Find an item in catalog by ItemId.

```gml
playfab_catalog_find_item(catalog_data, item_id)
```

**Returns:** `struct` or `undefined`

---

#### playfab_catalog_get_price

Get item price in specific currency.

```gml
playfab_catalog_get_price(item, currency_code)
```

**Returns:** `real` - Price, or -1 if not available

---

#### playfab_catalog_filter_by_class

Filter catalog items by class.

```gml
playfab_catalog_filter_by_class(catalog_data, item_class)
```

**Returns:** `array` - Filtered items

```gml
var weapons = playfab_catalog_filter_by_class(catalog_data, "weapon");
```

---

#### playfab_catalog_filter_by_tag

Filter catalog items by tag.

```gml
playfab_catalog_filter_by_tag(catalog_data, tag)
```

**Returns:** `array` - Filtered items

---

#### playfab_inventory_find_item

Find first inventory item by ItemId.

```gml
playfab_inventory_find_item(inventory_data, item_id)
```

**Returns:** `struct` or `undefined`

---

#### playfab_inventory_find_all_items

Find all instances of an item.

```gml
playfab_inventory_find_all_items(inventory_data, item_id)
```

**Returns:** `array` - All matching instances

---

#### playfab_inventory_has_item

Check if player owns an item.

```gml
playfab_inventory_has_item(inventory_data, item_id)
```

**Returns:** `bool`

---

#### playfab_inventory_count_item

Count how many of an item the player owns.

```gml
playfab_inventory_count_item(inventory_data, item_id)
```

**Returns:** `real` - Count

---

#### playfab_currency_get_balance

Get balance of a specific currency.

```gml
playfab_currency_get_balance(inventory_data, currency_code)
```

**Returns:** `real` - Balance

```gml
var gold = playfab_currency_get_balance(data, "GC");
```

---

#### playfab_can_afford

Check if player can afford a purchase.

```gml
playfab_can_afford(inventory_data, currency_code, amount)
```

**Returns:** `bool`

```gml
if (playfab_can_afford(data, "GC", 100)) {
    // Player has enough gold
}
```

---

#### playfab_validate_purchase

Validate a purchase before attempting.

```gml
playfab_validate_purchase(catalog_data, inventory_data, item_id, currency_code)
```

**Returns:** `struct` - { valid, price, balance, error }

```gml
var result = playfab_validate_purchase(catalog, inventory, "sword_01", "GC");
if (result.valid) {
    playfab_purchase_item("sword_01", "GC", result.price, callback);
} else {
    show_debug_message("Cannot purchase: " + result.error);
}
```

---

#### playfab_use_item_by_id

Convenience function to consume item by ItemId (finds instance automatically).

```gml
playfab_use_item_by_id(inventory_data, item_id, callback)
```

**Returns:** `real` - Request ID, or -1 if not found

---

## Cloud Script Module

Functions for executing server-side CloudScript.

### playfab_execute_cloud_script

Execute a CloudScript function.

```gml
playfab_execute_cloud_script(function_name, callback, [function_parameter])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| function_name | string | CloudScript function name |
| callback | function | Callback function |
| function_parameter | struct | Parameters to pass (optional) |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    FunctionName: "grantDailyReward",
    FunctionResult: {
        // Whatever your CloudScript returns
        success: true,
        coinsGranted: 100
    },
    ExecutionTimeSeconds: 0.05,
    Logs: [
        { Level: "Info", Message: "Granted 100 coins" }
    ],
    Error: undefined  // Or error details if script threw
}
```

```gml
// Call CloudScript function
playfab_execute_cloud_script("grantDailyReward", function(success, data) {
    if (success) {
        var result = playfab_cloud_script_get_result(data);
        if (result.success) {
            show_debug_message("Granted: " + string(result.coinsGranted) + " coins");
        }
    }
});

// With parameters
playfab_execute_cloud_script("processGameResults", function(success, data) {
    // Handle response
}, {
    score: 10000,
    level: 5,
    gameTime: 120
});
```

---

### playfab_cloud_call

Simplified CloudScript call with separate handlers.

```gml
playfab_cloud_call(function_name, params, on_success, [on_error])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| function_name | string | Function name |
| params | struct | Parameters |
| on_success | function | Success callback (receives FunctionResult) |
| on_error | function | Error callback (optional) |

**Returns:** `real` - Request ID

```gml
playfab_cloud_call("grantDailyReward", {}, function(result) {
    // result is the FunctionResult directly
    show_debug_message("Coins: " + string(result.coinsGranted));
}, function(error) {
    show_debug_message("Error: " + error.errorMessage);
});
```

---

### CloudScript Helper Functions

#### playfab_cloud_script_get_result

Extract FunctionResult from response.

```gml
playfab_cloud_script_get_result(data)
```

**Returns:** `any` - The function's return value

---

#### playfab_cloud_script_get_logs

Get log messages from execution.

```gml
playfab_cloud_script_get_logs(data)
```

**Returns:** `array` - Log entries

---

#### playfab_cloud_script_had_error

Check if script threw an error.

```gml
playfab_cloud_script_had_error(data)
```

**Returns:** `bool`

---

#### playfab_cloud_script_get_error

Get error details.

```gml
playfab_cloud_script_get_error(data)
```

**Returns:** `struct` or `undefined`

---

#### playfab_cloud_script_get_execution_time

Get execution time in seconds.

```gml
playfab_cloud_script_get_execution_time(data)
```

**Returns:** `real` - Seconds

---

## Friends Module

Functions for managing friends lists.

### playfab_get_friends_list

Get the player's friends list.

```gml
playfab_get_friends_list(callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |

**Returns:** `real` - Request ID

**Callback Data (success):**
```gml
{
    Friends: [
        {
            FriendPlayFabId: "ABC123",
            TitleDisplayName: "PlayerOne",
            Tags: ["favorite", "clan_member"],
            Profile: { ... }
        }
    ]
}
```

```gml
playfab_get_friends_list(function(success, data) {
    if (success) {
        global.friends = data.Friends;
        show_debug_message("Friends: " + string(array_length(global.friends)));
    }
});
```

---

### playfab_friends_get_list

Get friends list with profile options.

```gml
playfab_friends_get_list(callback, [include_profiles])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| callback | function | Callback function |
| include_profiles | bool | Include profile data (default: true) |

**Returns:** `real` - Request ID

---

### playfab_friends_get_list_with_steam

Get friends including Steam friends.

```gml
playfab_friends_get_list_with_steam(callback)
```

---

### playfab_friends_get_list_with_facebook

Get friends including Facebook friends.

```gml
playfab_friends_get_list_with_facebook(callback)
```

---

### playfab_add_friend

Add a friend by PlayFab ID.

```gml
playfab_add_friend(friend_playfab_id, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| friend_playfab_id | string | Friend's PlayFab ID |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_add_friend("ABC123DEF456", function(success, data) {
    if (success) {
        show_debug_message("Friend added!");
    } else {
        if (data.errorCode == 1135) {
            show_debug_message("Already friends!");
        }
    }
});
```

**Note:** PlayFab's friend system is one-way by default. Both players need to add each other to be mutual friends.

---

### playfab_friends_add_by_username

Add friend by display name.

```gml
playfab_friends_add_by_username(username, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Friend's display name |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_friends_add_by_email

Add friend by email address.

```gml
playfab_friends_add_by_email(email, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| email | string | Friend's email |
| callback | function | Callback function |

**Returns:** `real` - Request ID

---

### playfab_remove_friend

Remove a friend.

```gml
playfab_remove_friend(friend_playfab_id, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| friend_playfab_id | string | Friend's PlayFab ID |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_remove_friend("ABC123DEF456", function(success, data) {
    if (success) {
        show_debug_message("Friend removed");
    }
});
```

---

### playfab_friends_set_tags

Set tags for a friend.

```gml
playfab_friends_set_tags(friend_id, tags, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| friend_id | string | Friend's PlayFab ID |
| tags | array | Array of tag strings |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
// Add tags to categorize friends
playfab_friends_set_tags("ABC123", ["clan_member", "favorite"], function(success, data) {
    if (success) {
        show_debug_message("Tags set!");
    }
});
```

---

### Friends Helper Functions

#### playfab_friends_extract_list

Extract friends array from response.

```gml
playfab_friends_extract_list(data)
```

**Returns:** `array` - Friends array

---

#### playfab_friends_find

Find friend by PlayFab ID.

```gml
playfab_friends_find(data, friend_id)
```

**Returns:** `struct` or `undefined`

---

#### playfab_friends_get_count

Get number of friends.

```gml
playfab_friends_get_count(data)
```

**Returns:** `real`

---

#### playfab_friends_has_tag

Check if friend has a specific tag.

```gml
playfab_friends_has_tag(friend, tag)
```

**Returns:** `bool`

---

#### playfab_friends_filter_by_tag

Get all friends with a tag.

```gml
playfab_friends_filter_by_tag(data, tag)
```

**Returns:** `array`

---

#### playfab_friends_is_friend

Check if a player is in the friends list.

```gml
playfab_friends_is_friend(data, player_id)
```

**Returns:** `bool`

---

## Analytics Module

Functions for tracking player events and behavior.

### playfab_write_event

Write a custom analytics event.

```gml
playfab_write_event(event_name, callback, [body])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| event_name | string | Event name |
| callback | function | Callback function |
| body | struct | Event data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_write_event("level_complete", function(success, data) {
    // Event recorded
}, {
    level: 5,
    time: 120,
    score: 10000
});
```

---

### playfab_analytics_write_events

Write multiple events at once.

```gml
playfab_analytics_write_events(events, callback)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| events | array | Array of {name, body} structs |
| callback | function | Callback function |

**Returns:** `real` - Request ID

```gml
playfab_analytics_write_events([
    { name: "coin_collected", body: { amount: 10 } },
    { name: "enemy_killed", body: { enemy_type: "goblin" } }
], function(success, data) {
    // Events recorded
});
```

---

### playfab_track

Fire-and-forget event tracking (no callback needed).

```gml
playfab_track(event_name, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| event_name | string | Event name |
| data | struct | Event data (optional) |

**Returns:** `real` - Request ID

```gml
// Simple tracking - no callback needed
playfab_track("game_started");
playfab_track("item_purchased", { item: "sword", price: 100 });
playfab_track("achievement_unlocked", { id: "first_kill" });
```

---

### playfab_track_level_start

Track level/stage start.

```gml
playfab_track_level_start(level_id, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| level_id | string | Level identifier |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_track_level_start("level_5");
playfab_track_level_start("boss_fight", { difficulty: "hard" });
```

---

### playfab_track_level_complete

Track level completion.

```gml
playfab_track_level_complete(level_id, [data])
```

```gml
playfab_track_level_complete("level_5", {
    time: 120,
    score: 10000,
    stars: 3
});
```

---

### playfab_track_level_failed

Track level failure.

```gml
playfab_track_level_failed(level_id, [data])
```

```gml
playfab_track_level_failed("level_5", {
    reason: "out_of_time",
    progress: 0.75
});
```

---

### playfab_track_purchase

Track an in-game purchase.

```gml
playfab_track_purchase(item_id, currency, amount, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| item_id | string | Item purchased |
| currency | string | Currency used |
| amount | real | Amount spent |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_track_purchase("gem_pack", "USD", 4.99);
playfab_track_purchase("sword_01", "GC", 100, { store: "main_shop" });
```

---

### playfab_track_error

Track an error event.

```gml
playfab_track_error(error_type, message, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| error_type | string | Error category |
| message | string | Error message |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_track_error("network", "Connection timeout", {
    endpoint: "/Client/GetPlayerData",
    retry_count: 3
});
```

---

### playfab_track_session_start

Track session start.

```gml
playfab_track_session_start([data])
```

```gml
playfab_track_session_start({
    platform: os_type,
    version: "1.0.0"
});
```

---

### playfab_track_session_end

Track session end.

```gml
playfab_track_session_end(duration_seconds, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| duration_seconds | real | Session duration |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
// At game close
var session_time = (current_time - global.session_start) / 1000;
playfab_track_session_end(session_time, {
    levels_played: global.levels_completed,
    coins_earned: global.coins_earned
});
```

---

### playfab_track_tutorial_step

Track tutorial progress.

```gml
playfab_track_tutorial_step(step_id, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| step_id | string | Tutorial step identifier |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_track_tutorial_step("intro_complete");
playfab_track_tutorial_step("combat_tutorial", { skipped: false });
```

---

### playfab_track_achievement

Track achievement unlock.

```gml
playfab_track_achievement(achievement_id, [data])
```

| Parameter | Type | Description |
|-----------|------|-------------|
| achievement_id | string | Achievement identifier |
| data | struct | Additional data (optional) |

**Returns:** `real` - Request ID

```gml
playfab_track_achievement("first_win");
playfab_track_achievement("score_master", { score: 100000 });
```

---

## Index

### All Functions by Module

**Core (9 functions)**
- playfab_init
- playfab_reset
- playfab_is_initialized
- playfab_is_logged_in
- playfab_get_player_id
- playfab_get_entity_id
- playfab_get_session_ticket
- playfab_set_debug_mode
- playfab_get_debug_mode

**Authentication (23 functions)**
- playfab_login_with_device_id
- playfab_login_with_email
- playfab_login_with_username
- playfab_login_with_custom_id
- playfab_login_with_steam
- playfab_is_steam_available
- playfab_register_with_email
- playfab_register_with_username
- playfab_logout
- playfab_force_logout
- playfab_is_session_valid
- playfab_get_login_info
- playfab_get_session_time_remaining
- playfab_link_email
- playfab_link_email_with_username
- playfab_link_device_id
- playfab_unlink_device_id
- playfab_link_custom_id
- playfab_unlink_custom_id
- playfab_link_steam
- playfab_unlink_steam
- playfab_get_linked_accounts
- playfab_update_display_name

**Player Data (16 functions)**
- playfab_player_data_get
- playfab_player_data_get_all
- playfab_player_data_get_for_player
- playfab_player_readonly_data_get
- playfab_player_data_set
- playfab_player_data_set_multiple
- playfab_player_data_delete
- playfab_player_data_clear_all
- playfab_title_data_get
- playfab_title_news_get
- playfab_internal_title_data_get
- playfab_data_extract_value
- playfab_data_extract_json
- playfab_data_key_exists
- playfab_title_data_extract
- playfab_title_data_extract_json

**Leaderboard (20 functions)**
- playfab_leaderboard_get
- playfab_leaderboard_get_top
- playfab_leaderboard_get_around_player
- playfab_leaderboard_get_player_rank
- playfab_leaderboard_get_around_other_player
- playfab_leaderboard_get_friends
- playfab_leaderboard_get_friends_with_steam
- playfab_leaderboard_get_friends_with_facebook
- playfab_leaderboard_get_friends_all_platforms
- playfab_statistic_update
- playfab_statistics_update_multiple
- playfab_statistics_get
- playfab_statistics_get_all
- playfab_leaderboard_extract_entries
- playfab_leaderboard_find_player
- playfab_leaderboard_get_version
- playfab_leaderboard_get_next_reset
- playfab_statistic_extract_value
- playfab_statistic_extract_version
- playfab_statistics_to_struct

**Economy (24 functions)**
- playfab_get_catalog_items
- playfab_get_player_inventory
- playfab_get_virtual_currency
- playfab_purchase_item
- playfab_purchase_item_from_store
- playfab_get_store_items
- playfab_consume_item
- playfab_unlock_container
- playfab_catalog_find_item
- playfab_catalog_get_price
- playfab_catalog_filter_by_class
- playfab_catalog_filter_by_tag
- playfab_catalog_to_lookup
- playfab_inventory_find_item
- playfab_inventory_find_all_items
- playfab_inventory_has_item
- playfab_inventory_count_item
- playfab_inventory_get_total_uses
- playfab_currency_get_balance
- playfab_can_afford
- playfab_inventory_filter_by_class
- playfab_validate_purchase
- playfab_find_consumable_instance
- playfab_use_item_by_id

**Cloud Script (7 functions)**
- playfab_execute_cloud_script
- playfab_cloud_call
- playfab_cloud_script_get_result
- playfab_cloud_script_get_logs
- playfab_cloud_script_had_error
- playfab_cloud_script_get_error
- playfab_cloud_script_get_execution_time

**Friends (17 functions)**
- playfab_get_friends_list
- playfab_friends_get_list
- playfab_friends_get_list_with_steam
- playfab_friends_get_list_with_facebook
- playfab_add_friend
- playfab_friends_add
- playfab_friends_add_by_username
- playfab_friends_add_by_email
- playfab_remove_friend
- playfab_friends_remove
- playfab_friends_set_tags
- playfab_friends_extract_list
- playfab_friends_find
- playfab_friends_get_count
- playfab_friends_has_tag
- playfab_friends_filter_by_tag
- playfab_friends_is_friend

**Analytics (15 functions)**
- playfab_write_event
- playfab_analytics_write_event
- playfab_analytics_write_events
- playfab_analytics_write_player_event
- playfab_analytics_write_title_event
- playfab_track
- playfab_track_level_start
- playfab_track_level_complete
- playfab_track_level_failed
- playfab_track_purchase
- playfab_track_error
- playfab_track_session_start
- playfab_track_session_end
- playfab_track_tutorial_step
- playfab_track_achievement

---

**Total: 131 public functions**
