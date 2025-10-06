# Solflare Wallet WebdriverIO Test Suite

A comprehensive end-to-end test automation framework for Solflare wallet management using WebdriverIO with Page Object Model pattern.

## ✨ Features

- ✅ **WebdriverIO Framework**: Industry-standard E2E testing
- ✅ **API Testing**: Axios + Mocha + Chai for REST API validation
- ✅ **Page Object Model**: Maintainable and reusable test structure
- ✅ **Headed & Headless Modes**: Flexible execution options
- ✅ **Automatic Screenshots**: Failure screenshots for debugging
- ✅ **Detailed Logging**: Console output with emojis for clarity
- ✅ **Chrome Browser Support**: Cross-browser ready architecture

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Google Chrome**: Latest version
- **Git**: For version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/civonavets/solflare-wallet-tests-wdio.git>
cd solflare-wallet-wdio-tests
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- WebdriverIO CLI and runner
- Mocha test framework
- Chrome driver
- Spec reporter

## 🎯 Running Tests

### Headed Mode (Default - Browser Visible)

```bash
npm test
```

or

```bash
npm run test:headed
```

This will:
- Launch Chrome browser with visible UI
- Execute the wallet management test
- Display real-time progress in console
- Save screenshots on failure

### Headless Mode (Background Execution)

```bash
npm run test:headless
```

This will:
- Run Chrome in headless mode (no UI)
- Execute tests faster
- Ideal for CI/CD pipelines
- Still capture screenshots on failure

### Direct WebdriverIO Commands

```bash
# Headed mode
npx wdio run wdio.conf.js

# Headless mode
npx wdio run wdio.conf.js --headless
```

## 🌐 API Testing

### Running API Tests

```bash
# Run API tests only
npm run test:api

# Run all tests (API + UI)
npm run test:all
```

### API Test Scenarios

The API test suite validates Solflare's wallet API endpoints:

**Test Scenario 1: Portfolio Value Validation**
- Validates calculated token totals match API-provided totals
- Verifies total value equals sum of tokensValue and stocksValue
- Tests both wallet addresses independently

**Test Scenario 2: Balances Endpoint Validation**
- Validates net worth calculation across multiple wallets
- Verifies aggregated balances endpoint accuracy
- Tests POST endpoint with multiple wallet addresses

### API Test Output

```
🔍 Testing portfolio value for: 96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuU
✓ API request successful (200 OK)
📊 Portfolio Summary:
   - Total Value: $1,234.56
   - Tokens Value: $1,234.56
   - Stocks Value: $0.00
   - Number of tokens: 15

✓ Validation 1: Calculated vs API Total
   ✅ Values match within tolerance ($0.01)

✓ Validation 2: Total vs Combined (Tokens + Stocks)
   ✅ Values match within tolerance ($0.01)
```

## 📁 Project Structure

```
solflare-wallet-wdio-tests/
│
├── test/
│   ├── api/                      # API test files
│   │   └── portfolioApi.spec.js  # Portfolio API tests
│   │
│   ├── pageobjects/              # Page Object Model files
│   │   ├── OnboardingPage.js     # Onboarding flow page object
│   │   └── WalletManagementPage.js # Wallet management page object
│   │
│   └── specs/                    # UI test specification files
│       └── walletManagement.spec.js # Main UI test suite
│
├── screenshots/                  # Failure screenshots (auto-generated)
│
├── wdio.conf.js                 # WebdriverIO configuration
├── package.json                 # NPM dependencies and scripts
└── README.md                    # This file
```

## 🧪 Test Scenarios

### UI Test Case: Wallet Management - Recovery Phrase Validation

**Objective**: Verify that the recovery phrase list contains the original wallet and newly added wallets.

**Test Steps**:

