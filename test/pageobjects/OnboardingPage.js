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
        await browser.url('/onboard');
        await browser.pause(1000); // Wait for page to load
    }

    /**
     * Click "I need a new wallet" button
     */
    async clickNeedNewWallet() {
        await this.needNewWalletBtn.waitForDisplayed({ timeout: 10000 });
        await this.needNewWalletBtn.click();
        console.log('✓ Clicked "I need a new wallet" button');
    }

    /**
     * Extract and store recovery phrase from the displayed inputs
     * @returns {Promise<string[]>} Array of recovery phrase words
     */
    async extractRecoveryPhrase() {
        await this.mnemonicSection.waitForDisplayed({ timeout: 10000 });
        const inputs = await this.recoveryPhraseInputs;
        
        // Extract text from each input field (reading, not copying)
        const recoveryPhrase = [];
        for (const input of inputs) {
            const word = await input.getValue();
            recoveryPhrase.push(word);
        }
        
        console.log('✓ Read recovery phrase (24 words)');
        return recoveryPhrase;
    }

    /**
     * Click "I saved my recovery phrase" button
     */
    async clickSavedPhrase() {
        await this.savedPhraseBtn.waitForDisplayed({ timeout: 10000 });
        await this.savedPhraseBtn.click();
        console.log('✓ Clicked "I saved my recovery phrase" button');
    }

    /**
     * Enter the recovery phrase word by word (typing, not pasting)
     * @param {string[]} phrase - Array of recovery phrase words
     */
    async enterRecoveryPhrase(phrase) {
        await browser.pause(1000); // Wait for input fields to be ready
        
        for (let i = 0; i < phrase.length; i++) {
            const input = await $(`[data-testid="input-recovery-phrase-${i + 1}"]`);
            await input.waitForDisplayed({ timeout: 5000 });
            // Type each word (not paste)
            await input.setValue(phrase[i]);
        }
        
        console.log('✓ Entered recovery phrase (typed, not pasted)');
    }

    /**
     * Click Continue button
     */
    async clickContinue() {
        await this.continueBtn.waitForClickable({ timeout: 10000 });
        await this.continueBtn.click();
        await browser.pause(500); // Small pause for transition
        console.log('✓ Clicked Continue button');
    }

    /**
     * Enter password in both password input fields
     * @param {string} password - Password to set for the wallet
     */
    async enterPassword(password) {
        await this.newPasswordInput.waitForDisplayed({ timeout: 10000 });
        await this.newPasswordInput.setValue(password);
        
        await this.repeatPasswordInput.waitForDisplayed({ timeout: 5000 });
        await this.repeatPasswordInput.setValue(password);
        
        console.log('✓ Entered password in both fields');
    }

    /**
     * Click "I agree, let's go" button
     */
    async clickAgree() {
        await this.agreeBtn.waitForDisplayed({ timeout: 10000 });
        await this.agreeBtn.click();
        await browser.pause(2000); // Wait for wallet to initialize
        console.log('✓ Clicked "I agree, let\'s go" button');
    }

    /**
     * Complete the full onboarding flow in one method
     * @param {string} password - Password to set for the wallet
     * @returns {Promise<string[]>} The recovery phrase that was used
     */
    async completeOnboarding(password) {
        console.log('\n📝 Starting onboarding flow...');
        
        await this.clickNeedNewWallet();
        const recoveryPhrase = await this.extractRecoveryPhrase();
        await this.clickSavedPhrase();
        await this.enterRecoveryPhrase(recoveryPhrase);
        await this.clickContinue();
        await this.enterPassword(password);
        await this.clickContinue();
        await this.clickAgree();
        
        console.log('✅ Onboarding completed successfully\n');
        return recoveryPhrase;
    }
}

module.exports = new OnboardingPage();