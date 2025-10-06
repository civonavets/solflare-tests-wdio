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
        await this.walletPicker.waitForDisplayed({ timeout: 10000 });
        // Click at the top of the wallet picker element
        await this.walletPicker.click();
        await browser.pause(1000); // Wait for menu to open
        console.log('✓ Opened wallet management');
    }

    /**
     * Verify that the Main Wallet is displayed
     */
    async verifyMainWallet() {
        await this.recoveryPhraseHeader.waitForDisplayed({ timeout: 10000 });
        
        // Get the first wallet title within the recovery phrase section
        const mainWalletTitle = await this.recoveryPhraseHeader.$('[data-testid="list-item-m-title"]');
        await mainWalletTitle.waitForDisplayed({ timeout: 5000 });
        
        const walletText = await mainWalletTitle.getText();
        
        // Verify text matches "Main Wallet"
        if (walletText === 'Main Wallet') {
            console.log('✓ Main Wallet is displayed');
            return true;
        } else {
            throw new Error(`Expected "Main Wallet" but found "${walletText}"`);
        }
    }

    /**
     * Click the + Add wallet button
     */
    async clickAddWallet() {
        await this.addWalletBtn.waitForClickable({ timeout: 10000 });
        await this.addWalletBtn.click();
        await browser.pause(500);
        console.log('✓ Clicked + Add wallet button');
    }

    /**
     * Select "Derive next account" option from the menu
     */
    async selectDeriveNext() {
        await this.deriveNextOption.waitForDisplayed({ timeout: 10000 });
        await this.deriveNextOption.click();
        await browser.pause(500);
        console.log('✓ Selected "Derive next account" option');
    }

    /**
     * Click the back button
     */
    async clickBack() {
        await this.backBtn.waitForClickable({ timeout: 10000 });
        await this.backBtn.click();
        await browser.pause(500);
        console.log('✓ Clicked back button');
    }

    /**
     * Enter a wallet name in the input field
     * @param {string} name - Name for the new wallet
     */
    async enterWalletName(name) {
        await this.walletNameInput.waitForDisplayed({ timeout: 10000 });
        await this.walletNameInput.setValue(name);
        console.log(`✓ Entered wallet name: "${name}"`);
    }

    /**
     * Click the Add button to confirm wallet creation
     */
    async confirmAddWallet() {
        await this.addBtn.waitForClickable({ timeout: 10000 });
        await this.addBtn.click();
        await browser.pause(1000); // Wait for wallet to be added
        console.log('✓ Confirmed wallet addition');
    }

    /**
     * Verify that a wallet with the given name is added to the list
     * @param {string} walletName - Expected wallet name
     */
    async verifyWalletAdded(walletName) {
        await browser.pause(1000); // Wait for list to update
        
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
            console.log(`✓ Wallet "${walletName}" is visible in the list`);
            return true;
        } else {
            throw new Error(`Wallet "${walletName}" not found in the list`);
        }
    }

    /**
     * Add a new wallet with a custom name
     * @param {string} walletName - Name for the new wallet
     */
    async addNewWallet(walletName) {
        console.log(`\n📝 Adding new wallet: "${walletName}"...`);
        
        await this.clickAddWallet();
        await this.selectDeriveNext();
        await this.clickBack();
        await this.selectDeriveNext();
        await this.enterWalletName(walletName);
        await this.confirmAddWallet();
        await this.verifyWalletAdded(walletName);
        
        console.log(`✅ New wallet "${walletName}" added successfully\n`);
    }

    /**
     * Click "Manage recovery phrase" option from the menu
     */
    async selectManageRecoveryPhrase() {
        await this.manageOption.waitForDisplayed({ timeout: 10000 });
        await this.manageOption.click();
        await browser.pause(1000);
        console.log('✓ Selected "Manage recovery phrase" option');
    }

    /**
     * Verify that the first toggle is disabled and checked (ON)
     */
    async verifyFirstToggleState() {
        const toggles = await this.toggleSwitches;
        
        if (toggles.length === 0) {
            throw new Error('No toggle switches found');
        }
        
        const firstToggle = toggles[0];
        
        // Verify toggle is disabled
        const isEnabled = await firstToggle.isEnabled();
        if (isEnabled) {
            throw new Error('First toggle should be disabled but it is enabled');
        }
        console.log('✓ First toggle is disabled');
        
        // Verify toggle is checked (ON)
        const dataState = await firstToggle.getAttribute('data-state');
        if (dataState !== 'checked') {
            throw new Error(`First toggle should be ON (checked) but state is: ${dataState}`);
        }
        console.log('✓ First toggle is ON (checked)');
        
        return true;
    }

    /**
     * Select the 3rd and 4th toggle switches
     */
    async selectToggles() {
        const toggles = await this.toggleSwitches;
        
        if (toggles.length < 4) {
            throw new Error(`Expected at least 4 toggles but found ${toggles.length}`);
        }
        
        // Click 3rd toggle (index 2)
        await toggles[2].click();
        await browser.pause(300);
        console.log('✓ Selected 3rd toggle');
        
        // Click 4th toggle (index 3)
        await toggles[3].click();
        await browser.pause(300);
        console.log('✓ Selected 4th toggle');
    }

    /**
     * Click the Save button
     */
    async clickSave() {
        await this.saveBtn.waitForClickable({ timeout: 10000 });
        await this.saveBtn.click();
        await browser.pause(1000); // Wait for changes to be saved
        console.log('✓ Clicked Save button');
    }

    /**
     * Verify that specific wallets are present in the recovery phrase list
     * @param {string[]} walletNames - Array of expected wallet names
     */
    async verifyWalletsInList(walletNames = []) {
        console.log('\n🔍 Verifying wallets in recovery phrase list...');
        
        await this.recoveryPhraseHeader.waitForDisplayed({ timeout: 10000 });
        
        // Get all wallet titles within the recovery phrase section
        const titles = await this.recoveryPhraseHeader.$$('[data-testid="list-item-m-title"]');
        
        // Extract text from all titles
        const actualWalletNames = [];
        for (const title of titles) {
            const text = await title.getText();
            actualWalletNames.push(text);
        }
        
        console.log(`Found wallets: ${actualWalletNames.join(', ')}`);
        
        // Verify each expected wallet is present
        for (const expectedName of walletNames) {
            if (actualWalletNames.includes(expectedName)) {
                console.log(`✓ Wallet "${expectedName}" is present`);
            } else {
                throw new Error(`Wallet "${expectedName}" not found. Available wallets: ${actualWalletNames.join(', ')}`);
            }
        }
        
        console.log('✅ All expected wallets are present in the list\n');
        return true;
    }

    /**
     * Complete the manage recovery phrase toggles flow
     */
    async manageRecoveryPhraseToggles() {
        console.log('\n📝 Managing recovery phrase toggles...');
        
        await this.clickAddWallet();
        await this.selectManageRecoveryPhrase();
        await this.verifyFirstToggleState();
        await this.selectToggles();
        await this.clickSave();
        
        console.log('✅ Recovery phrase toggles managed successfully\n');
    }
}

module.exports = new WalletManagementPage();