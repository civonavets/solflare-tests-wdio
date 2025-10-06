const OnboardingPage = require('../pageobjects/OnboardingPage');
const WalletManagementPage = require('../pageobjects/WalletManagementPage');

/**
 * Test Suite: Wallet Management - Recovery Phrase
 * 
 * This test suite validates the complete wallet management flow including:
 * - Wallet creation and onboarding
 * - Adding new wallets
 * - Managing recovery phrase toggles
 * - Verifying wallet list contents
 */
describe('Wallet Management - Recovery Phrase', () => {
    // Test configuration
    const testConfig = {
        password: 'superSecurePasswordBecauseImLazy@!$#',
        newWalletName: 'Talimi Banana',
        mainWalletName: 'Main Wallet',
        // These wallets appear after selecting 3rd and 4th toggles in manage recovery phrase
        toggleGeneratedWallets: ['Wallet 2', 'Wallet 3']
    };

    /**
     * Before each test: Navigate to onboarding page
     */
    beforeEach(async () => {
        await OnboardingPage.visit();
    });

    /**
     * Test Case: Verify that the recovery phrase list contains the original wallet and the newly added wallets
     * 
     * Steps:
     * 1. Complete wallet onboarding (create new wallet, set password)
     * 2. Open wallet management
     * 3. Verify Main Wallet is displayed
     * 4. Add a new wallet with custom name
     * 5. Manage recovery phrase toggles (select 3rd and 4th)
     * 6. Verify all expected wallets are present in the list
     * 
     * Expected Result:
     * - Recovery phrase list contains: Main Wallet, newly added wallet, and toggle-generated wallets
     */
    it('Verify that the recovery phrase list contains the original wallet and the newly added wallets', async () => {
        // Step 1-10: Complete onboarding process
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🚀 TEST: Wallet Management - Recovery Phrase Validation');
        console.log('═══════════════════════════════════════════════════════');
        
        await OnboardingPage.completeOnboarding(testConfig.password);
        
        // Step 11: Open wallet management (click avatar in header)
        await WalletManagementPage.openWalletManagement();
        
        // Step 12: Verify Main Wallet is displayed
        await WalletManagementPage.verifyMainWallet();
        
        // Step 13-14: Add new wallet
        await WalletManagementPage.addNewWallet(testConfig.newWalletName);
        
        // Step 14-18: Manage recovery phrase toggles
        await WalletManagementPage.manageRecoveryPhraseToggles();
        
        // Expected Result: Verify all wallets are in the recovery phrase list
        const expectedWallets = [
            testConfig.mainWalletName,
            testConfig.newWalletName,
            ...testConfig.toggleGeneratedWallets
        ];
        
        await WalletManagementPage.verifyWalletsInList(expectedWallets);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ TEST COMPLETED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════════════════\n');
    });
});