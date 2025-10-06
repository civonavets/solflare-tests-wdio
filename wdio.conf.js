exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [],
    
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            // Determine headless mode from command line argument or default to headed
            args: process.argv.includes('--headless') 
                ? ['--headless', '--disable-gpu', '--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage']
                : ['--start-maximized', '--disable-blink-features=AutomationControlled'],
            // Set user agent to avoid automation detection
            prefs: {
                'profile.default_content_setting_values.notifications': 2
            }
        },
        acceptInsecureCerts: true
    }],
    
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'https://solflare.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Framework and services
    services: ['chromedriver'],
    framework: 'mocha',
    reporters: ['spec'],
    
    // Mocha options
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    
    // =====
    // Hooks
    // =====
    /**
     * Gets executed before test execution begins
     */
    before: function (capabilities, specs) {
        // Set viewport size
        browser.setWindowSize(1920, 1080);
    },
    
    /**
     * Gets executed after all tests are done
     */
    after: function (result, capabilities, specs) {
        // Cleanup
    },
    
    /**
     * Gets executed before each test
     */
    beforeTest: function (test, context) {
        console.log(`\n🧪 Running test: ${test.title}`);
    },
    
    /**
     * Gets executed after each test
     */
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            // Take screenshot on failure
            await browser.saveScreenshot(`./screenshots/${test.title.replace(/\s+/g, '_')}_FAILED.png`);
            console.log(`❌ Test failed: ${test.title}`);
        } else {
            console.log(`✅ Test passed: ${test.title}`);
        }
    }
};