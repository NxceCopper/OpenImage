/**
 * Multi-Account Isolated Browser Context Prototype
 * Supports CLI account selection:
 *   node index.js 1       -> Launch account 1
 *   node index.js 1-5     -> Launch accounts 1 through 5
 *   node index.js 10      -> Launch account 10 (or specify range)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function launchAccount(accountId, options = {}) {
    const {
        url = 'https://chatgpt.com',
        headless = process.env.HEADLESS === 'true',
        proxy = process.env.PROXY_URL || null
    } = options;

    const profileDir = path.join(__dirname, 'profiles', `account-${accountId}`);
    if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
    }

    console.log(`Launching isolated browser context for Account ${accountId} at ${profileDir}...`);

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
        geolocation: { latitude: 13.7563, longitude: 100.5018 },
        permissions: ['geolocation'],
        args: launchArgs
    };

    if (proxy) {
        contextOptions.proxy = { server: proxy };
    }

    const context = await chromium.launchPersistentContext(profileDir, contextOptions);
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log(`[Account ${accountId}] Successfully loaded ${url}`);

    return { context, page };
}

function parseAccountArgs(arg) {
    if (!arg) return [1]; // default to account 1
    
    // Check for range like "1-5"
    if (arg.includes('-')) {
        const [start, end] = arg.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
            const accounts = [];
            for (let i = start; i <= end; i++) {
                accounts.push(i);
            }
            return accounts;
        }
    }

    const num = parseInt(arg, 10);
    if (!isNaN(num)) {
        return [num];
    }

    return [1];
}

async function main() {
    const arg = process.argv[2];
    const accountIds = parseAccountArgs(arg);

    console.log(`--- Starting Multi-Account Browser Prototype ---`);
    console.log(`Target accounts: ${accountIds.join(', ')}`);

    for (const id of accountIds) {
        try {
            await launchAccount(id);
        } catch (err) {
            console.error(`Failed to launch Account ${id}:`, err.message);
        }
    }

    console.log('All requested account sessions initialized.');
}

if (require.main === module) {
    main().catch(console.error);
}
