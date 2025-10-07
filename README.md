# Solflare Wallet WebdriverIO Test Suite

A comprehensive end-to-end test automation framework for Solflare wallet management using WebdriverIO with Page Object Model pattern.

## ✨ Features

- ✅ **Cross-Browser Testing**: Chrome & Firefox support with command-line selection
- ✅ **WebdriverIO Framework**: Industry-standard E2E testing
- ✅ **API Testing**: Axios + Mocha + Chai for REST API validation
- ✅ **Page Object Model**: Maintainable and reusable test structure
- ✅ **Headed & Headless Modes**: Flexible execution options
- ✅ **Logger Framework**: Winston-based logging with file output and emojis
- ✅ **Screenshot Module**: Generic screenshot creation on failures and manual captures
- ✅ **No Local Dependencies**: Tests run on any machine

## 📋 Prerequisites

- **Node.js**: Version 22 or higher
- **npm**: Comes with Node.js
- **Chrome or Firefox**: Latest version

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/civonavets/solflare-tests-wdio.git
cd solflare-tests-wdio
npm install

# Run tests
npm test                    # Chrome headed mode (default)
npm run test:firefox        # Firefox headed mode
npm run test:chrome:headless # Chrome headless mode
npm run test:api            # API tests only
```

## 🎯 Running Tests

### Browser Selection

```bash
# Chrome (default)
npm test
npm run test:chrome

# Firefox
npm run test:firefox

# Headless modes
npm run test:chrome:headless
npm run test:firefox:headless

# Command line style
wdio run wdio.conf.js --browser=chrome --headless
wdio run wdio.conf.js --browser=firefox
```

### API Testing

```bash
npm run test:api           # API tests only
npm run test:all           # API + UI tests
```

## 📸 Screenshots

**Automatic on Failure:**
- Location: `./screenshots/`
- Format: `Test_Name_FAILED_YYYY-MM-DD_HH-mm-ss.png`
- No code needed - captured automatically

**Manual Capture:**
```javascript
const screenshot = require('../../utils/screenshotHelper');

it('should test something', async () => {
    await screenshot.capture('step_name');           // Basic capture
    await screenshot.captureWithName('custom_name'); // Custom filename
    await screenshot.captureElement(element, 'name'); // Element screenshot
});
```

## 📝 Logger

**Built-in Winston Logger:**
- Console output with colors and emojis
- File logging to `./logs/`
- Separate error log file

**Usage in Tests:**
```javascript
const logger = require('../../utils/logger');

logger.info('Test information');
logger.step('Step completed');
logger.error('Error occurred', error);
logger.debug('Debug data', { key: 'value' });
```

## 📁 Project Structure

```
solflare-wallet-wdio-tests/
├── test/
│   ├── api/                      # API test files
│   │   └── portfolioApi.spec.js
│   ├── pageobjects/              # Page Object Model
│   │   ├── OnboardingPage.js
│   │   └── WalletManagementPage.js
│   └── specs/                    # UI test specs
│       └── walletManagement.spec.js
├── utils/
│   ├── logger.js                 # Logger utility
│   └── screenshotHelper.js       # Screenshot module
├── screenshots/                  # Auto-generated screenshots
├── logs/                         # Log files
├── wdio.conf.js                 # WebdriverIO config
└── package.json
```

## 🧪 Test Scenarios

### UI Test: Wallet Management
Validates recovery phrase list contains original and newly added wallets.

**Flow:**
1. Navigate to onboarding → Click "I need a new wallet"
2. Extract recovery phrase → Save and verify
3. Set password → Complete onboarding
4. Add new wallet → Manage recovery phrase toggles
5. Verify all wallets in list

### API Tests: Portfolio Validation

**Test 1: Portfolio Value Calculation**
- Validates token totals match API values
- Verifies tokensValue + stocksValue = total

**Test 2: Net Worth Aggregation**
- Tests multi-wallet balance aggregation
- Validates POST endpoint accuracy

## ⚙️ Configuration

### Browser Settings

Edit `wdio.conf.js` for customization:

```javascript
// Change timeout
waitforTimeout: 15000

// Change window size
browser.setWindowSize(1366, 768)

// Add more browsers
capabilities: [{
    browserName: 'edge'
}]
```

### Test Data

Edit `test/specs/walletManagement.spec.js`:

```javascript
const testConfig = {
    password: 'YourPassword123!',
    newWalletName: 'Custom Wallet'
};
```

## 🔧 Adding Tests

**UI Test:**
```javascript
// test/specs/newTest.spec.js
const OnboardingPage = require('../pageobjects/OnboardingPage');
const logger = require('../../utils/logger');

describe('New Test', () => {
    it('should do something', async () => {
        logger.info('Starting test');
        await OnboardingPage.visit();
        // Test code
    });
});
```

**API Test:**
```javascript
// test/api/newTest.spec.js
const axios = require('axios');
const { expect } = require('chai');

describe('New API Test', () => {
    it('should test endpoint', async () => {
        const response = await axios.get('https://api.example.com');
        expect(response.status).to.equal(200);
    });
});
```

## 🐛 Debugging

**View Logs:**
```bash
cat logs/test-YYYY-MM-DD_HH-mm-ss.log
```

**Run Headed Mode:**
```bash
npm run test:chrome  # See browser actions in real-time
```

**Enable Debug Logs:**
```javascript
// wdio.conf.js
logLevel: 'debug'
```

## 🚦 CI/CD Integration

**GitHub Actions:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm run test:chrome:headless
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: screenshots
          path: screenshots/
```

## 📊 Test Output

```
══════════════════════════════════════════════════════════════════════
🎯 WebdriverIO Test Suite Starting
══════════════════════════════════════════════════════════════════════
Browser: CHROME
Mode: Headed
Base URL: https://solflare.com
══════════════════════════════════════════════════════════════════════

🧪 Starting: Wallet Management - Recovery Phrase

📍 Starting onboarding flow
✓ Clicked "I need a new wallet" button
✓ Read recovery phrase (24 words)
✓ Entered recovery phrase (typed, not pasted)
✓ Onboarding completed successfully

✅ TEST PASSED: Wallet Management - Recovery Phrase Validation
══════════════════════════════════════════════════════════════════════
```

## 🎓 Key Features Explained

### Cross-Browser Testing
Run tests in Chrome or Firefox with a single flag:
```bash
wdio run wdio.conf.js --browser=firefox --headless
```

### Logger Framework
Automatic logging with timestamped files, console colors, and emojis for clarity.

### Screenshot Module
Generic module captures screenshots on failure and allows manual captures at any test step.

### Page Object Model
Maintainable structure separates page logic from test logic.

## 📚 Resources

- [WebdriverIO Docs](https://webdriver.io/docs/gettingstarted)
- [Mocha Framework](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)

## 📄 License

MIT

---

**Happy Testing! 🎉**