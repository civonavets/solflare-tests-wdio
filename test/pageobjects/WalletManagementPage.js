const logger = require('../../utils/logger');

/**
 * WalletManagementPage - Page Object for Solflare wallet management functionality
 * Contains all selectors and methods for managing wallets and recovery phrases
 */
class WalletManagementPage {
    /**
     * Define selectors using data-testid attributes
     */
    get walletPicker() {
        return $('[data-testid="icon-section-wallet-picker-arrow-right"]');
    }

    get recoveryPhraseHeader() {
        return $('[data-testid="section-header_account_recovery_phrase"]');
    }

    get walletTitles() {
        return $$('[data-testid="list-item-m-title"]');
    }

    get addWalletBtn() {
        return $('[data-testid="icon-btn-add"]');
    }

    get deriveNextOption() {
        return $('[data-testid="li-add-wallet-mnemonic-derivenext"]');
    }

    get manageOption() {
        return $('[data-testid="li-add-wallet-mnemonic-manage"]');
    }

    get backBtn() {
        return $('[data-testid="icon-btn-back"]');
    }

    get walletNameInput() {
        return $('[data-testid="input-name"]');
    }

    get addBtn() {
        return $('[data-testid="btn-add"]');
    }

    get toggleSwitches() {
        return $$('button[role="switch"]');
    }

    get saveBtn() {
        return $('[data-testid="btn-save"]');
    }

    /**
     * Open wallet management by clicking the wallet picker (avatar in header)
     */
    async openWalletManagement() {
        logger.action('Opening wallet management menu');
        await this.walletPicker.waitForDisplayed({ timeout: 10000 });
        await this.walletPicker.click();
        await browser.pause(1000);
        logger.step('Opened wallet management');
    }

    /**
     * Verify that the Main Wallet is displayed
     */
    async verifyMainWallet() {
        logger.action('Verifying Main Wallet is displayed');
        await this.recoveryPhraseHeader.waitForDisplayed({ timeout: 10000 });
        
        const mainWalletTitle = await this.recoveryPhraseHeader.$('[data-testid="list-item-m-title"]');
        await mainWalletTitle.waitForDisplayed({ timeout: 5000 });
        
        const walletText = await mainWalletTitle.getText();
        
        if (walletText === 'Main Wallet') {
            logger.verify('Main Wallet is displayed');
            return true;
        } else {
            logger.error(`Expected "Main Wallet" but found "${walletText}"`);
            throw new Error(`Expected "Main Wallet" but found "${walletText}"`);
        }
    }

    /**
     * Click the + Add wallet button
     */
    async clickAddWallet() {
        logger.action('Clicking + Add wallet button');
        await this.addWalletBtn.waitForClickable({ timeout: 10000 });
        await this.addWalletBtn.click();
        await browser.pause(500);
        logger.step('Clicked + Add wallet button');
    }

    /**
     * Select "Derive next account" option from the menu
     */
    async selectDeriveNext() {
        logger.action('Selecting "Derive next account" option');
        await this.deriveNextOption.waitForDisplayed({ timeout: 10000 });
        await this.deriveNextOption.click();
        await browser.pause(500);
        logger.step('Selected "Derive next account" option');
    }

    /**
     * Click the back button
     */
    async clickBack() {
        logger.action('Clicking back button');
        await this.backBtn.waitForClickable({ timeout: 10000 });
        await this.backBtn.click();
        await browser.pause(500);
        logger.step('Clicked back button');
    }

    /**
     * Enter a wallet name in the input field
     * @param {string} name - Name for the new wallet
     */
    async enterWalletName(name) {
        logger.action(`Entering wallet name: "${name}"`);
        await this.walletNameInput.waitForDisplayed({ timeout: 10000 });
        await this.walletNameInput.setValue(name);
        logger.step(`Entered wallet name: "${name}"`);
    }

    /**
     * Click the Add button to confirm wallet creation
     */
    async confirmAddWallet() {
        logger.action('Confirming wallet addition');
        await this.addBtn.waitForClickable({ timeout: 10000 });
        await this.addBtn.click();
        await browser.pause(1000);
        logger.step('Confirmed wallet addition');
    }

    /**
     * Verify that a wallet with the given name is added to the list
     * @param {string} walletName - Expected wallet name
     */
    async verifyWalletAdded(walletName) {
        logger.action(`Verifying wallet "${walletName}" is in the list`);
        await browser.pause(1000);
        
        const titles = await this.walletTitles;
        let found = false;
        
        for (const title of titles) {
            const text = await title.getText();
            if (text === walletName) {
                found = true;
                break;
            }
        }
        
        if (found) {
            logger.verify(`Wallet "${walletName}" is visible in the list`);
            return true;
        } else {
            logger.error(`Wallet "${walletName}" not found in the list`);
            throw new Error(`Wallet "${walletName}" not found in the list`);
        }
    }

