const axios = require('axios');
const { expect } = require('chai');
const crypto = require('crypto');

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
    
    /**
     * Tolerance for floating-point comparison
     * Floating-point arithmetic can introduce small rounding errors
     * (e.g., 0.1 + 0.2 !== 0.3 in JavaScript)
     */
    const TOLERANCE = 0.01;

    /**
     * Generate a unique UUID v4 for Authorization header
     * @returns {string} UUID v4 string
     */
    function generateUUID() {
        return crypto.randomUUID();
    }

    /**
     * Helper function to calculate total value from token array
     * @param {Array} tokens - Array of token objects
     * @returns {number} Total value of all tokens
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
     * @param {Array} data - Array of wallet objects
     * @returns {number} Sum of all wallet values
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
     * 
     * Validates that:
     * 1. Calculated token total matches API-provided total
     * 2. Total value equals sum of tokensValue and stocksValue
     */
    describe('Test Scenario 1: Total portfolio value validation', () => {
        ADDRESSES.forEach((address) => {
            it(`should validate total portfolio value for ${address}`, async () => {
                console.log(`\n🔍 Testing portfolio value for: ${address}`);

                // Make API request to get portfolio tokens
                const response = await axios.get(
                    `${BASE_URL}/v3/portfolio/tokens/${address}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${generateUUID()}`
                        },
                        params: {
                            network: 'mainnet'
                        }
                    }
                );

                // Verify response status
                expect(response.status).to.equal(200);
                console.log('✓ API request successful (200 OK)');

                // Extract data from response
                const { tokens, value, tokensValue, stocksValue } = response.data;

                console.log(`📊 Portfolio Summary:`);
                console.log(`   - Total Value: $${value.total.toFixed(2)}`);
                console.log(`   - Tokens Value: $${tokensValue.total.toFixed(2)}`);
                console.log(`   - Stocks Value: $${stocksValue.total.toFixed(2)}`);
                console.log(`   - Number of tokens: ${tokens.length}`);

                /**
                 * Validation 1: Calculated total matches API total
                 * Calculate token values manually and compare with API's total
                 */
                const calculatedTotal = calculateTokenTotal(tokens);
                const difference1 = Math.abs(calculatedTotal - value.total);
                
                console.log(`\n✓ Validation 1: Calculated vs API Total`);
                console.log(`   - Calculated: $${calculatedTotal.toFixed(2)}`);
                console.log(`   - API Total: $${value.total.toFixed(2)}`);
                console.log(`   - Difference: $${difference1.toFixed(4)}`);
                
                expect(difference1).to.be.lessThan(
                    TOLERANCE,
                    `Calculated total (${calculatedTotal}) should match API total (${value.total}) within tolerance`
                );
                console.log(`   ✅ Values match within tolerance ($${TOLERANCE})`);

                /**
                 * Validation 2: Total equals tokensValue + stocksValue
                 * Verify that the breakdown adds up correctly
                 */
                const combinedTotal = tokensValue.total + stocksValue.total;
                const difference2 = Math.abs(value.total - combinedTotal);
                
                console.log(`\n✓ Validation 2: Total vs Combined (Tokens + Stocks)`);
                console.log(`   - Total Value: $${value.total.toFixed(2)}`);
                console.log(`   - Combined (Tokens + Stocks): $${combinedTotal.toFixed(2)}`);
                console.log(`   - Difference: $${difference2.toFixed(4)}`);
                
                expect(difference2).to.be.lessThan(
                    TOLERANCE,
                    `Total (${value.total}) should equal tokensValue + stocksValue (${combinedTotal}) within tolerance`
                );
                console.log(`   ✅ Values match within tolerance ($${TOLERANCE})`);

                console.log(`\n✅ All validations passed for ${address}\n`);
            });
        });
    });

    /**
     * Test Scenario 2: Balances Endpoint Validation
     * 
     * Validates that:
     * 1. NetWorth equals sum of individual portfolio values
     * 2. NetWorth equals sum of wallet values in data array
     */
    describe('Test Scenario 2: Balances endpoint validation', () => {
        it('should verify that the net worth is correct', async () => {
            console.log(`\n🔍 Testing balances endpoint with ${ADDRESSES.length} wallets`);
            
            const authToken = generateUUID();
            const headers = { 'Authorization': `Bearer ${authToken}` };

            console.log('📥 Fetching portfolio data for wallet 1...');
            
            /**
             * Step 1: Get portfolio value for first address
             */
            const response1 = await axios.get(
                `${BASE_URL}/v3/portfolio/tokens/${ADDRESSES[0]}`,
                {
                    headers,
                    params: { network: 'mainnet' }
                }
            );
            expect(response1.status).to.equal(200);
            const wallet1Value = response1.data.value.total;
            console.log(`✓ Wallet 1 value: $${wallet1Value.toFixed(2)}`);

            console.log('📥 Fetching portfolio data for wallet 2...');
            
            /**
             * Step 2: Get portfolio value for second address
             */
            const response2 = await axios.get(
                `${BASE_URL}/v3/portfolio/tokens/${ADDRESSES[1]}`,
                {
                    headers,
                    params: { network: 'mainnet' }
                }
            );
            expect(response2.status).to.equal(200);
            const wallet2Value = response2.data.value.total;
            console.log(`✓ Wallet 2 value: $${wallet2Value.toFixed(2)}`);

            /**
             * Calculate expected net worth from individual portfolios
             */
            const expectedNetWorth = wallet1Value + wallet2Value;
            console.log(`\n💰 Expected Net Worth: $${expectedNetWorth.toFixed(2)}`);

            console.log('\n📥 Fetching balances endpoint...');
            
            /**
             * Step 3: Get aggregated balances for both addresses
             * Note: Addresses are prefixed with '1' as per API requirement
             */
            const response3 = await axios.post(
                `${BASE_URL}/v2/portfolio/balances`,
                {
                    // Array of addresses concatenated with the prefix '1'
                    pubkeys: ADDRESSES.map(addr => `1${addr}`),
                    currency: 'usd',
                    general: true,
                    network: 'mainnet'
                },
                { headers }
            );

            // Verify response status
            expect(response3.status).to.equal(200);
            console.log('✓ Balances API request successful (200 OK)');

            const { netWorth, data } = response3.data;
            console.log(`\n📊 Balances Response:`);
            console.log(`   - Net Worth: $${netWorth.toFixed(2)}`);
            console.log(`   - Number of wallets: ${data?.length || 0}`);

            /**
             * Validation 1: NetWorth equals sum of portfolio values
             */
            const difference1 = Math.abs(netWorth - expectedNetWorth);
            
            console.log(`\n✓ Validation 1: Net Worth vs Sum of Portfolios`);
            console.log(`   - Net Worth: $${netWorth.toFixed(2)}`);
            console.log(`   - Expected (Sum): $${expectedNetWorth.toFixed(2)}`);
            console.log(`   - Difference: $${difference1.toFixed(4)}`);
            
            expect(difference1).to.be.lessThan(
                TOLERANCE,
                `NetWorth (${netWorth}) should equal sum of portfolio values (${expectedNetWorth}) within tolerance`
            );
            console.log(`   ✅ Values match within tolerance ($${TOLERANCE})`);

            /**
             * Validation 2: NetWorth equals sum of data values
             */
            const walletSum = calculateWalletSum(data);
            const difference2 = Math.abs(netWorth - walletSum);
            
            console.log(`\n✓ Validation 2: Net Worth vs Sum of Data Values`);
            console.log(`   - Net Worth: $${netWorth.toFixed(2)}`);
            console.log(`   - Data Sum: $${walletSum.toFixed(2)}`);
            console.log(`   - Difference: $${difference2.toFixed(4)}`);
            
            expect(difference2).to.be.lessThan(
                TOLERANCE,
                `NetWorth (${netWorth}) should equal sum of data values (${walletSum}) within tolerance`
            );
            console.log(`   ✅ Values match within tolerance ($${TOLERANCE})`);

            console.log(`\n✅ All balances validations passed!\n`);
        });
    });
});