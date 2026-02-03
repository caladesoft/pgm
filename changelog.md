---
layout: default
title: Changelog
---

# Changelog

All notable changes to the PlayFab for GameMaker extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-01-30

### Added

#### Advanced Features Module (`playfab_advanced.gml`)

**Automatic Retry Logic**
- `playfab_set_retry_options()` - Configure automatic retry behavior
- Exponential backoff with jitter for failed requests
- Configurable retry count, delays, and retryable error types
- Internal functions: `__playfab_should_retry()`, `__playfab_get_retry_delay()`

**Local Caching System**
- `playfab_set_cache_options()` - Configure caching behavior
- `playfab_cache_set()` - Store data with TTL
- `playfab_cache_get()` - Retrieve cached data
- `playfab_cache_invalidate()` - Clear specific or all cached data
- Automatic cache pruning when max entries exceeded

**Rate Limiting Protection**
- `playfab_set_rate_limit_options()` - Configure rate limiting
- `playfab_get_queue_length()` - Check queued request count
- Automatic request queuing when rate limited

**Session Management**
- `playfab_set_session_options()` - Configure session handling
- `playfab_is_session_valid()` - Check session validity
- `playfab_get_session_info()` - Get detailed session information
- Automatic session expiry callback support

**Promise-Like Chaining**
- `PlayFabPromise` constructor for async operations
- `playfab_promise()` - Create new promise
- Methods: `then()`, `catch_error()`, `finally_handler()`, `resolve()`, `reject()`

**Batch Operations**
- `playfab_batch()` - Execute multiple operations in parallel
- Wait for all operations to complete
- Results array with success/data for each operation

**Convenience Functions**
- `playfab_is_initialized()` - Check if SDK is initialized
- `playfab_is_logged_in()` - Check login status
- `playfab_get_player_id()` - Get current player ID
- `playfab_get_version()` - Get SDK version string
- `playfab_get_debug_mode()` - Check debug mode
- `playfab_set_debug_mode()` - Toggle debug mode

#### Demo Project Enhancements
- New `scr_playfab_advanced_demo.gml` with:
  - `demo_configure_advanced_features()` - Setup helper
  - `demo_get_player_stats_cached()` - Cached stats retrieval
  - `demo_get_leaderboard_cached()` - Cached leaderboard retrieval
  - `demo_get_player_data_cached()` - Cached player data
  - `demo_invalidate_player_cache()` - Cache invalidation helper
  - `demo_load_all_game_data()` - Batch data loading
  - `demo_save_game_progress()` - Batch progress saving
  - `demo_chained_login_flow()` - Promise-style flow example
  - `demo_handle_playfab_error()` - User-friendly error handling
  - Debug utilities for cache/session/SDK status

#### Test Suite
- `playfab_advanced_test.gml` - Integration tests for all advanced features
- `test_suite_advanced_features()` - Run all tests
- Individual tests for retry, cache, rate limiting, session, promises
- `run_advanced_tests_and_report()` - Execute and report results

### Changed
- Updated game manager to configure advanced features on startup
- SDK version bumped to 1.1.0

### Compatibility
- Verified compatibility with GameMaker 2024+
- All existing 1.0.0 code remains fully compatible

---

## [1.0.0] - 2024-01-15

### Initial Release

First public release of the PlayFab for GameMaker extension.

### Added

#### Core Module
- `playfab_init()` - Initialize the SDK with Title ID and options
- `playfab_reset()` - Reset SDK to uninitialized state
- `playfab_is_initialized()` - Check initialization status
- `playfab_is_logged_in()` - Check login status
- `playfab_get_player_id()` - Get current player's PlayFab ID
- `playfab_get_entity_id()` - Get current player's Entity ID
- `playfab_get_session_ticket()` - Get session authentication ticket
- `playfab_set_debug_mode()` - Enable/disable debug logging
- `playfab_get_debug_mode()` - Check debug mode status

#### Authentication Module
- Device ID login (iOS, Android, Desktop fallback)
- Email/password login and registration
- Username/password login and registration
- Custom ID login for flexible authentication
- Steam authentication integration
- Account linking (email, device, custom ID, Steam)
- Account unlinking
- Session management and validation
- Display name updates
- Linked accounts information

**Login Functions:**
- `playfab_login_with_device_id()`
- `playfab_login_with_email()`
- `playfab_login_with_username()`
- `playfab_login_with_custom_id()`
- `playfab_login_with_steam()`

