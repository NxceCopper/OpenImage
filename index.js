/**
 * Multi-Account Isolated Browser Context Prototype
 * Demonstrates launching multiple browser instances with completely isolated userDataDir.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function launchAccount(accountId, url = 'https://chatgpt.com') {
    const profileDir = path.join(__dirname, 'profiles', `account-${accountId}`);
    if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
    }

    console.log(`Launching isolated browser context for Account ${accountId} at ${profileDir}...`);
    
    const context = await chromium.launchPersistentContext(profileDir, {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await context.newPage();
    await page.goto(url);
    console.log(`Account ${accountId} successfully loaded ${url}`);
    
    return { context, page };
}

async function main() {
    console.log('--- Starting Multi-Account Browser Prototype ---');
    
    const account1 = await launchAccount(1);
    const account2 = await launchAccount(2);

    console.log('Both accounts launched with fully isolated session profiles.');
}

if (require.main === module) {
    main().catch(console.error);
}