    /**
     * Add a new wallet with a custom name
     * @param {string} walletName - Name for the new wallet
     */
    async addNewWallet(walletName) {
        logger.section(`Adding new wallet: "${walletName}"`);
        
        await this.clickAddWallet();
        await this.selectDeriveNext();
        await this.clickBack();
        await this.selectDeriveNext();
        await this.enterWalletName(walletName);
        await this.confirmAddWallet();
        await this.verifyWalletAdded(walletName);
        
        logger.verify(`New wallet "${walletName}" added successfully`);
    }

    /**
     * Click "Manage recovery phrase" option from the menu
     */
    async selectManageRecoveryPhrase() {
        logger.action('Selecting "Manage recovery phrase" option');
        await this.manageOption.waitForDisplayed({ timeout: 10000 });
        await this.manageOption.click();
        await browser.pause(1000);
        logger.step('Selected "Manage recovery phrase" option');
    }

    /**
     * Verify that the first toggle is disabled and checked (ON)
     */
    async verifyFirstToggleState() {
        logger.action('Verifying first toggle state (disabled and checked)');
        const toggles = await this.toggleSwitches;
        
        if (toggles.length === 0) {
            logger.error('No toggle switches found');
            throw new Error('No toggle switches found');
        }
        
        const firstToggle = toggles[0];
        
        // Verify toggle is disabled
        const isEnabled = await firstToggle.isEnabled();
        if (isEnabled) {
            logger.error('First toggle should be disabled but it is enabled');
            throw new Error('First toggle should be disabled but it is enabled');
        }
        logger.step('First toggle is disabled');
        
        // Verify toggle is checked (ON)
        const dataState = await firstToggle.getAttribute('data-state');
        if (dataState !== 'checked') {
            logger.error(`First toggle should be ON (checked) but state is: ${dataState}`);
            throw new Error(`First toggle should be ON (checked) but state is: ${dataState}`);
        }
        logger.step('First toggle is ON (checked)');
        
        return true;
    }

    /**
     * Select the 3rd and 4th toggle switches
     */
    async selectToggles() {
        logger.action('Selecting 3rd and 4th toggle switches');
        const toggles = await this.toggleSwitches;
        
        if (toggles.length < 4) {
            logger.error(`Expected at least 4 toggles but found ${toggles.length}`);
            throw new Error(`Expected at least 4 toggles but found ${toggles.length}`);
        }
        
        // Click 3rd toggle (index 2)
        await toggles[2].click();
        await browser.pause(300);
        logger.step('Selected 3rd toggle');
        
        // Click 4th toggle (index 3)
        await toggles[3].click();
        await browser.pause(300);
        logger.step('Selected 4th toggle');
    }

    /**
     * Click the Save button
     */
    async clickSave() {
        logger.action('Clicking Save button');
        await this.saveBtn.waitForClickable({ timeout: 10000 });
        await this.saveBtn.click();
        await browser.pause(1000);
        logger.step('Clicked Save button');
    }

    /**
     * Verify that specific wallets are present in the recovery phrase list
     * @param {string[]} walletNames - Array of expected wallet names
     */
    async verifyWalletsInList(walletNames = []) {
        logger.section('Verifying wallets in recovery phrase list');
        
        await this.recoveryPhraseHeader.waitForDisplayed({ timeout: 10000 });
        
        const titles = await this.recoveryPhraseHeader.$$('[data-testid="list-item-m-title"]');
        
        const actualWalletNames = [];
        for (const title of titles) {
            const text = await title.getText();
            actualWalletNames.push(text);
        }
        
        logger.info(`Found wallets: ${actualWalletNames.join(', ')}`);
        
        // Verify each expected wallet is present
        for (const expectedName of walletNames) {
            if (actualWalletNames.includes(expectedName)) {
                logger.verify(`Wallet "${expectedName}" is present`);
            } else {
                logger.error(`Wallet "${expectedName}" not found. Available: ${actualWalletNames.join(', ')}`);
                throw new Error(`Wallet "${expectedName}" not found`);
            }
        }
        
        logger.verify('All expected wallets are present in the list');
        return true;
    }

    /**
     * Complete the manage recovery phrase toggles flow
     */
    async manageRecoveryPhraseToggles() {
        logger.section('Managing recovery phrase toggles');
        
        await this.clickAddWallet();
        await this.selectManageRecoveryPhrase();
        await this.verifyFirstToggleState();
        await this.selectToggles();
        await this.clickSave();
        
        logger.verify('Recovery phrase toggles managed successfully');
    }
}

module.exports = new WalletManagementPage();