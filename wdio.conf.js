const logger = require('./utils/logger');

// Track suite start time for duration calculation
let suiteStartTime;

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
            args: process.argv.includes('--headless') 
                ? ['--headless', '--disable-gpu', '--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage']
                : ['--start-maximized', '--disable-blink-features=AutomationControlled'],
            prefs: {
                'profile.default_content_setting_values.notifications': 2
            }
        },
        acceptInsecureCerts: true
    }],
    
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'silent', // Use 'silent' since we're using Winston logger
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
     * Gets executed once before all workers get launched
     */
    onPrepare: function (config, capabilities) {
        suiteStartTime = Date.now(); // Store start time
        logger.info('═'.repeat(70));
        logger.info('🎯 WebdriverIO Test Suite Starting');
        logger.info('═'.repeat(70));
        logger.info(`Browser: ${capabilities[0].browserName.toUpperCase()}`);
        logger.info(`Mode: ${process.argv.includes('--headless') ? 'Headless' : 'Headed'}`);
        logger.info(`Base URL: ${config.baseUrl}`);
        logger.info('═'.repeat(70));
    },

    /**
     * Gets executed before test execution begins
     */
    before: function (capabilities, specs) {
        logger.debug('Setting viewport size to 1920x1080');
        browser.setWindowSize(1920, 1080);
        logger.step('Browser initialized and ready');
    },
    
    /**
     * Gets executed after all tests are done
     */
    after: function (result, capabilities, specs) {
        logger.debug('Browser cleanup completed');
    },
    
    /**
     * Gets executed before each test
     */
    beforeTest: function (test, context) {
        logger.info('\n' + '─'.repeat(70));
        logger.info(`🧪 Starting: ${test.parent} > ${test.title}`);
        logger.info('─'.repeat(70));
    },
    
    /**
     * Gets executed after each test
     */
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            const screenshotPath = `./screenshots/${test.title.replace(/\s+/g, '_')}_FAILED.png`;
            await browser.saveScreenshot(screenshotPath);
            logger.error(`Test failed: ${test.title}`);
            logger.info(`📸 Screenshot saved: ${screenshotPath}`);
            
            if (error) {
                logger.error('Failure details', error);
            }
        } else {
            logger.info(`✅ Test passed in ${duration}ms`);
        }
        logger.info('─'.repeat(70) + '\n');
    },

    /**
     * Gets executed after all workers got shut down
     */
    onComplete: function(exitCode, config, capabilities, results) {
        const duration = Date.now() - suiteStartTime; // Calculate total duration
        logger.info('═'.repeat(70));
        logger.info('📊 Test Suite Completed');
        logger.info('═'.repeat(70));
        logger.info(`Exit Code: ${exitCode}`);
        logger.info(`Total Duration: ${duration}ms`);
        logger.info('═'.repeat(70));
    }
};