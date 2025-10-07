const OnboardingPage = require('../pageobjects/OnboardingPage');
const WalletManagementPage = require('../pageobjects/WalletManagementPage');
const logger = require('../../utils/logger');

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
        toggleGeneratedWallets: ['Wallet 2', 'Wallet 3']
    };

    /**
     * Before each test: Navigate to onboarding page
     */
    beforeEach(async () => {
        logger.debug('Test setup: Navigating to onboarding page');
        await OnboardingPage.visit();
    });

    /**
     * Test Case: Verify that the recovery phrase list contains the original wallet and the newly added wallets
     */
    it('Verify that the recovery phrase list contains the original wallet and the newly added wallets', async () => {
        const testName = 'Wallet Management - Recovery Phrase Validation';
        logger.testStart(testName);
        
        try {
            // Step 1-10: Complete onboarding process
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
            
            logger.debug('Expected wallets', { wallets: expectedWallets });
            await WalletManagementPage.verifyWalletsInList(expectedWallets);
            
            logger.testEnd(testName, true);
        } catch (error) {
            logger.error('Test failed with error', error);
            logger.testEnd(testName, false);
            throw error;
        }
    });
});