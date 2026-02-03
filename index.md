---
layout: default
title: PGM - PlayFab for GameMaker
---

# PGM - PlayFab for GameMaker

A comprehensive PlayFab SDK extension for GameMaker Studio 2.3+, providing easy access to PlayFab's backend services for your games.

## Features

### Core Features
- **Authentication** - Device login, email/password, custom IDs, Steam integration
- **Player Data** - Store and retrieve player save data, preferences, and progress
- **Leaderboards** - Global rankings, friend leaderboards, player statistics
- **Economy** - Virtual currencies, item catalogs, inventory management, purchases
- **Cloud Script** - Execute server-side code for secure game logic
- **Friends** - Friend lists, adding/removing friends, friend tags
- **Analytics** - Track player events, behavior, and custom metrics

### Advanced Features (v1.1.0+)
- **Automatic Retries** - Exponential backoff for transient failures
- **Local Caching** - Cache data for improved performance
- **Rate Limiting Protection** - Request queuing to avoid API throttling
- **Session Management** - Auto-refresh support and expiry callbacks
- **Batch Operations** - Execute multiple API calls in parallel

## Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](quick-start) | Step-by-step setup instructions |
| [API Reference](api-reference) | Complete function documentation (131+ functions) |
| [PlayFab Setup](playfab-setup) | Dashboard configuration guide |
| [Troubleshooting](troubleshooting) | Common issues and solutions |
| [Changelog](changelog) | Version history |

## Quick Example

```gml
// Initialize PGM
playfab_init("YOUR_TITLE_ID");

// Login with device ID (auto-creates account)
playfab_login_with_device_id(function(success, data) {
    if (success) {
        show_debug_message("Logged in as: " + data.PlayFabId);

        // Save player data
        playfab_player_data_set("high_score", 1000);

        // Update leaderboard
        playfab_statistic_update("HighScore", 1000);
    }
});
```

## Requirements

- GameMaker Studio 2.3 or later
- A PlayFab account (free tier available)
- A PlayFab Title ID

## Get PGM

Available on the [YoYo Games Marketplace](https://marketplace.gamemaker.io/).

## Support

- [PlayFab Documentation](https://docs.microsoft.com/gaming/playfab/)
- [PlayFab Community Forums](https://community.playfab.com/)

---

**PGM** is not affiliated with Microsoft or PlayFab. PlayFab is a trademark of Microsoft Corporation.