1. ✅ Navigate to https://solflare.com/onboard
2. ✅ Click "I need a new wallet" button
3. ✅ Read the recovery phrase (not copied)
4. ✅ Click "I saved my recovery phrase"
5. ✅ Enter recovery phrase (typed, not pasted)
6. ✅ Click Continue
7. ✅ Enter password in first field
8. ✅ Enter same password in second field
9. ✅ Click Continue
10. ✅ Click "I agree, let's go"
11. ✅ Click Wallet management (Avatar in header)
12. ✅ Verify Main Wallet is displayed
13. ✅ Click "+ Add wallet"
14. ✅ Click "Manage recovery phrase"
15. ✅ Verify first toggle is disabled
16. ✅ Verify first toggle is ON (checked)
17. ✅ Select 3rd and 4th list items
18. ✅ Click Save

**Expected Result**:
- Recovery phrase list contains: Main Wallet, newly added wallet (Talimi Banana), and toggle-generated wallets (Wallet 2, Wallet 3)

### API Test Cases: Portfolio API Validation

**Test Scenario 1: Total Portfolio Value Validation**

**Objective**: Validate portfolio calculation accuracy for individual wallets.

**Test Steps**:
1. ✅ Send GET request to `/v3/portfolio/tokens/{address}`
2. ✅ Extract tokens, value, tokensValue, and stocksValue from response
3. ✅ Calculate total from individual token values
4. ✅ Verify calculated total matches API's total value (within tolerance)
5. ✅ Verify total equals tokensValue + stocksValue (within tolerance)
6. ✅ Repeat for all test addresses

**Expected Result**:
- All calculations match within floating-point tolerance ($0.01)
- Portfolio breakdown is mathematically consistent

**Test Scenario 2: Balances Endpoint Validation**

**Objective**: Validate net worth calculation across multiple wallets.

**Test Steps**:
1. ✅ Fetch portfolio value for first wallet
2. ✅ Fetch portfolio value for second wallet
3. ✅ Calculate expected net worth (sum of both portfolios)
4. ✅ Send POST request to `/v2/portfolio/balances` with both addresses
5. ✅ Verify netWorth equals sum of portfolio values (within tolerance)
6. ✅ Verify netWorth equals sum of data array values (within tolerance)

**Expected Result**:
- Net worth accurately aggregates multiple wallet values
- All validations pass within floating-point tolerance ($0.01)

## 🏗️ Page Object Model

### OnboardingPage.js

Handles the complete wallet creation and onboarding flow:

**Key Methods**:
- `visit()` - Navigate to onboarding page
- `clickNeedNewWallet()` - Start new wallet creation
- `extractRecoveryPhrase()` - Read recovery phrase from UI
- `enterRecoveryPhrase(phrase)` - Type recovery phrase
- `enterPassword(password)` - Set wallet password
- `completeOnboarding(password)` - Execute full flow

### WalletManagementPage.js

Manages wallet operations and recovery phrase settings:

**Key Methods**:
- `openWalletManagement()` - Open wallet menu
- `verifyMainWallet()` - Validate main wallet exists
- `addNewWallet(name)` - Create new wallet with name
- `manageRecoveryPhraseToggles()` - Toggle wallet visibility
- `verifyWalletsInList(names)` - Validate wallet list

## ⚙️ Configuration

### wdio.conf.js

Main configuration file for WebdriverIO:

**Key Settings**:
- **Browser**: Chrome (configurable for Firefox, Edge)
- **Headless Mode**: Controlled via `--headless` flag
- **Timeouts**: 10 seconds default, 60 seconds for tests
- **Screenshots**: Auto-captured on test failure
- **Window Size**: 1920x1080 (desktop viewport)

**Modify Configuration**:

```javascript
// Change viewport size
browser.setWindowSize(1366, 768);

// Change timeout
waitforTimeout: 15000

// Add another browser
capabilities: [{
    browserName: 'firefox'
}]
```

## 📸 Screenshots

Screenshots are automatically captured on test failures and saved to:

```
screenshots/
└── Test_Name_FAILED.png
```

## 🐛 Debugging

### Enable Debug Logs

Edit `wdio.conf.js`:

