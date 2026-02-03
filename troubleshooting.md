---
layout: default
title: Troubleshooting
---

# PlayFab for GameMaker - Troubleshooting Guide

This guide helps you diagnose and fix common issues when using the PlayFab GameMaker extension.

## Table of Contents

- [Quick Diagnostic Checklist](#quick-diagnostic-checklist)
- [Common Error Messages](#common-error-messages)
- [Authentication Issues](#authentication-issues)
- [Leaderboard Issues](#leaderboard-issues)
- [Economy Issues](#economy-issues)
- [Player Data Issues](#player-data-issues)
- [CloudScript Issues](#cloudscript-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Using Debug Mode](#using-debug-mode)
- [Getting Help](#getting-help)

---

## Quick Diagnostic Checklist

When something isn't working, check these first:

- [ ] Is `obj_playfab_handler` in your room?
- [ ] Did you call `playfab_init()` before other functions?
- [ ] Is your Title ID correct?
- [ ] Are you logged in before making authenticated calls?
- [ ] Is debug mode enabled to see detailed errors?
- [ ] Do you have internet connectivity?

---

## Common Error Messages

### "PlayFab not initialized"

**Error:** `PlayFab not initialized. Call playfab_init() first.`

**Cause:** You're calling a PlayFab function before initializing the SDK.

**Solution:**
```gml
// Make sure this runs FIRST, before any other PlayFab calls
playfab_init("YOUR_TITLE_ID");

// Then you can login, etc.
playfab_login_with_device_id(callback);
```

**Common Mistakes:**
- Calling PlayFab functions in a room that loads before initialization
- Initialization code not running (check room order)
- Typo in function name (`playfab_int` instead of `playfab_init`)

---

### "Not logged in"

**Error:** `Not logged in. Call a login function first.`

**Cause:** You're calling a function that requires authentication before logging in.

**Solution:**
```gml
// Login first
playfab_login_with_device_id(function(success, data) {
    if (success) {
        // NOW you can use authenticated functions
        playfab_player_data_get_all(callback);
        playfab_leaderboard_get_top("HighScore", 10, callback);
    }
});
```

**Functions that DON'T require login:**
- `playfab_init()`
- `playfab_is_initialized()`
- `playfab_is_logged_in()`
- All login/register functions

**Functions that DO require login:**
- All data functions
- All leaderboard functions
- All economy functions
- All CloudScript functions
- All friend functions

---

### "Invalid Title ID"

**Error:** `Invalid title_id provided` or connection failures

**Cause:** Your Title ID is incorrect or malformed.

**Solution:**
1. Go to PlayFab Game Manager
2. Find your Title ID in the top-left corner
3. It should be 4-5 alphanumeric characters (e.g., "ABC12")
4. Make sure it's uppercase

```gml
// Correct
playfab_init("ABC12");

// Wrong
playfab_init("abc12");      // Lowercase
playfab_init("ABC-12");     // Contains hyphen
playfab_init("ABC123456");  // Too long
playfab_init("");           // Empty
```

---

### "NetworkError"

**Error:** `Network request failed` or `NetworkError`

**Cause:** Connection to PlayFab servers failed.

**Possible Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| No internet connection | Check device connectivity |
| Firewall blocking requests | Allow outgoing HTTPS (port 443) |
| PlayFab service outage | Check [PlayFab Status](https://status.playfab.com/) |
| Request timeout | Increase timeout in init options |
| CORS issues (HTML5) | See Platform-Specific Issues |

```gml
// Increase timeout if needed
playfab_init("ABC12", {
    timeout: 60000  // 60 seconds instead of default 30
});
```

---

### "AccountNotFound" / Error Code 1001

**Error:** `AccountNotFound` or error code 1001

**Cause:** Trying to log in to an account that doesn't exist.

**Solution:**
```gml
// For device login, enable account creation
playfab_login_with_device_id(callback, true);  // true = create if not exists

// For email login, user needs to register first
playfab_register_with_email(email, password, username, callback);
```

---

### "InvalidUsernameOrPassword" / Error Code 1003

**Error:** `InvalidUsernameOrPassword` or error code 1003

**Cause:** Wrong email/username or password.

**Solution:**
- Verify the email address is correct
- Check password is correct (case-sensitive)
- User may need to use password recovery

```gml
playfab_login_with_email(email, password, function(success, data) {
    if (!success) {
        if (data.errorCode == 1003) {
            show_message("Incorrect email or password. Please try again.");
        }
    }
});
```

---

### "EmailAddressNotAvailable" / Error Code 1006

**Error:** `EmailAddressNotAvailable` or error code 1006

**Cause:** Trying to register with an email that's already used.

**Solution:**
```gml
playfab_register_with_email(email, password, username, function(success, data) {
    if (!success) {
        if (data.errorCode == 1006) {
            show_message("This email is already registered. Try logging in instead.");
        }
    }
});
```

---

## Authentication Issues

### Device Login Creates New Account Every Time

**Problem:** Each login creates a new PlayFab account instead of using existing.

**Cause:** Device ID is changing between sessions.

**Solutions:**

1. **Verify device ID persistence:**
```gml
// Check what device ID is being used
var device_id = __playfab_get_device_id();
show_debug_message("Device ID: " + device_id);
```

2. **Use Custom ID for more control:**
```gml
// Store a persistent ID yourself
if (!file_exists("player_id.txt")) {
    // Generate new ID
    var new_id = __playfab_generate_uuid();
    var file = file_text_open_write("player_id.txt");
    file_text_write_string(file, new_id);
    file_text_close(file);
}

// Read stored ID
var file = file_text_open_read("player_id.txt");
var my_id = file_text_read_string(file);
file_text_close(file);

// Login with custom ID
playfab_login_with_custom_id(my_id, callback, true);
```

---

### Steam Login Fails

**Problem:** `playfab_login_with_steam()` fails or returns errors.

**Possible Causes:**

1. **Steam not initialized:**
```gml
// Make sure Steam is running and initialized
if (!playfab_is_steam_available()) {
    show_debug_message("Steam not available - use different login method");
    playfab_login_with_device_id(callback);
}
```

2. **Invalid Steam ticket:**
   - Tickets expire quickly - get a fresh one
   - Make sure you're getting the auth session ticket, not the app ticket

3. **Steam not configured in PlayFab:**
   - Go to Game Manager > Add-ons > Steam
   - Enter your Steam App ID and Web API Key

---

### Session Expired

**Problem:** Calls fail after working for a while.

**Cause:** PlayFab sessions expire after 24 hours by default.

**Solution:**
```gml
// Check session validity periodically
if (!playfab_is_session_valid()) {
    // Re-login
    playfab_login_with_device_id(function(success, data) {
        if (success) {
            show_debug_message("Session refreshed");
        }
    });
}
```

---

## Leaderboard Issues

### Leaderboard is Empty

**Problem:** `playfab_leaderboard_get_top()` returns empty array.

**Possible Causes:**

1. **No statistics configured:**
   - Go to Game Manager > Leaderboards
   - Create a leaderboard with your statistic name

2. **No scores submitted yet:**
```gml
// Submit a score first
playfab_statistic_update("HighScore", 1000, function(success, data) {
    if (success) {
        // Now the leaderboard should have at least one entry
    }
});
```

3. **Wrong statistic name:**
```gml
// Make sure the name matches EXACTLY (case-sensitive)
playfab_leaderboard_get_top("HighScore", 10, callback);  // Correct
playfab_leaderboard_get_top("highscore", 10, callback);  // Wrong
playfab_leaderboard_get_top("High Score", 10, callback); // Wrong
```

---

### Statistics Not Updating

**Problem:** `playfab_statistic_update()` succeeds but leaderboard doesn't change.

**Possible Causes:**

1. **"Allow client to post player statistics" is disabled:**
   - Go to Game Manager > Settings > Title Settings > API Features
   - Enable "Allow client to post player statistics"

2. **Aggregation method is Maximum but new score is lower:**
```gml
// If aggregation is "Maximum", only higher scores are kept
// Player has 1000, you submit 500 - won't update
playfab_statistic_update("HighScore", 500, callback);

// Check aggregation in Game Manager > Leaderboards > Edit
```

3. **Check the leaderboard after a short delay:**
```gml
playfab_statistic_update("HighScore", 5000, function(success, data) {
    if (success) {
        // Small delay before checking
        alarm[0] = 60;  // Check after 1 second
    }
});

// In Alarm[0]
playfab_leaderboard_get_top("HighScore", 10, function(s, d) {
    // Should now show updated score
});
```

---

### Weekly/Daily Leaderboard Shows Old Data

**Problem:** Resetting leaderboard still shows old entries.

**Explanation:** Leaderboards reset on schedule (not immediately when you expect).

- **Daily**: Resets at midnight UTC
- **Weekly**: Resets Monday at midnight UTC
- **Monthly**: Resets 1st of month at midnight UTC

Check reset time:
```gml
playfab_leaderboard_get_top("WeeklyScore", 10, function(success, data) {
    if (success) {
        var next_reset = data.NextReset;
        show_debug_message("Next reset: " + string(next_reset));
    }
});
```

---

## Economy Issues

### Purchase Failed - Insufficient Funds

**Problem:** `playfab_purchase_item()` fails with insufficient funds error.

**Solution:**
```gml
// Check balance before purchasing
playfab_get_player_inventory(function(success, data) {
    if (success) {
        var gold = playfab_currency_get_balance(data, "GC");
        var item_price = 100;

        if (gold >= item_price) {
            playfab_purchase_item("sword_01", "GC", item_price, callback);
        } else {
            show_message("Not enough gold! You have " + string(gold));
        }
    }
});

// Or use the helper function
var result = playfab_validate_purchase(catalog, inventory, "sword_01", "GC");
if (result.valid) {
    playfab_purchase_item("sword_01", "GC", result.price, callback);
} else {
    show_message(result.error);
}
```

---

### Purchase Failed - Price Mismatch

**Problem:** Purchase fails even with enough currency.

**Cause:** The price you passed doesn't match the catalog price.

**Solution:**
```gml
// Get the actual price from catalog
var item = playfab_catalog_find_item(catalog_data, "sword_01");
if (item != undefined) {
    var price = playfab_catalog_get_price(item, "GC");
    playfab_purchase_item("sword_01", "GC", price, callback);
}
```

---

### Item Not Found in Inventory

**Problem:** `playfab_inventory_find_item()` returns undefined.

**Possible Causes:**

1. **Item not purchased/granted yet**
2. **Using wrong ID:**
```gml
// Use ItemId from catalog, not ItemInstanceId
var item = playfab_inventory_find_item(inventory_data, "sword_01");  // ItemId

// ItemInstanceId is unique per item instance, different every time
```

3. **Item was consumed (uses depleted)**

---

### Consume Item Fails

**Problem:** `playfab_consume_item()` fails or does nothing.

**Important:** You must use `ItemInstanceId`, not `ItemId`!

```gml
// WRONG - using ItemId
playfab_consume_item("potion_health", 1, callback);  // Won't work!

// CORRECT - using ItemInstanceId
var item = playfab_inventory_find_item(inventory_data, "potion_health");
if (item != undefined) {
    playfab_consume_item(item.ItemInstanceId, 1, callback);  // Correct!
}
```

---

## Player Data Issues

### Data Not Saving

**Problem:** `playfab_player_data_set()` succeeds but data isn't there later.

**Possible Causes:**

1. **Not waiting for callback:**
```gml
// Wrong - checking immediately
playfab_player_data_set("score", 100, callback);
var score = saved_score;  // This runs before save completes!

// Correct - wait for callback
playfab_player_data_set("score", 100, function(success, data) {
    if (success) {
        // NOW it's saved
        show_debug_message("Score saved!");
    }
});
```

2. **Data exceeds size limit:**
   - Key names: max 50 characters
   - Values: max 10KB each
   - Total player data: 10MB limit

3. **Using wrong data type:**
```gml
// All values are stored as strings
playfab_player_data_set("score", 100, callback);  // Stored as "100"

// When reading, convert back to number
var score_str = playfab_data_extract_value(data, "score", "0");
var score = real(score_str);
```

---

### JSON Data Corrupted

**Problem:** Saved JSON comes back malformed.

**Solution:** Use the built-in JSON helpers:
```gml
// Saving - let the function handle JSON conversion
var my_data = { level: 5, items: ["sword", "shield"] };
playfab_player_data_set("save_game", my_data, callback);  // Auto-converts

// Loading - use the JSON extractor
var save_game = playfab_data_extract_json(data, "save_game", {});
// save_game is now a struct, not a string
```

---

## CloudScript Issues

### CloudScript Returns Undefined

**Problem:** `playfab_cloud_script_get_result()` returns undefined.

**Possible Causes:**

1. **Script didn't return anything:**
```javascript
// Wrong - no return
handlers.myFunction = function(args, context) {
    var playerId = context.currentPlayerId;
    // Does stuff but doesn't return
};

// Correct - return a value
handlers.myFunction = function(args, context) {
    return {
        success: true,
        data: "Hello!"
    };
};
```

2. **Script threw an error:**
```gml
// Check for errors
playfab_execute_cloud_script("myFunction", function(success, data) {
    if (success) {
        if (playfab_cloud_script_had_error(data)) {
            var error = playfab_cloud_script_get_error(data);
            show_debug_message("Script error: " + error.Message);
        } else {
            var result = playfab_cloud_script_get_result(data);
            // Use result
        }
    }
});
```

---

### CloudScript Not Deployed

**Problem:** "Function not found" error.

**Solution:**
1. Go to Game Manager > Automation > CloudScript
2. Make sure your script is saved
3. Click "Deploy" or "Save & Deploy"
4. Check the revision is marked as "Live"

---

## Platform-Specific Issues

### HTML5: CORS Errors

**Problem:** Requests fail in browser with CORS errors.

**Explanation:** Browsers have strict security rules about cross-origin requests.

**Solutions:**

1. **Test on a web server, not file://**
   - Use a local server (XAMPP, Python's http.server, etc.)
   - Or use GameMaker's built-in server for testing

2. **PlayFab should handle CORS** - if it doesn't:
   - Check browser console for specific error
   - Ensure you're using HTTPS URLs
   - Contact PlayFab support if CORS headers are missing

---

### Mobile: Device ID Changes

**Problem:** Device ID changes between app installs on mobile.

**Cause:** iOS and Android may generate new IDs after reinstall.

**Solution:** Use Custom ID with persistent storage:
```gml
// Save your own persistent ID
var my_id = "";

// Try to load existing ID
var filename = "my_player_id.txt";
if (file_exists(filename)) {
    var file = file_text_open_read(filename);
    my_id = file_text_read_string(file);
    file_text_close(file);
}

// Generate if not exists
if (my_id == "") {
    my_id = __playfab_generate_uuid();
    var file = file_text_open_write(filename);
    file_text_write_string(file, my_id);
    file_text_close(file);
}

// Login with persistent ID
playfab_login_with_custom_id(my_id, callback, true);
```

---

### Console (Xbox/PlayStation): Authentication

**Problem:** Console-specific login issues.

**Note:** Console authentication requires additional setup:
- Platform-specific SDKs
- PlayFab add-on configuration
- Platform certification requirements

Refer to PlayFab documentation for console-specific integration.

---

## Using Debug Mode

Debug mode shows detailed logs in the Output window.

### Enabling Debug Mode

```gml
// Method 1: At initialization
playfab_init("ABC12", { debug_mode: true });

// Method 2: Toggle later
playfab_set_debug_mode(true);

// Method 3: Check current state
if (playfab_get_debug_mode()) {
    show_debug_message("Debug mode is ON");
}
```

### Reading Debug Output

Debug output appears in GameMaker's Output window:

```
[PlayFab] Request [0] /Client/LoginWithCustomID
[PlayFab]   URL: https://ABC12.playfabapi.com/Client/LoginWithCustomID
[PlayFab]   Body: {"TitleId":"ABC12","CustomId":"player_123",...}
[PlayFab] Response [0] /Client/LoginWithCustomID
[PlayFab]   Status: 1, HTTP: 200
[PlayFab]   Success!
[PlayFab]   Data keys: PlayFabId, SessionTicket, EntityToken, ...
```

### What to Look For

| Log Entry | Meaning |
|-----------|---------|
| `Request [n]` | Request sent, n is the ID |
| `URL:` | Full API endpoint |
| `Body:` | Request data (passwords hidden) |
| `Response [n]` | Response received |
| `Status: 1` | Success (0 = in progress, -1 = error) |
| `HTTP: 200` | HTTP status code |
| `Success!` | PlayFab accepted the request |
| `API error` | PlayFab returned an error |
| `Network error` | Connection failed |

---

### Using the Debug Console

The demo project includes a Debug Console (rm_debug_console) that shows:
- All API calls with timestamps
- Request and response data
- Duration of each call
- Success/failure status

Access it from the demo's main menu to inspect API traffic in real-time.

---

## Getting Help

### Step 1: Check the Demo Project

The demo project has working examples of every feature. Compare your code to the demo to find differences.

### Step 2: Enable Debug Mode

```gml
playfab_init("ABC12", { debug_mode: true });
```

Look for error messages in the Output window.

### Step 3: Check PlayFab Game Manager

- **Players** - See if accounts are being created
- **Leaderboards** - Verify statistics exist
- **Economy** - Check currencies and items are configured
- **CloudScript** - Review logs for script errors

### Step 4: Common Solutions

| Problem | Try This |
|---------|----------|
| Nothing works | Check `obj_playfab_handler` is in room |
| Login fails | Verify Title ID is correct |
| Data not saving | Wait for callback before reading |
| Leaderboard empty | Create statistic in Game Manager |
| Purchase fails | Check currency balance and item price |

### Step 5: Search for Solutions

- [PlayFab Documentation](https://docs.microsoft.com/gaming/playfab/)
- [PlayFab Forums](https://community.playfab.com/)
- [PlayFab Discord](https://discord.gg/playfab)

### Step 6: Report Issues

If you've found a bug in the extension:

1. Enable debug mode and capture the output
2. Note the exact error message
3. Describe what you expected vs. what happened
4. Include relevant code snippets
5. Report at: [GitHub Issues](https://github.com/caladesoft/pgm/issues)

---

## Error Code Reference

| Code | Name | Description |
|------|------|-------------|
| 1000 | InvalidParams | Request parameters are invalid |
| 1001 | AccountNotFound | Account doesn't exist |
| 1002 | AccountBanned | Account is banned |
| 1003 | InvalidUsernameOrPassword | Wrong credentials |
| 1006 | EmailAddressNotAvailable | Email already registered |
| 1007 | UsernameNotAvailable | Username already taken |
| 1008 | InvalidEmailAddress | Email format invalid |
| 1009 | InvalidPassword | Password doesn't meet requirements |
| 1059 | InsufficientFunds | Not enough currency |
| 1071 | ItemNotFound | Item doesn't exist in catalog |
| 1135 | FriendshipAlreadyExists | Already friends |
| 1142 | EmailAddressNotLinked | Account has no email linked |

For a complete list, see [PlayFab Error Codes](https://docs.microsoft.com/gaming/playfab/api-references/events/data-types/errorcode).
