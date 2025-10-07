const logger = require('./utils/logger');
const screenshot = require('./utils/screenshotHelper');

// Parse browser from command line arguments (default: chrome)
const getBrowser = () => {
    const browserArg = process.argv.find(arg => arg.startsWith('--browser='));
    return browserArg ? browserArg.split('=')[1] : 'chrome';
};

// Check if headless mode is requested
const isHeadless = process.argv.includes('--headless');

const selectedBrowser = getBrowser();

// Browser configurations
const browserConfigs = {
    chrome: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: isHeadless 
                ? [
                    '--headless=new',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
                ]
                : ['--start-maximized', '--disable-blink-features=AutomationControlled'],
            prefs: {
                'profile.default_content_setting_values.notifications': 2
            }
        },
        acceptInsecureCerts: true
    },
    firefox: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
            args: isHeadless ? ['-headless'] : [],
            prefs: {
                'dom.webnotifications.enabled': false,
                'dom.push.enabled': false
            }
        },
        acceptInsecureCerts: true
    }
};

// Validate browser selection
if (!browserConfigs[selectedBrowser]) {
    console.error(`Invalid browser: ${selectedBrowser}. Supported browsers: chrome, firefox`);
    process.exit(1);
}

exports.config = {
    runner: 'local',
    
    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [],
    
    maxInstances: 1,
    capabilities: [browserConfigs[selectedBrowser]],
    
    logLevel: 'silent',
    bail: 0,
    baseUrl: 'https://solflare.com',
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    services: selectedBrowser === 'chrome' ? ['chromedriver'] : ['geckodriver'],
    framework: 'mocha',
    reporters: ['spec'],
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000
    },
    
    onPrepare: function (config, capabilities) {
        logger.info('═'.repeat(70));
        logger.info('🎯 WebdriverIO Test Suite Starting');
        logger.info('═'.repeat(70));
        logger.info(`Browser: ${selectedBrowser.toUpperCase()}`);
        logger.info(`Mode: ${isHeadless ? 'Headless' : 'Headed'}`);
        logger.info(`Base URL: ${config.baseUrl}`);
        logger.info('═'.repeat(70));
    },

    before: function (capabilities, specs) {
        logger.debug('Setting viewport size to 1920x1080');
        browser.setWindowSize(1920, 1080);
        logger.step('Browser initialized and ready');
    },
    
    after: function (result, capabilities, specs) {
        logger.debug('Browser cleanup completed');
    },
    
    beforeTest: function (test, context) {
        logger.info('\n' + '─'.repeat(70));
        logger.info(`🧪 Starting: ${test.parent} > ${test.title}`);
        logger.info('─'.repeat(70));
    },
    
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await screenshot.captureFailure(test.title);
            logger.error(`Test failed: ${test.title}`);
            
            if (error) {
                logger.error('Failure details', error);
            }
        } else {
            logger.info(`✅ Test passed in ${duration}ms`);
        }
        logger.info('─'.repeat(70) + '\n');
    },

    onComplete: function(exitCode, config, capabilities, results) {
        logger.info('═'.repeat(70));
        logger.info('📊 Test Suite Completed');
        logger.info('═'.repeat(70));
        logger.info(`Exit Code: ${exitCode}`);
        logger.info(`Total Duration: ${results.duration}ms`);
        logger.info('═'.repeat(70));
    }
};