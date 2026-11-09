# Multi-Account Browser Context Prototype

A proof-of-concept implementation demonstrating isolated multi-profile browser sessions using Playwright persistent contexts (`userDataDir`). Each account runs in its own sandboxed profile directory, completely separating cookies, cache, local storage, and session tokens.

## Structure
- `profiles/` - Isolated data directories for each account profile.
- `index.js` - Main launcher script that initializes separate isolated browser instances for multiple accounts.
