const axios = require('axios');
const { expect } = require('chai');
const crypto = require('crypto');
const logger = require('../../utils/logger');

/**
 * Solflare Portfolio API Tests
 * 
 * Test suite for validating Solflare wallet API endpoints including:
 * - Portfolio token values and calculations
 * - Balance aggregations across multiple wallets
 * - Net worth calculations
 */
describe('Solflare Portfolio API Tests', () => {
    // API configuration
    const BASE_URL = 'https://wallet-api.solflare.com';
    const ADDRESSES = [
        '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuU',
        '7eXxD3vQww9cgBgD3gb7iqTriAzAmCBXFBMpdDi71P3i'
    ];
    
    const TOLERANCE = 0.01;

    /**
     * Generate a unique UUID v4 for Authorization header
     */
    function generateUUID() {
        return crypto.randomUUID();
    }

    /**
     * Helper function to calculate total value from token array
     */
    function calculateTokenTotal(tokens) {
        let total = 0;
        for (const token of tokens) {
            const amount = token.totalUiAmount || 0;
            const price = token.price?.usdPrice || 0;
            total += amount * price;
        }
        return total;
    }

    /**
     * Helper function to sum wallet values from data array
     */
    function calculateWalletSum(data) {
        let sum = 0;
        for (const wallet of data || []) {
            sum += wallet.value || 0;
        }
        return sum;
    }

    /**
     * Test Scenario 1: Total Portfolio Value Validation
     */
    describe('Test Scenario 1: Total portfolio value validation', () => {
        ADDRESSES.forEach((address) => {
            it(`should validate total portfolio value for ${address}`, async () => {
                const testName = `Portfolio Validation - ${address.substring(0, 8)}...`;
                logger.testStart(testName);

                try {
                    // Make API request
                    const url = `${BASE_URL}/v3/portfolio/tokens/${address}`;
                    logger.apiRequest('GET', url);

                    const response = await axios.get(url, {
                        headers: {
                            'Authorization': `Bearer ${generateUUID()}`
                        },
                        params: {
                            network: 'mainnet'
                        }
                    });

                    // Verify response status
                    expect(response.status).to.equal(200);
                    logger.apiResponse(response.status, 'Portfolio data retrieved');

                    // Extract data
                    const { tokens, value, tokensValue, stocksValue } = response.data;

                    logger.summary('Portfolio Summary', {
                        'Total Value': `$${value.total.toFixed(2)}`,
                        'Tokens Value': `$${tokensValue.total.toFixed(2)}`,
                        'Stocks Value': `$${stocksValue.total.toFixed(2)}`,
                        'Number of tokens': tokens.length
                    });

                    /**
                     * Validation 1: Calculated total matches API total
                     */
                    logger.section('Validation 1: Calculated vs API Total');
                    const calculatedTotal = calculateTokenTotal(tokens);
                    const difference1 = Math.abs(calculatedTotal - value.total);
                    
                    logger.info(`   - Calculated: $${calculatedTotal.toFixed(2)}`);
                    logger.info(`   - API Total: $${value.total.toFixed(2)}`);
                    logger.info(`   - Difference: $${difference1.toFixed(4)}`);
                    
                    expect(difference1).to.be.lessThan(TOLERANCE);
                    logger.verify(`Values match within tolerance ($${TOLERANCE})`);

                    /**
                     * Validation 2: Total equals tokensValue + stocksValue
                     */
                    logger.section('Validation 2: Total vs Combined (Tokens + Stocks)');
                    const combinedTotal = tokensValue.total + stocksValue.total;
                    const difference2 = Math.abs(value.total - combinedTotal);
                    
                    logger.info(`   - Total Value: $${value.total.toFixed(2)}`);
                    logger.info(`   - Combined: $${combinedTotal.toFixed(2)}`);
                    logger.info(`   - Difference: $${difference2.toFixed(4)}`);
                    
                    expect(difference2).to.be.lessThan(TOLERANCE);
                    logger.verify(`Values match within tolerance ($${TOLERANCE})`);

                    logger.testEnd(testName, true);
                } catch (error) {
                    logger.error('Test failed with error', error);
                    logger.testEnd(testName, false);
                    throw error;
                }
            });
        });
    });

    /**
     * Test Scenario 2: Balances Endpoint Validation
     */
    describe('Test Scenario 2: Balances endpoint validation', () => {
        it('should verify that the net worth is correct', async () => {
            const testName = 'Net Worth Validation - Multiple Wallets';
            logger.testStart(testName);
            
            try {
                const authToken = generateUUID();
                const headers = { 'Authorization': `Bearer ${authToken}` };

                logger.section('Fetching portfolio data for wallet 1');
                
                /**
                 * Step 1: Get portfolio value for first address
                 */
                const url1 = `${BASE_URL}/v3/portfolio/tokens/${ADDRESSES[0]}`;
                logger.apiRequest('GET', url1);
                
                const response1 = await axios.get(url1, {
                    headers,
                    params: { network: 'mainnet' }
                });
                
                expect(response1.status).to.equal(200);
                const wallet1Value = response1.data.value.total;
                logger.apiResponse(response1.status, `Wallet 1 value: $${wallet1Value.toFixed(2)}`);

                logger.section('Fetching portfolio data for wallet 2');
                
                /**
                 * Step 2: Get portfolio value for second address
                 */
                const url2 = `${BASE_URL}/v3/portfolio/tokens/${ADDRESSES[1]}`;
                logger.apiRequest('GET', url2);
                
                const response2 = await axios.get(url2, {
                    headers,
                    params: { network: 'mainnet' }
                });
                
                expect(response2.status).to.equal(200);
                const wallet2Value = response2.data.value.total;
                logger.apiResponse(response2.status, `Wallet 2 value: $${wallet2Value.toFixed(2)}`);

                /**
                 * Calculate expected net worth
                 */
                const expectedNetWorth = wallet1Value + wallet2Value;
                logger.info(`💰 Expected Net Worth: $${expectedNetWorth.toFixed(2)}`);

                logger.section('Fetching balances endpoint');
                
                /**
                 * Step 3: Get aggregated balances
                 */
                const url3 = `${BASE_URL}/v2/portfolio/balances`;
                logger.apiRequest('POST', url3);
                
                const response3 = await axios.post(url3, {
                    pubkeys: ADDRESSES.map(addr => `1${addr}`),
                    currency: 'usd',
                    general: true,
                    network: 'mainnet'
                }, { headers });

                expect(response3.status).to.equal(200);
                logger.apiResponse(response3.status, 'Balances retrieved');

                const { netWorth, data } = response3.data;
                logger.summary('Balances Response', {
                    'Net Worth': `$${netWorth.toFixed(2)}`,
                    'Number of wallets': data?.length || 0
                });

                /**
                 * Validation 1: NetWorth equals sum of portfolio values
                 */
                logger.section('Validation 1: Net Worth vs Sum of Portfolios');
                const difference1 = Math.abs(netWorth - expectedNetWorth);
                
                logger.info(`   - Net Worth: $${netWorth.toFixed(2)}`);
                logger.info(`   - Expected: $${expectedNetWorth.toFixed(2)}`);
                logger.info(`   - Difference: $${difference1.toFixed(4)}`);
                
                expect(difference1).to.be.lessThan(TOLERANCE);
                logger.verify(`Values match within tolerance ($${TOLERANCE})`);

                /**
                 * Validation 2: NetWorth equals sum of data values
                 */
                logger.section('Validation 2: Net Worth vs Sum of Data Values');
                const walletSum = calculateWalletSum(data);
                const difference2 = Math.abs(netWorth - walletSum);
                
                logger.info(`   - Net Worth: $${netWorth.toFixed(2)}`);
                logger.info(`   - Data Sum: $${walletSum.toFixed(2)}`);
                logger.info(`   - Difference: $${difference2.toFixed(4)}`);
                
                expect(difference2).to.be.lessThan(TOLERANCE);
                logger.verify(`Values match within tolerance ($${TOLERANCE})`);

                logger.testEnd(testName, true);
            } catch (error) {
                logger.error('Test failed with error', error);
                logger.testEnd(testName, false);
                throw error;
            }
        });
    });
});