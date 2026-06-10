const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Step 1: Login then get redirected back
    await page.goto('https://misu-legal.mihailnica10.workers.dev/en/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Intercept ALL fetch calls, especially session
    const allReqs = [];
    page.on('request', req => {
        allReqs.push({url: req.url(), method: req.method(), type: req.resourceType()});
    });

    await page.fill('input[id="email"]', 'test@misu.ro');
    await page.fill('input[id="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000); // Wait for full cycle

    console.log('=== AFTER LOGIN CYCLE ===');
    console.log('URL:', page.url());
    const token = await page.evaluate(() => localStorage.getItem('misu_token'));
    console.log('Token:', token ? 'YES' : 'NO');

    // Step 2: From the login page (after redirect), check if session call would be made
    // by the AuthProvider if we navigated to assistant
    console.log('\n=== MANUAL SESSION TEST ===');
    const sessionResult = await page.evaluate(async () => {
        const token = localStorage.getItem('misu_token');
        if (!token) return 'NO_TOKEN';
        try {
            const r = await fetch('https://misu-api.mihailnica10.workers.dev/api/auth/session', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            return `SESSION ${r.status}: ${JSON.stringify(d)}`;
        } catch (e) {
            return `ERROR: ${e.message}`;
        }
    });
    console.log(sessionResult);

    // List all API requests in this session
    console.log('\n=== ALL API REQUESTS ===');
    allReqs.filter(r => r.url.includes('misu-api')).forEach(r => {
        console.log(`  ${r.method} ${r.url.split('/').pop()}`);
    });

    // Check: what requests were made to the assistant page?
    console.log('\n=== Requests for /en/assistant ===');
    allReqs.filter(r => r.url.includes('/en/assistant')).forEach(r => {
        console.log(`  ${r.type} ${r.url}`);
    });

    await browser.close();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
