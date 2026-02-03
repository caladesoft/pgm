---
layout: default
title: Quick Start
---

# PlayFab for GameMaker - Quick Start Guide

This guide will get you up and running with PlayFab in your GameMaker project in about 10 minutes.

## Prerequisites

Before you begin, make sure you have:

- **GameMaker Studio 2024+** installed (also compatible with GameMaker Studio 2.3+)
- A **PlayFab account** (create one free at [playfab.com](https://playfab.com))
- Your **PlayFab Title ID** (found in your PlayFab Game Manager dashboard)

## PlayFab Dashboard Configuration (Do This First!)

Before running any code, you need to configure your PlayFab title:

### 1. Configure API Features (Required)
1. Log into [developer.playfab.com](https://developer.playfab.com)
2. Select your game title
3. Go to **Settings > Title Settings > API Features**
4. Enable **"Allow client to post player statistics"**
5. **Important**: Under "DISABLE PLAYER CREATIONS", ensure ALL options are **UNCHECKED**:
   - ☐ Disable player creation using Client/LoginWithCustomId
   - ☐ Disable player creation using Client/LoginWithAndroidDeviceId
   - ☐ Disable player creation using Client/LoginWithIOSDeviceId
   - ☐ Disable player creation using Client/LoginWithNintendoSwitchDeviceId
6. Click **Save**

### 2. Create a Leaderboard (Required for Demo)
1. Go to **Leaderboards** in the sidebar
2. Click **New Leaderboard**
3. Configure:
   - **Statistic name**: `HighScore`
   - **Reset frequency**: `Manually` or `Never`
   - **Aggregation method**: `Last` (or `Maximum` for high scores)
4. Click **Save**

### 3. Create Virtual Currencies (Required for Economy Features)
Go to **Economy > Currency** and create:

| Code | Display Name | Initial Deposit |
|------|--------------|-----------------|
| `GC` | Gold Coins   | `100`           |
| `DI` | Diamonds     | `10`            |

New players will automatically receive these initial deposits when they first log in.

## Step 1: Import the Extension

1. Download the extension package (`PlayFab_GMS_Extension.yymps`)

2. Open your GameMaker project

3. Go to **Tools > Import Local Package**

4. Select the downloaded `.yymps` file

5. In the import dialog, select **all resources**:
   - Scripts (playfab_core, playfab_auth, etc.)
   - Objects (obj_playfab_handler)

6. Click **Import**

You should now see a `PlayFab` folder in your Asset Browser with all the scripts.

## Step 2: Add the Handler Object

The extension needs an object to receive HTTP responses from PlayFab.

1. Open your **first room** (or your persistent/initialization room)

2. Drag `obj_playfab_handler` into the room

3. **Important**: This object must exist before making any PlayFab calls

**Alternative**: Make the object persistent so it exists in all rooms:
```gml
// In obj_playfab_handler Create event (optional)
// This is already set up for you, but you can verify
```

## Step 3: Initialize PlayFab

Add initialization code to your game. This should run once when your game starts.

### Option A: In a Controller Object

Create a controller object (e.g., `obj_game_controller`) and add this to its **Create Event**:

```gml
// Initialize PlayFab with your Title ID
// Replace "ABCD1" with your actual Title ID from PlayFab Game Manager
playfab_init("ABCD1");

// Optional: Enable debug mode to see detailed logs
playfab_init("ABCD1", { debug_mode: true });
```

### Option B: In the First Room's Creation Code

Click on your first room, then **Room Settings > Creation Code**:

```gml
// Initialize PlayFab
if (!playfab_is_initialized()) {
    playfab_init("YOUR_TITLE_ID", { debug_mode: true });
}
```

### Finding Your Title ID

1. Go to [developer.playfab.com](https://developer.playfab.com)
2. Select your game title (or create a new one)
3. Your Title ID is shown in the top-left corner (e.g., "ABCD1")

### Using the Demo Project Configuration File

If you're using the demo project, all configuration is centralized in `scripts/scr_config/scr_config.gml`:

```gml
// Your PlayFab Title ID
#macro PLAYFAB_TITLE_ID "YOUR_TITLE_ID"

// Enable debug mode for development
#macro PLAYFAB_DEBUG_MODE true

// Leaderboard configuration
#macro DEFAULT_LEADERBOARD_NAME "HighScore"

// Currency codes (must match what you created in PlayFab)
#macro CURRENCY_PRIMARY "GC"
#macro CURRENCY_SECONDARY "DI"
```

This is the **only file you need to modify** to run the demo with your own PlayFab title.

## Step 4: Login

Now let's log in a player. The simplest method is device-based login, which creates accounts automatically.

```gml
// Simple device login - works immediately!
playfab_login_with_device_id(function(success, data) {
    if (success) {
        // Player is now logged in!
        show_debug_message("Logged in!");
        show_debug_message("PlayFab ID: " + data.PlayFabId);

        // Check if this is a new player
        if (data.NewlyCreated) {
            show_debug_message("Welcome, new player!");
        } else {
            show_debug_message("Welcome back!");
        }
    } else {
        // Login failed
        show_debug_message("Login failed: " + data.errorMessage);
    }
});
```

### Other Login Methods

```gml
// Email/Password login (for registered accounts)
playfab_login_with_email("player@email.com", "password123", function(success, data) {
    // Handle response
});

// Custom ID login (your own identifier system)
playfab_login_with_custom_id("my_unique_player_id", function(success, data) {
    // Handle response
});

// Register new account with email
playfab_register_with_email("player@email.com", "password123", "PlayerName", function(success, data) {
    // Automatically logs in on success
});
```

## Step 5: Basic Operations

Once logged in, you can use all PlayFab features!

### Save Player Data

```gml
// Save a single value
playfab_player_data_set("level", 5, function(success, data) {
    if (success) {
        show_debug_message("Level saved!");
    }
});

// Save complex data (automatically converted to JSON)
var save_data = {
    level: 5,
    coins: 1000,
    inventory: ["sword", "shield", "potion"]
};
playfab_player_data_set("game_save", save_data, function(success, data) {
    if (success) {
        show_debug_message("Game saved!");
    }
});
```

### Load Player Data

```gml
// Get specific keys
playfab_player_data_get("level", function(success, data) {
    if (success) {
        // Use the helper function to extract the value
        var level = playfab_data_extract_value(data, "level", 1);
        show_debug_message("Current level: " + string(level));
    }
});

// Get all player data
playfab_player_data_get_all(function(success, data) {
    if (success) {
        show_debug_message("Got all player data!");
        // data.Data contains all your saved data
    }
});
```

### Update Leaderboard Score

```gml
// Update a statistic (creates leaderboard entry)
playfab_statistic_update("HighScore", global.score, function(success, data) {
    if (success) {
        show_debug_message("Score submitted!");
    }
});
```

### Get Leaderboard

```gml
// Get top 10 players
playfab_leaderboard_get_top("HighScore", 10, function(success, data) {
    if (success) {
        var leaderboard = data.Leaderboard;
        for (var i = 0; i < array_length(leaderboard); i++) {
            var entry = leaderboard[i];
            show_debug_message(
                "#" + string(entry.Position + 1) + " " +
                entry.DisplayName + ": " +
                string(entry.StatValue)
            );
        }
    }
});
```

## Complete Working Example

Here's a complete example you can copy into a controller object:

```gml
/// Create Event

// Initialize PlayFab
playfab_init("YOUR_TITLE_ID", { debug_mode: true });

// Track login state
global.is_logged_in = false;
global.player_id = "";
global.player_name = "";

// Login with device
playfab_login_with_device_id(function(success, data) {
    if (success) {
        global.is_logged_in = true;
        global.player_id = data.PlayFabId;

        // Get display name if available
        if (variable_struct_exists(data, "InfoResultPayload")) {
            var info = data.InfoResultPayload;
            if (variable_struct_exists(info, "PlayerProfile")) {
                global.player_name = info.PlayerProfile.DisplayName ?? "Player";
            }
        }

        show_debug_message("=== PlayFab Login Successful ===");
        show_debug_message("Player ID: " + global.player_id);
        show_debug_message("Player Name: " + global.player_name);

        // Now load player data
        load_player_data();
    } else {
        show_debug_message("Login failed: " + data.errorMessage);
    }
});

// Function to load player data
function load_player_data() {
    playfab_player_data_get_all(function(success, data) {
        if (success) {
            // Extract saved values
            global.high_score = real(playfab_data_extract_value(data, "high_score", "0"));
            global.coins = real(playfab_data_extract_value(data, "coins", "0"));

            show_debug_message("High Score: " + string(global.high_score));
            show_debug_message("Coins: " + string(global.coins));
        }
    });
}

// Function to save score (call this when game ends)
function save_score(new_score) {
    if (!global.is_logged_in) return;

    // Update high score if better
    if (new_score > global.high_score) {
        global.high_score = new_score;

        // Save to player data
        playfab_player_data_set("high_score", new_score, function(s, d) {
            if (s) show_debug_message("High score saved!");
        });

        // Update leaderboard
        playfab_statistic_update("HighScore", new_score, function(s, d) {
            if (s) show_debug_message("Leaderboard updated!");
        });
    }
}

// Function to add coins (call this when player earns coins)
function add_coins(amount) {
    if (!global.is_logged_in) return;

    global.coins += amount;

    playfab_player_data_set("coins", global.coins, function(s, d) {
        if (s) show_debug_message("Coins saved: " + string(global.coins));
    });
}
```

## What's Next?

Now that you have the basics working, explore these features:

### Virtual Currency & Economy
Set up virtual currencies and an item shop:
```gml
// Get player's currency balances
playfab_get_player_inventory(function(success, data) {
    if (success) {
        var gold = playfab_currency_get_balance(data, "GC");
        show_debug_message("Gold: " + string(gold));
    }
});
```

### Friends System
Add social features:
```gml
// Get friends list
playfab_get_friends_list(function(success, data) {
    if (success) {
        var friends = data.Friends;
        show_debug_message("You have " + string(array_length(friends)) + " friends");
    }
});
```

### Cloud Script
Execute secure server-side code:
```gml
// Call a CloudScript function
playfab_execute_cloud_script("grantDailyReward", function(success, data) {
    if (success) {
        var result = playfab_cloud_script_get_result(data);
        show_debug_message("Reward granted: " + json_stringify(result));
    }
});
```

### Analytics
Track player behavior:
```gml
// Track custom events
playfab_track("level_complete", { level: 5, time: 120, deaths: 3 });
playfab_track_level_start("level_6");
```

## Troubleshooting

### "PlayFab not initialized"
Make sure `playfab_init()` is called before any other PlayFab function.

### "Not logged in"
Most functions require login first. Call a login function and wait for success before using other features.

### No response from PlayFab
Ensure `obj_playfab_handler` exists in your room. This object handles all HTTP responses.

### Invalid Title ID
Double-check your Title ID in the PlayFab Game Manager. It's usually 5-6 alphanumeric characters (e.g., "17E9B6").

### "Player creations have been disabled for this API"
This error occurs when trying to login as guest (or any device-based login) but PlayFab is configured to block new player creation:
1. Go to **Settings > Title Settings > API Features** in PlayFab
2. Scroll down to **"DISABLE PLAYER CREATIONS"**
3. **UNCHECK** all the options:
   - ☐ Disable player creation using Client/LoginWithCustomId
   - ☐ Disable player creation using Client/LoginWithAndroidDeviceId
   - ☐ Disable player creation using Client/LoginWithIOSDeviceId
   - ☐ Disable player creation using Client/LoginWithNintendoSwitchDeviceId
4. Click **Save**

### Statistics/Leaderboard Updates Failing
This is usually because client statistics are not enabled:
1. Go to **Settings > Title Settings > API Features** in PlayFab
2. Enable **"Allow client to post player statistics"**
3. Click **Save**

### Currency Balance Always 0
Create virtual currencies in PlayFab Dashboard:
1. Go to **Economy > Currency**
2. Create currencies with codes matching your config (default: "GC" and "DI")
3. Set **Initial deposit** values for new players

### Debug Mode
Enable debug mode to see detailed logs:
```gml
playfab_init("TITLE_ID", { debug_mode: true });
```

Or in the demo project, set in `scr_config.gml`:
```gml
#macro PLAYFAB_DEBUG_MODE true
```

## Full Documentation

- **[API Reference](API_REFERENCE.md)** - Complete function documentation
- **[Demo Project](../demo_project/)** - Working examples
- **[PlayFab Documentation](https://docs.microsoft.com/gaming/playfab/)** - Official PlayFab docs

## Getting Help

- Check the [API Reference](API_REFERENCE.md) for function details
- Run the demo project to see working examples
- Enable debug mode to diagnose issues
- Visit [PlayFab Forums](https://community.playfab.com/) for community support