**Registration Functions:**
- `playfab_register_with_email()`
- `playfab_register_with_username()`

**Session Functions:**
- `playfab_logout()`
- `playfab_force_logout()`
- `playfab_is_session_valid()`
- `playfab_get_login_info()`
- `playfab_get_session_time_remaining()`

**Linking Functions:**
- `playfab_link_email()`
- `playfab_link_email_with_username()`
- `playfab_link_device_id()`
- `playfab_unlink_device_id()`
- `playfab_link_custom_id()`
- `playfab_unlink_custom_id()`
- `playfab_link_steam()`
- `playfab_unlink_steam()`
- `playfab_get_linked_accounts()`
- `playfab_update_display_name()`

#### Player Data Module
- Get player data (single key, multiple keys, all keys)
- Set player data (single key, multiple keys)
- Delete player data
- Read-only player data support
- Public/private data permissions
- Title data access (read-only game configuration)
- Title news retrieval
- Other player's public data access

**Functions:**
- `playfab_player_data_get()`
- `playfab_player_data_get_all()`
- `playfab_player_data_get_for_player()`
- `playfab_player_readonly_data_get()`
- `playfab_player_data_set()`
- `playfab_player_data_set_multiple()`
- `playfab_player_data_delete()`
- `playfab_player_data_clear_all()`
- `playfab_title_data_get()`
- `playfab_title_news_get()`
- `playfab_internal_title_data_get()`

**Helper Functions:**
- `playfab_data_extract_value()`
- `playfab_data_extract_json()`
- `playfab_data_key_exists()`
- `playfab_title_data_extract()`
- `playfab_title_data_extract_json()`

#### Leaderboard Module
- Get leaderboard entries (top N, paginated, around player)
- Get friend leaderboards (PlayFab, Steam, Facebook)
- Update player statistics (single and batch)
- Get player statistics
- Support for resetting leaderboards (daily, weekly, monthly)
- Multiple aggregation methods (last, max, min, sum)

**Leaderboard Functions:**
- `playfab_leaderboard_get()`
- `playfab_leaderboard_get_top()`
- `playfab_leaderboard_get_around_player()`
- `playfab_leaderboard_get_player_rank()`
- `playfab_leaderboard_get_around_other_player()`
- `playfab_leaderboard_get_friends()`
- `playfab_leaderboard_get_friends_with_steam()`
- `playfab_leaderboard_get_friends_with_facebook()`
- `playfab_leaderboard_get_friends_all_platforms()`

**Statistics Functions:**
- `playfab_statistic_update()`
- `playfab_statistics_update_multiple()`
- `playfab_statistics_get()`
- `playfab_statistics_get_all()`

**Helper Functions:**
- `playfab_leaderboard_extract_entries()`
- `playfab_leaderboard_find_player()`
- `playfab_leaderboard_get_version()`
- `playfab_leaderboard_get_next_reset()`
- `playfab_statistic_extract_value()`
- `playfab_statistic_extract_version()`
- `playfab_statistics_to_struct()`

#### Economy Module
- Catalog management (items, prices, classes, tags)
- Player inventory management
- Virtual currency balances
- Item purchases with virtual currency
- Store-specific pricing
- Consumable item support
- Container/lootbox opening
- Purchase validation

**Catalog Functions:**
- `playfab_get_catalog_items()`
- `playfab_get_store_items()`

**Inventory Functions:**
- `playfab_get_player_inventory()`
- `playfab_get_virtual_currency()`

**Purchase Functions:**
- `playfab_purchase_item()`
- `playfab_purchase_item_from_store()`

**Consumption Functions:**
- `playfab_consume_item()`
- `playfab_unlock_container()`

**Helper Functions:**
- `playfab_catalog_find_item()`
- `playfab_catalog_get_price()`
- `playfab_catalog_filter_by_class()`
- `playfab_catalog_filter_by_tag()`
- `playfab_catalog_to_lookup()`
- `playfab_inventory_find_item()`
- `playfab_inventory_find_all_items()`
- `playfab_inventory_has_item()`
- `playfab_inventory_count_item()`
- `playfab_inventory_get_total_uses()`
- `playfab_currency_get_balance()`
- `playfab_can_afford()`
- `playfab_inventory_filter_by_class()`
- `playfab_validate_purchase()`
- `playfab_find_consumable_instance()`
- `playfab_use_item_by_id()`

