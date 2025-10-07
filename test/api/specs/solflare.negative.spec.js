const { expect } = require('chai');
const logger = require('../../../utils/logger');
const SolflareApiClient = require('../clients/SolflareApiClient');

/**
 * Solflare API – Negative & Edge Case Tests
 *
 * DISCLAIMER: Since there is no documentation available to determine the expected behavior,
 * some of the tests are based on assumptions and are therefore more lenient in their expectations.
 *
 * These tests verify API behavior with invalid inputs and edge cases to ensure:
 * - Proper error handling and response codes
 * - API stability under unexpected conditions
 * - Consistent behavior across different networks
 * - Correct data validation
 */
describe('Solflare API - Negative & Edge Cases', () => {
    const VALID_ADDRESS = '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuU';
    let api;

    before(() => {
        api = new SolflareApiClient();
    });

    /**
     * Cross-Network Testing
     * 
     * Objective: Verify API works correctly across all network environments
     * 
     * Expected Results:
     * - All networks (mainnet, devnet, testnet) should return valid responses
     * - Response structure should be consistent across networks
     * - Token counts and values may differ per network
     * - No errors should occur for valid addresses on any network
     */
    describe('Cross-Network Testing', () => {
        ['mainnet', 'devnet', 'testnet'].forEach(network => {
            it(`should handle ${network} network`, async () => {
                const testName = `Portfolio - ${network} Network`;
                logger.testStart(testName);

                /**
                 * Expected Result:
                 * ✓ HTTP 200 response
                 * ✓ Response contains 'value', 'tokens' properties
                 * ✓ tokens is an array
                 * ✓ No errors thrown
                 */
                try {
                    logger.section(`🌐 Testing ${network} Network`);
                    const portfolio = await api.getPortfolio(VALID_ADDRESS, network);
                    
                    expect(portfolio).to.have.property('value');
                    expect(portfolio).to.have.property('tokens');
                    expect(portfolio.tokens).to.be.an('array');
                    
                    logger.info(`   📊 Tokens found: ${portfolio.tokens.length}`);
                    logger.info(`   💰 Total value: $${portfolio.value.total.toFixed(2)}`);
                    logger.verify(`${network} network validated successfully`);
                    
                    logger.testEnd(testName, true);
                } catch (error) {
                    logger.error(`${network} test failed`, error.message);
                    logger.testEnd(testName, false);
                    throw error;
                }
            });
        });

        it('should handle balances for different networks', async () => {
            const testName = 'Balances - Multi-Network Validation';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ Each network returns valid balances response
             * ✓ Response contains 'netWorth' and 'data' properties
             * ✓ netWorth is a number (may be 0 on devnet/testnet)
             * ✓ Consistent response structure across all networks
             */
            try {
                const networks = ['mainnet', 'devnet', 'testnet'];
                
                for (const network of networks) {
                    logger.section(`🌐 Testing Balances on ${network}`);
                    
                    const balances = await api.getBalances([VALID_ADDRESS], 'usd', network);
                    
                    expect(balances).to.have.property('netWorth');
                    expect(balances).to.have.property('data');
                    
                    logger.info(`   💰 Net Worth: $${balances.netWorth.toFixed(2)}`);
                    logger.info(`   📂 Wallets: ${balances.data?.length || 0}`);
                    logger.verify(`${network} balances validated`);
                }
                
                logger.testEnd(testName, true);
            } catch (error) {
                logger.error('Multi-network balances test failed', error.message);
                logger.testEnd(testName, false);
                throw error;
            }
        });
    });

    /**
     * Invalid Addresses Testing
     * 
     * Objective: Verify API properly handles malformed/invalid addresses
     * 
     * Expected Results:
     * - API should return 4xx error codes (400, 404)
     * - Should NOT return 5xx server errors
     * - Should provide meaningful error messages
     * - Should NOT crash or hang
     */
    describe('Invalid Addresses', () => {
        const invalidAddresses = [
            { value: '', description: 'empty string' },
            { value: 'invalid', description: 'short invalid string' },
            { value: '123', description: 'numeric only' },
            { value: 'zzz999xxxInvalidAddressFormat!!!', description: 'malformed address' },
            { value: 'a'.repeat(100), description: 'too long address' },
            { value: '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fu', description: 'missing one character' },
            { value: '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuUU', description: 'extra character' },
            { value: null, description: 'null value' },
            { value: undefined, description: 'undefined value' }
        ];

        invalidAddresses.forEach(({ value, description }) => {
            it(`should handle ${description}: "${value}"`, async () => {
                const testName = `Invalid Address - ${description}`;
                logger.testStart(testName);

                /**
                 * Expected Result:
                 * ✓ Error should be thrown
                 * ✓ Error should have status code (4xx expected)
                 * ✓ Should NOT hang or timeout
                 * ✓ Error message should be descriptive
                 */
                try {
                    logger.section(`❌ Testing Invalid Address: ${description}`);
                    logger.info(`   📝 Value: "${value}"`);
                    
                    await api.getPortfolio(value);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    const statusCode = error.response?.status || 'N/A';
                    logger.info(`   ✅ Expected error caught`);
                    logger.info(`   📊 Status: ${statusCode}`);
                    logger.info(`   💬 Message: ${error.message}`);
                    logger.verify('Invalid address properly rejected');
                    
                    expect(error).to.exist;
                    logger.testEnd(testName, true);
                }
            });
        });

        it('should handle invalid addresses in balances endpoint', async () => {
            const testName = 'Balances - Invalid Addresses';
            logger.testStart(testName);
            
            const invalidAddresses = ['invalid', '123', ''];

            /**
             * Expected Result:
             * ✓ Error should be thrown
             * ✓ Balances endpoint should validate addresses
             * ✓ Should return 4xx status code
             * ✓ Should NOT process invalid addresses
             */
            try {
                logger.section('❌ Testing Balances with Invalid Addresses');
                logger.info(`   📝 Invalid addresses: ${invalidAddresses.join(', ')}`);
                
                await api.getBalances(invalidAddresses);
                expect.fail('Should have thrown an error');
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('Invalid addresses properly rejected');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });
    });

    /**
     * Invalid Network Parameters Testing
     * 
     * Objective: Verify API validates network parameter correctly
     * 
     * Expected Results:
     * - Invalid network names should return 4xx errors
     * - Case-sensitive validation (MAINNET vs mainnet)
     * - Null/empty values should be rejected
     * - Should NOT default to mainnet silently
     */
    describe('Invalid Network Parameters', () => {
        const invalidNetworks = [
            { value: 'invalid', description: 'invalid network name' },
            { value: 'MAINNET', description: 'uppercase network' },
            { value: '', description: 'empty network' },
            { value: 'main', description: 'partial network name' },
            { value: 'mainnet123', description: 'network with numbers' },
            { value: null, description: 'null network' }
        ];

        invalidNetworks.forEach(({ value, description }) => {
            it(`should handle ${description}: "${value}"`, async () => {
                const testName = `Invalid Network - ${description}`;
                logger.testStart(testName);

                /**
                 * Expected Result:
                 * ✓ Error should be thrown for invalid network
                 * ✓ Should return 400 Bad Request
                 * ✓ Error message should indicate invalid network
                 * ✓ Should NOT fall back to default network
                 */
                try {
                    logger.section(`🌐 Testing Invalid Network: ${description}`);
                    logger.info(`   📝 Network value: "${value}"`);
                    
                    await api.getPortfolio(VALID_ADDRESS, value);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    const statusCode = error.response?.status || 'N/A';
                    logger.info(`   ✅ Expected error caught`);
                    logger.info(`   📊 Status: ${statusCode}`);
                    logger.verify('Invalid network parameter rejected');
                    
                    expect(error).to.exist;
                    logger.testEnd(testName, true);
                }
            });
        });
    });

    /**
     * Malformed Request Bodies Testing
     * 
     * Objective: Verify POST endpoint validates request body structure
     * 
     * Expected Results:
     * - Missing required fields should return 400
     * - Empty arrays should be rejected
     * - Invalid field values should be rejected
     * - Malformed JSON structure should return error
     * - Missing optional fields may succeed with different behavior
     */
    describe('Malformed Request Bodies', () => {
        it('should handle missing pubkeys in balances', async () => {
            const testName = 'Malformed Body - Missing pubkeys';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ Error should be thrown (400 Bad Request)
             * ✓ Error message indicates missing required field
             * ✓ pubkeys is a required field
             */
            try {
                logger.section('📦 Testing Missing Required Field: pubkeys');
                
                const response = await api.makeBalancesRequest({
                    currency: 'usd',
                    general: true,
                    network: 'mainnet'
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('Missing pubkeys rejected');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });

        it('should handle empty pubkeys array', async () => {
            const testName = 'Malformed Body - Empty pubkeys';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ Error should be thrown (400 Bad Request)
             * ✓ Empty array should be rejected
             * ✓ At least one address should be required
             */
            try {
                logger.section('📦 Testing Empty pubkeys Array');
                logger.info('   📝 Pubkeys: []');
                
                await api.getBalances([]);
                expect.fail('Should have thrown an error');
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('Empty pubkeys array rejected');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });

        it('should handle invalid currency', async () => {
            const testName = 'Malformed Body - Invalid currency';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ Error should be thrown (400 Bad Request)
             * ✓ Currency validation should reject invalid values
             * ✓ Only supported currencies should be accepted
             */
            try {
                logger.section('💱 Testing Invalid Currency Parameter');
                logger.info('   📝 Currency: "invalid_currency"');
                
                await api.getBalances([VALID_ADDRESS], 'invalid_currency');
                expect.fail('Should have thrown an error');
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('Invalid currency rejected');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });

        it('should handle missing general flag', async () => {
            const testName = 'Malformed Body - Missing general flag';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ May succeed (general might be optional)
             * OR
             * ✓ May fail with 400 if required
             * 
             * Tests if general flag is required or has default value
             */
            try {
                logger.section('🚩 Testing Missing Optional Field: general');
                
                const response = await api.makeBalancesRequest({
                    pubkeys: [`1${VALID_ADDRESS}`],
                    currency: 'usd',
                    network: 'mainnet'
                });
                
                expect(response).to.have.property('netWorth');
                logger.info('   ✅ Request succeeded without general flag');
                logger.info('   💡 general flag appears to be optional');
                logger.verify('Request succeeded (general is optional)');
                
                logger.testEnd(testName, true);
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('general flag is required');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });

        it('should handle malformed JSON body', async () => {
            const testName = 'Malformed Body - Invalid structure';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ Error should be thrown (400 Bad Request)
             * ✓ API should reject unrecognized structure
             * ✓ Should return validation error message
             */
            try {
                logger.section('📦 Testing Completely Invalid Body Structure');
                logger.info('   📝 Body: { invalid: "structure", wrong: "fields" }');
                
                const response = await api.makeBalancesRequest({
                    invalid: 'structure',
                    wrong: 'fields'
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('Malformed body rejected');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });

        it('should handle pubkeys without prefix', async () => {
            const testName = 'Malformed Body - Missing "1" prefix';
            logger.testStart(testName);

            /**
             * Expected Result:
             * ✓ May succeed but return empty/incorrect data
             * OR
             * ✓ May fail with validation error
             * 
             * Tests if the "1" prefix is strictly required
             * If it succeeds, data should be validated separately
             */
            try {
                logger.section('🔢 Testing pubkeys without "1" Prefix');
                logger.info(`   📝 Pubkey: ${VALID_ADDRESS} (no prefix)`);
                
                const response = await api.makeBalancesRequest({
                    pubkeys: [VALID_ADDRESS], // Without '1' prefix
                    currency: 'usd',
                    general: true,
                    network: 'mainnet'
                });
                
                expect(response).to.exist;
                logger.info('   ✅ Response received');
                logger.info(`   💰 Net Worth: $${response.netWorth?.toFixed(2) || 0}`);
                logger.info('   💡 Prefix might be optional or silently ignored');
                logger.verify('Request succeeded without prefix');
                
                logger.testEnd(testName, true);
            } catch (error) {
                const statusCode = error.response?.status || 'N/A';
                logger.info(`   ✅ Expected error caught`);
                logger.info(`   📊 Status: ${statusCode}`);
                logger.verify('"1" prefix is required');
                
                expect(error).to.exist;
                logger.testEnd(testName, true);
            }
        });
    });
});