```javascript
logLevel: 'debug'  // Change from 'info' to 'debug'
```

### Run in Headed Mode

Always use headed mode when debugging:

```bash
npm run test:headed
```

This allows you to:
- See browser actions in real-time
- Inspect elements
- Observe test failures visually

### Common Issues

**Issue**: Chrome driver version mismatch
```bash
# Solution: Update chromedriver
npm install chromedriver@latest --save-dev
```

**Issue**: Test timeout
```bash
# Solution: Increase timeout in wdio.conf.js
mochaOpts: {
    timeout: 120000  // 2 minutes
}
```

**Issue**: Element not found
```bash
# Solution: Increase wait time in test
await element.waitForDisplayed({ timeout: 15000 });
```

## 🔧 Customization

### Change UI Test Data

Edit `test/specs/walletManagement.spec.js`:

```javascript
const testConfig = {
    password: 'YourCustomPassword123!',
    newWalletName: 'My Custom Wallet',
    mainWalletName: 'Main Wallet'
};
```

### Change API Test Data

Edit `test/api/portfolioApi.spec.js`:

```javascript
// Add or modify test wallet addresses
const ADDRESSES = [
    '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuU',
    '7eXxD3vQww9cgBgD3gb7iqTriAzAmCBXFBMpdDi71P3i',
    'YourWalletAddressHere'
];

// Adjust tolerance for calculations
const TOLERANCE = 0.01; // In USD
```

### Add More Tests

**UI Tests** - Create new spec files in `test/specs/`:

```javascript
// test/specs/newTest.spec.js
const OnboardingPage = require('../pageobjects/OnboardingPage');

describe('New Test Suite', () => {
    it('should do something', async () => {
        await OnboardingPage.visit();
        // Your test code
    });
});
```

**API Tests** - Create new spec files in `test/api/`:

```javascript
// test/api/newApiTest.spec.js
const axios = require('axios');
const { expect } = require('chai');

describe('New API Test Suite', () => {
    it('should test new endpoint', async () => {
        const response = await axios.get('https://api.example.com/endpoint');
        expect(response.status).to.equal(200);
        // Your assertions
    });
});
```

### Add More Page Objects

Create new page objects in `test/pageobjects/`:

```javascript
// test/pageobjects/NewPage.js
class NewPage {
    get element() {
        return $('[data-testid="element"]');
    }
    
    async clickElement() {
        await this.element.click();
    }
}

module.exports = new NewPage();
```

## 📊 Test Reports

Console output includes:
- ✅ Passed steps (green checkmarks)
- ❌ Failed steps (red X marks)
- 🧪 Test execution details
- ⏱️ Execution time

Example output:
```
🧪 Running test: Verify that the recovery phrase list contains the original wallet and the newly added wallets

📝 Starting onboarding flow...
✓ Clicked "I need a new wallet" button
✓ Read recovery phrase (24 words)
✓ Entered recovery phrase (typed, not pasted)
✓ Onboarding completed successfully

✅ TEST COMPLETED SUCCESSFULLY
```

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: WebdriverIO Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm run test:api
  
  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm run test:headless
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: screenshots
          path: screenshots/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow naming conventions (camelCase for functions, PascalCase for classes)
4. Comment your code
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Naming Conventions

Following JavaScript best practices:

- **Variables & Functions**: camelCase (`myVariable`, `doSomething()`)
- **Classes**: PascalCase (`OnboardingPage`, `WalletManagementPage`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Files**: camelCase for specs, PascalCase for page objects
- **Private Methods**: Prefix with underscore (`_privateMethod()`)

## 📄 License

MIT

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting](#debugging) section
2. Review WebdriverIO documentation: https://webdriver.io/
3. Open an issue in the repository

## 📚 Resources

- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [Page Object Pattern](https://webdriver.io/docs/pageobjects/)
- [Mocha Framework](https://mochajs.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**Happy Testing! 🎉**# solflare-wallet-tests-wdio