#### CloudScript Module
- Execute server-side CloudScript functions
- Pass parameters to scripts
- Retrieve function results
- Access execution logs
- Error handling for script failures

**Functions:**
- `playfab_execute_cloud_script()`
- `playfab_cloud_call()`

**Helper Functions:**
- `playfab_cloud_script_get_result()`
- `playfab_cloud_script_get_logs()`
- `playfab_cloud_script_had_error()`
- `playfab_cloud_script_get_error()`
- `playfab_cloud_script_get_execution_time()`

#### Friends Module
- Get friends list (PlayFab, Steam, Facebook)
- Add friends (by ID, username, email)
- Remove friends
- Friend tags for categorization
- Friend search and filtering

**Functions:**
- `playfab_get_friends_list()`
- `playfab_friends_get_list()`
- `playfab_friends_get_list_with_steam()`
- `playfab_friends_get_list_with_facebook()`
- `playfab_add_friend()`
- `playfab_friends_add()`
- `playfab_friends_add_by_username()`
- `playfab_friends_add_by_email()`
- `playfab_remove_friend()`
- `playfab_friends_remove()`
- `playfab_friends_set_tags()`

**Helper Functions:**
- `playfab_friends_extract_list()`
- `playfab_friends_find()`
- `playfab_friends_get_count()`
- `playfab_friends_has_tag()`
- `playfab_friends_filter_by_tag()`
- `playfab_friends_is_friend()`

#### Analytics Module
- Custom event tracking
- Batch event submission
- Player-scoped and title-scoped events
- Convenience tracking functions for common events
- Fire-and-forget tracking (no callback required)

**Core Functions:**
- `playfab_write_event()`
- `playfab_analytics_write_event()`
- `playfab_analytics_write_events()`
- `playfab_analytics_write_player_event()`
- `playfab_analytics_write_title_event()`

**Convenience Functions:**
- `playfab_track()`
- `playfab_track_level_start()`
- `playfab_track_level_complete()`
- `playfab_track_level_failed()`
- `playfab_track_purchase()`
- `playfab_track_error()`
- `playfab_track_session_start()`
- `playfab_track_session_end()`
- `playfab_track_tutorial_step()`
- `playfab_track_achievement()`

#### Demo Project
- Complete demonstration of all features
- Login screen with device and email authentication
- Main menu with player info and currency display
- Player data management with CRUD operations
- Leaderboard display with tabs (All Time, Weekly, Friends)
- Mini-game (Coin Collector) with score submission
- Economy screen with shop, inventory, and purchases
- CloudScript execution examples
- Friends list management
- Debug console for API inspection

**Demo Screens:**
- rm_splash - Loading/initialization
- rm_login - Authentication options
- rm_main_menu - Navigation hub
- rm_player_data - Data management
- rm_leaderboards - Rankings display
- rm_mini_game - Playable game
- rm_economy - Shop and inventory
- rm_cloud_script - Server code execution
- rm_friends - Social features
- rm_debug_console - API inspector

#### Documentation
- README.md - Overview and quick start
- QUICK_START.md - Step-by-step setup guide
- API_REFERENCE.md - Complete function documentation
- PLAYFAB_SETUP.md - Dashboard configuration guide
- TROUBLESHOOTING.md - Common issues and solutions
- CHANGELOG.md - Version history

#### Infrastructure
- Async HTTP handler object (obj_playfab_handler)
- Request/response tracking system
- Debug logging with privacy protection
- Error handling with detailed messages
- Callback validation
- API call logging for debug console

### Technical Details

- **GameMaker Version**: 2.3+
- **GML Syntax**: Modern GML with structs, functions, method binding
- **API Version**: PlayFab Client API
- **Total Public Functions**: 131
- **Modules**: 8 (Core, Auth, Data, Leaderboard, Economy, Cloud, Friends, Analytics)

---

## Roadmap

### Planned for Future Releases

#### Version 1.1.0 (Planned)
- Entity API support
- Push notifications
- Real-time multiplayer foundations
- Matchmaking support

#### Version 1.2.0 (Planned)
- Real-money purchase validation (iOS, Android, Steam)
- Server-side receipt validation
- A/B testing integration
- Player segments

#### Version 2.0.0 (Planned)
- PlayFab Multiplayer Servers integration
- Party system
- Voice chat support
- Cross-platform play features

---

## Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Reporting bugs
- Suggesting features
- Submitting pull requests

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
