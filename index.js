/**
 * Multi-Account Isolated Browser Context Prototype
 * Demonstrates launching multiple browser instances with isolated profiles,
 * configured for Asia/Bangkok timezone, locale, and optional proxy support.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function launchAccount(accountId, options = {}) {
    const {
        url = 'https://chatgpt.com',
        headless = process.env.HEADLESS === 'true',
        proxy = process.env.PROXY_URL || null // e.g. "http://user:pass@proxy-asia.com:8080"
    } = options;

    const profileDir = path.join(__dirname, 'profiles', `account-${accountId}`);
    if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
    }

    console.log(`Launching isolated browser context for Account ${accountId}...`);

    const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
    ];

    const contextOptions = {
        headless: headless,
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
        timezoneId: 'Asia/Bangkok',
        geolocation: { latitude: 13.7563, longitude: 100.5018 }, // Bangkok coordinates
        permissions: ['geolocation'],
        args: launchArgs
    };

    if (proxy) {
        contextOptions.proxy = { server: proxy };
    }

    const context = await chromium.launchPersistentContext(profileDir, contextOptions);
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log(`[Account ${accountId}] Loaded ${url}`);

    return { context, page };
}

async function main() {
    console.log('--- Starting Multi-Account Browser Prototype (Asia Configured) ---');

    // Example launch
    const account1 = await launchAccount(1);
    console.log('Account 1 context ready.');
}

if (require.main === module) {
    main().catch(console.error);
}
