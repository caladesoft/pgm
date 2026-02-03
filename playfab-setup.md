---
layout: default
title: Playfab Setup
---

# PlayFab Dashboard Setup Guide

This guide walks you through setting up your PlayFab account and configuring your title for use with the GameMaker extension.

## Table of Contents

- [Creating a PlayFab Account](#creating-a-playfab-account)
- [Creating a New Title](#creating-a-new-title)
- [Finding Your Title ID](#finding-your-title-id)
- [Quick Setup for Demo Project](#quick-setup-for-demo-project)
- [Game Manager Overview](#game-manager-overview)
- [Setting Up Leaderboards](#setting-up-leaderboards)
- [Setting Up Economy](#setting-up-economy)
- [Setting Up CloudScript](#setting-up-cloudscript)
- [Testing Your Setup](#testing-your-setup)

---

## Creating a PlayFab Account

1. Go to [playfab.com](https://playfab.com)

2. Click **Sign Up** or **Get Started Free**

3. You can sign up with:
   - Microsoft account (recommended)
   - GitHub account
   - Email and password

4. Complete the registration form

5. Verify your email if required

<!-- Screenshot: PlayFab sign-up page with registration options -->

**Note:** PlayFab offers a generous free tier that's suitable for development and small to medium games. You won't need to enter payment information to get started.

---

## Creating a New Title

A "Title" in PlayFab represents your game. Each game should have its own title.

1. After logging in, you'll see the **My Studios & Titles** page

2. Click **New Title**

3. Fill in the details:
   - **Title Name**: Your game's name (e.g., "My Awesome Game")
   - **Studio**: Select an existing studio or create a new one

4. Click **Create Title**

<!-- Screenshot: New Title creation dialog -->

Your new title is now created and ready to configure!

---

## Finding Your Title ID

The Title ID is a unique identifier for your game. You'll need this to initialize the PlayFab SDK.

1. From **My Studios & Titles**, click on your game title

2. You'll enter the **Game Manager** dashboard

3. Your **Title ID** is displayed in the top-left corner, next to your game name
   - It's typically 4-5 uppercase alphanumeric characters (e.g., "ABC12")

<!-- Screenshot: Game Manager showing Title ID location in header -->

4. You can also find it in **Settings > Title Settings > API Features**

**Copy this Title ID** - you'll use it in your GameMaker code:

```gml
playfab_init("ABC12");  // Replace with your actual Title ID
```

---

## Quick Setup for Demo Project

If you want to run the demo project immediately, follow these minimal steps to configure PlayFab:

### Step 1: Configure Your Title ID

Open `demo_project/scripts/scr_config/scr_config.gml` and replace the Title ID:

```gml
#macro PLAYFAB_TITLE_ID "YOUR_TITLE_ID"  // Replace with your actual Title ID
```

### Step 2: Configure API Features

1. Go to **Settings > Title Settings > API Features**
2. Enable **"Allow client to post player statistics"** (required for leaderboards)
3. **Important**: Under "DISABLE PLAYER CREATIONS", make sure ALL checkboxes are **UNCHECKED**:
   - ☐ Disable player creation using Client/LoginWithCustomId
   - ☐ Disable player creation using Client/LoginWithAndroidDeviceId
   - ☐ Disable player creation using Client/LoginWithIOSDeviceId
   - ☐ Disable player creation using Client/LoginWithNintendoSwitchDeviceId
4. Click **Save**

If these "Disable player creation" options are checked, guest login will fail with the error: **"Player creations have been disabled for this API"**.

### Step 3: Create Required Statistics for Leaderboards

> **Important**: Use **Statistics**, NOT "Classic Leaderboards"!
> The PlayFab API (`GetLeaderboard`) uses Statistics to generate leaderboards.
> "Classic Leaderboards" is a deprecated feature and won't work with this extension.

1. Go to **Progression > Leaderboards** in the sidebar
2. Click the **Statistics** tab at the top (NOT "Classic Leaderboards")
3. Click **New statistic**
4. Configure:
   - **Statistic name**: `HighScore`
   - **Aggregation method**: `Max` (only keeps highest score - recommended for high scores)
   - **Reset frequency**: Manually (or Never)
5. Click **Save**

**Aggregation Method Explained:**
- **Max**: Only updates if the new score is HIGHER (use for high scores)
- **Last**: Always updates to the latest submitted value
- **Min**: Only updates if the new score is LOWER (use for fastest times)
- **Sum**: Adds to the existing value (use for total coins, games played)

### Step 4: Create Required Virtual Currencies

The demo uses two currencies. Create them in **Economy > Currency**:

**Currency 1: Gold Coins (Primary)**
| Field | Value |
|-------|-------|
| Currency code | `GC` |
| Display name | Gold Coins |
| Initial deposit | `100` |

**Currency 2: Diamonds (Premium)**
| Field | Value |
|-------|-------|
| Currency code | `DI` |
| Display name | Diamonds |
| Initial deposit | `10` |

### Step 5: Run the Demo

That's it! You can now run the demo project in GameMaker. All features should work:
- ✅ Authentication (Guest, Email, Registration)
- ✅ Player Data (Save/Load)
- ✅ Leaderboards (Submit scores, view rankings)
- ✅ Virtual Currency (View balances)

For advanced features (item shop, CloudScript), continue with the detailed sections below.

---

## Game Manager Overview

The Game Manager is PlayFab's web dashboard for configuring and monitoring your game.

### Main Sections

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview, analytics, recent activity |
| **Players** | View and manage player accounts |
| **Content** | Title data, news, files |
| **Engage** | Events, segments, A/B testing |
| **Economy** | Currencies, catalogs, stores |
| **Automation** | CloudScript, rules, scheduled tasks |
| **Analytics** | Reports, data explorer, trends |
| **Multiplayer** | Servers, matchmaking, party |
| **Settings** | Title settings, API features, limits |

<!-- Screenshot: Game Manager sidebar navigation -->

### Key Settings to Configure

Before using the SDK, check these settings:

1. Go to **Settings > Title Settings > API Features**

2. Ensure these options are enabled:
   - **Allow client to post player statistics** - Required for leaderboards
   - **Allow client to start games** - If using multiplayer features

<!-- Screenshot: API Features settings page -->

---

## Setting Up Leaderboards

Leaderboards in PlayFab are based on **Statistics**. Each statistic automatically becomes a queryable leaderboard.

> ⚠️ **Important**: Use **Statistics**, NOT "Classic Leaderboards"!
>
> PlayFab has two leaderboard systems:
> - **Statistics** (under Progression > Leaderboards > Statistics tab) - **USE THIS ONE**
> - **Classic Leaderboards** (deprecated) - Do NOT use
>
> The PlayFab API functions (`GetLeaderboard`, `GetLeaderboardAroundPlayer`, etc.)
> only work with Statistics. Classic Leaderboards use a different, deprecated API.

### Creating a Statistic

1. Go to **Progression > Leaderboards** in the sidebar

2. Click the **Statistics** tab at the top of the page

3. Click **New statistic**

4. Configure the statistic:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Statistic name** | Unique identifier (used in code) | `HighScore` |
   | **Aggregation method** | How to handle score updates | Max / Min / Last / Sum |
   | **Reset frequency** | How often to reset | Never / Hourly / Daily / Weekly / Monthly |

5. Click **Save**

### Aggregation Methods Explained

| Method | Behavior | Use Case |
|--------|----------|----------|
| **Last** | Always overwrites with new value | Current level, last login |
| **Maximum** | Only keeps highest value | High score |
| **Minimum** | Only keeps lowest value | Fastest time, fewest deaths |
| **Sum** | Adds to existing value | Total coins collected, games played |

### Reset Frequency

| Frequency | When It Resets | Use Case |
|-----------|----------------|----------|
| **Never** | Never resets | All-time high scores |
| **Hourly** | Every hour | Hourly challenges |
| **Daily** | Every day at midnight UTC | Daily leaderboards |
| **Weekly** | Every Monday at midnight UTC | Weekly competitions |
| **Monthly** | First of each month | Monthly tournaments |

### Example: Creating Common Leaderboards

**All-Time High Score:**
- Name: `HighScore`
- Reset: Never
- Aggregation: Maximum

**Weekly High Score:**
- Name: `WeeklyHighScore`
- Reset: Weekly
- Aggregation: Maximum

**Total Games Played:**
- Name: `GamesPlayed`
- Reset: Never
- Aggregation: Sum

**Fastest Level Completion:**
- Name: `Level1BestTime`
- Reset: Never
- Aggregation: Minimum

### Using Leaderboards in Code

```gml
// Submit a score (uses the aggregation method you configured)
playfab_statistic_update("HighScore", global.score, function(success, data) {
    if (success) {
        show_debug_message("Score submitted!");
    }
});

// Get top 10 players
playfab_leaderboard_get_top("HighScore", 10, function(success, data) {
    if (success) {
        var entries = data.Leaderboard;
        // Display leaderboard...
    }
});
```

---

## Setting Up Economy

The Economy system handles virtual currencies, items, and purchases.

### Creating Virtual Currencies

1. Go to **Economy > Currency**

2. Click **New Currency**

3. Configure the currency:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Currency code** | 2-character code | `GC` (Gold Coins) |
   | **Display name** | Friendly name | "Gold" |
   | **Initial deposit** | Starting amount for new players | 100 |
   | **Recharge rate** | Amount regenerated over time | 0 (none) |
   | **Recharge max** | Maximum from regeneration | 0 |

<!-- Screenshot: New Currency dialog -->

4. Click **Save**

### Common Currency Examples

| Code | Name | Initial | Use Case |
|------|------|---------|----------|
| `GC` | Gold Coins | 100 | Primary soft currency |
| `DI` | Diamonds | 0 | Premium hard currency |
| `EN` | Energy | 100 | Regenerating stamina |

### Creating Catalog Items

Items are defined in Catalogs. You need at least one catalog.

1. Go to **Economy > Catalogs**

2. Click **New Catalog** (or edit the default one)
   - Name it something like "Main" or "v1"

3. Click **New Item** to add items

4. Configure each item:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Item ID** | Unique identifier | `sword_01` |
   | **Display name** | Shown to players | "Iron Sword" |
   | **Description** | Item description | "A basic iron sword" |
   | **Item class** | Category | "weapon" |
   | **Tags** | Searchable tags | "starter", "sword" |
   | **Is stackable** | Can stack in inventory | false |
   | **Is tradeable** | Can trade between players | false |

<!-- Screenshot: New Item dialog - Basic tab -->

### Setting Item Prices

1. In the item editor, go to the **Prices** tab

2. Add prices for each currency:
   - Click **Add Price**
   - Select currency code (e.g., `GC`)
   - Enter amount (e.g., `100`)

<!-- Screenshot: Item Prices tab -->

3. You can set multiple prices (e.g., buy with gold OR diamonds)

### Example Catalog Items

**Weapons:**
| Item ID | Name | Class | GC Price | DI Price |
|---------|------|-------|----------|----------|
| `sword_01` | Iron Sword | weapon | 100 | - |
| `sword_02` | Steel Sword | weapon | 500 | 10 |
| `bow_01` | Wooden Bow | weapon | 150 | - |

**Consumables:**
| Item ID | Name | Class | GC Price | Uses |
|---------|------|-------|----------|------|
| `potion_health` | Health Potion | consumable | 50 | 1 |
| `potion_mana` | Mana Potion | consumable | 50 | 1 |
| `boost_xp` | XP Booster | consumable | 200 | 5 |

### Consumable Items

For items that get "used up":

1. In the item editor, set **Is stackable** to true
2. Set **Usage count** or **Usage period** in the **Consumable** section

<!-- Screenshot: Item Consumable settings -->

### Using Economy in Code

```gml
// Get player's inventory and currencies
playfab_get_player_inventory(function(success, data) {
    if (success) {
        var gold = playfab_currency_get_balance(data, "GC");
        show_debug_message("Gold: " + string(gold));
    }
});

// Purchase an item
playfab_purchase_item("sword_01", "GC", 100, function(success, data) {
    if (success) {
        show_debug_message("Purchased!");
    }
});

// Use a consumable item
var potion = playfab_inventory_find_item(inventory_data, "potion_health");
if (potion != undefined) {
    playfab_consume_item(potion.ItemInstanceId, 1, function(success, data) {
        // Item consumed!
    });
}
```

---

## Setting Up CloudScript

CloudScript lets you run server-side JavaScript code for secure game logic.

### Why Use CloudScript?

- **Security**: Validate scores, prevent cheating
- **Server Authority**: Grant rewards, process purchases
- **Complex Logic**: Operations too sensitive for client
- **Real-Money Transactions**: Validate receipts

### Creating CloudScript

1. Go to **Automation > CloudScript**

2. Click **Edit** to modify the default script, or create a new revision

3. Write your JavaScript functions:

```javascript
// Example: Grant daily reward (server-validated)
handlers.grantDailyReward = function(args, context) {
    var playerId = context.currentPlayerId;

    // Grant 100 gold coins
    var result = server.AddUserVirtualCurrency({
        PlayFabId: playerId,
        VirtualCurrency: "GC",
        Amount: 100
    });

    return {
        success: true,
        coinsGranted: 100,
        newBalance: result.Balance
    };
};

// Example: Validate and submit score
handlers.submitScore = function(args, context) {
    var playerId = context.currentPlayerId;
    var score = args.score;
    var level = args.level;

    // Validate score (example: max possible is level * 10000)
    var maxPossible = level * 10000;
    if (score > maxPossible) {
        return { success: false, error: "Invalid score" };
    }

    // Update statistic
    server.UpdatePlayerStatistics({
        PlayFabId: playerId,
        Statistics: [
            { StatisticName: "HighScore", Value: score }
        ]
    });

    return { success: true, scoreRecorded: score };
};
```

<!-- Screenshot: CloudScript editor -->

4. Click **Save & Deploy** to make your script live

### Calling CloudScript from GameMaker

```gml
// Simple call
playfab_execute_cloud_script("grantDailyReward", function(success, data) {
    if (success) {
        var result = playfab_cloud_script_get_result(data);
        show_debug_message("Granted: " + string(result.coinsGranted));
    }
});

// Call with parameters
playfab_execute_cloud_script("submitScore", function(success, data) {
    var result = playfab_cloud_script_get_result(data);
    if (result.success) {
        show_debug_message("Score submitted securely!");
    }
}, {
    score: global.score,
    level: global.level
});
```

### CloudScript Best Practices

1. **Validate all input** - Never trust client data
2. **Use server.* functions** - These have elevated permissions
3. **Log important actions** - Use `log.info()` for debugging
4. **Handle errors gracefully** - Return meaningful error messages
5. **Keep it fast** - CloudScript has execution time limits

---

## Testing Your Setup

Before integrating with your game, test your PlayFab configuration.

### Test 1: Login Works

```gml
playfab_init("YOUR_TITLE_ID", { debug_mode: true });

playfab_login_with_device_id(function(success, data) {
    if (success) {
        show_debug_message("SUCCESS: Login works!");
        show_debug_message("Player ID: " + data.PlayFabId);
    } else {
        show_debug_message("FAILED: " + data.errorMessage);
    }
});
```

**Expected**: Login succeeds, you get a PlayFabId

### Test 2: Leaderboards Work

```gml
// Submit a test score
playfab_statistic_update("HighScore", 1000, function(success, data) {
    if (success) {
        show_debug_message("SUCCESS: Statistic updated!");

        // Now try to read it back
        playfab_leaderboard_get_top("HighScore", 10, function(s, d) {
            if (s) {
                show_debug_message("SUCCESS: Leaderboard has " +
                    string(array_length(d.Leaderboard)) + " entries");
            }
        });
    } else {
        show_debug_message("FAILED: " + data.errorMessage);
        show_debug_message("Did you enable 'Allow client to post player statistics'?");
    }
});
```

**Expected**: Score submits and appears on leaderboard

### Test 3: Economy Works

```gml
// Check currency balance
playfab_get_player_inventory(function(success, data) {
    if (success) {
        var gold = playfab_currency_get_balance(data, "GC");
        show_debug_message("SUCCESS: Gold balance = " + string(gold));
    } else {
        show_debug_message("FAILED: " + data.errorMessage);
    }
});
```

**Expected**: Returns currency balance (might be 0 or your initial deposit)

### Test 4: Player Data Works

```gml
// Save test data
playfab_player_data_set("test_key", "test_value", function(success, data) {
    if (success) {
        show_debug_message("SUCCESS: Data saved!");

        // Read it back
        playfab_player_data_get("test_key", function(s, d) {
            if (s) {
                var value = playfab_data_extract_value(d, "test_key", "");
                show_debug_message("SUCCESS: Read back: " + value);
            }
        });
    } else {
        show_debug_message("FAILED: " + data.errorMessage);
    }
});
```

**Expected**: Data saves and loads correctly

### Checking Player Activity in Game Manager

After testing, verify in PlayFab:

1. Go to **Players** in Game Manager
2. You should see your test player account
3. Click on the player to see:
   - Statistics (leaderboard scores)
   - Inventory (items, currencies)
   - Player Data (saved data)

<!-- Screenshot: Player details page showing statistics, inventory, data -->

### Common Setup Issues

| Issue | Solution |
|-------|----------|
| "Invalid Title ID" | Double-check your Title ID matches exactly |
| Statistics not updating | Enable "Allow client to post player statistics" in Settings > API Features |
| Leaderboard returns empty | Make sure you created a **Statistic** (not a Classic Leaderboard). Go to Progression > Leaderboards > **Statistics** tab |
| Score not updating | Check the aggregation method. With "Max", scores only update if higher than current value |
| "Player creations disabled" error | Uncheck all "Disable player creation" options in Settings > API Features |
| Purchases failing | Verify item exists in catalog with correct price |
| CloudScript errors | Check the CloudScript logs in Game Manager |

---

## Next Steps

Now that PlayFab is set up:

1. **Run the Demo Project** - See working examples of all features
2. **Read the Quick Start Guide** - [Quick Start](quick-start)
3. **Explore the API Reference** - [API Reference](api-reference)
4. **Join the Community** - [PlayFab Discord](https://discord.gg/msftgamedev)

---

## Additional Resources

- [PlayFab Documentation](https://learn.microsoft.com/gaming/playfab/)
- [PlayFab Tutorials](https://learn.microsoft.com/gaming/playfab/features/commerce/economy/)
- [CloudScript Quickstart](https://learn.microsoft.com/gaming/playfab/features/automation/cloudscript/quickstart)
- [Economy Best Practices](https://learn.microsoft.com/gaming/playfab/features/commerce/economy/quickstart)
