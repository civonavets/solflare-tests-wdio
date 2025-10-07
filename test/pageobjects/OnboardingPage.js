const logger = require('../../utils/logger')

/**
 * OnboardingPage - Page Object for Solflare wallet onboarding flow
 * Contains all selectors and methods for wallet creation process
 */
class OnboardingPage {
    /**
     * Define selectors using data-testid attributes
     */
    get needNewWalletBtn() {
        return $('[data-testid="btn-need-new-wallet"]');
    }

    get mnemonicSection() {
        return $('[data-testid="section-mnemonic-field"]');
    }

    get recoveryPhraseInputs() {
        return $$('[data-testid^="input-recovery-phrase-"]');
    }

    get savedPhraseBtn() {
        return $('[data-testid="btn-saved-my-recovery-phrase"]');
    }

    get continueBtn() {
        return $('[data-testid="btn-continue"]');
    }

    get newPasswordInput() {
        return $('[data-testid="input-new-password"]');
    }

    get repeatPasswordInput() {
        return $('[data-testid="input-repeat-password"]');
    }

    get agreeBtn() {
        return $('[data-testid="btn-explore"]');
    }

    /**
     * Navigate to the onboarding page
     */
    async visit() {
        logger.action('Navigating to onboarding page');
        await browser.url('/onboard');
        await browser.waitUntil(
            async () => (await browser.execute(() => document.readyState)) === 'complete',
            { timeout: 15000, timeoutMsg: 'Page did not load' }
        );
        await browser.pause(3000);
        logger.step('Navigated to /onboard');
    }

    /**
     * Click "I need a new wallet" button
     */
    async clickNeedNewWallet() {
        logger.action('Waiting for "I need a new wallet" button');
        
        try {
            await this.needNewWalletBtn.waitForDisplayed({ timeout: 30000 });
            await this.needNewWalletBtn.click();
            logger.step('Clicked "I need a new wallet" button');
        } catch (error) {
            // Debug: capture what's on the page
            const pageUrl = await browser.getUrl();
            const pageTitle = await browser.getTitle();
            logger.error(`Button not found. URL: ${pageUrl}, Title: ${pageTitle}`);
            throw error;
        }
    }

    /**
     * Extract and store recovery phrase from the displayed inputs
     * @returns {Promise<string[]>} Array of recovery phrase words
     */
    async extractRecoveryPhrase() {
        logger.action('Extracting recovery phrase from UI');
        await this.mnemonicSection.waitForDisplayed({ timeout: 15000 });
        const inputs = await this.recoveryPhraseInputs;
        
        const recoveryPhrase = [];
        for (const input of inputs) {
            const word = await input.getValue();
            recoveryPhrase.push(word);
        }
        
        logger.step(`Read recovery phrase (${recoveryPhrase.length} words)`);
        logger.debug('Recovery phrase extracted', { wordCount: recoveryPhrase.length });
        return recoveryPhrase;
    }

    /**
     * Click "I saved my recovery phrase" button
     */
    async clickSavedPhrase() {
        logger.action('Clicking "I saved my recovery phrase" button');
        await this.savedPhraseBtn.waitForDisplayed({ timeout: 15000 });
        await this.savedPhraseBtn.click();
        logger.step('Clicked "I saved my recovery phrase" button');
    }

    /**
     * Enter the recovery phrase word by word (typing, not pasting)
     * @param {string[]} phrase - Array of recovery phrase words
     */
    async enterRecoveryPhrase(phrase) {
        logger.action(`Entering recovery phrase (${phrase.length} words)`);
        await browser.pause(1000);
        
        for (let i = 0; i < phrase.length; i++) {
            const input = await $(`[data-testid="input-recovery-phrase-${i + 1}"]`);
            await input.waitForDisplayed({ timeout: 5000 });
            await input.setValue(phrase[i]);
        }
        
        logger.step('Entered recovery phrase (typed, not pasted)');
    }

    /**
     * Click Continue button
     */
    async clickContinue() {
        logger.action('Clicking Continue button');
        await this.continueBtn.waitForClickable({ timeout: 15000 });
        await this.continueBtn.click();
        await browser.pause(500);
        logger.step('Clicked Continue button');
    }

    /**
     * Enter password in both password input fields
     * @param {string} password - Password to set for the wallet
     */
    async enterPassword(password) {
        logger.action('Entering password in both fields');
        await this.newPasswordInput.waitForDisplayed({ timeout: 15000 });
        await this.newPasswordInput.setValue(password);
        
        await this.repeatPasswordInput.waitForDisplayed({ timeout: 5000 });
        await this.repeatPasswordInput.setValue(password);
        
        logger.step('Entered password in both fields');
        logger.debug('Password fields populated');
    }

    /**
     * Click "I agree, let's go" button
     */
    async clickAgree() {
        logger.action('Clicking "I agree, let\'s go" button');
        await this.agreeBtn.waitForDisplayed({ timeout: 15000 });
        await this.agreeBtn.click();
        await browser.pause(2000);
        logger.step('Clicked "I agree, let\'s go" button');
    }

    /**
     * Complete the full onboarding flow in one method
     * @param {string} password - Password to set for the wallet
     * @returns {Promise<string[]>} The recovery phrase that was used
     */
    async completeOnboarding(password) {
        logger.section('Starting onboarding flow');
        
        await this.clickNeedNewWallet();
        const recoveryPhrase = await this.extractRecoveryPhrase();
        await this.clickSavedPhrase();
        await this.enterRecoveryPhrase(recoveryPhrase);
        await this.clickContinue();
        await this.enterPassword(password);
        await this.clickContinue();
        await this.clickAgree();
        
        logger.verify('Onboarding completed successfully');
        return recoveryPhrase;
    }
}

module.exports = new OnboardingPage();