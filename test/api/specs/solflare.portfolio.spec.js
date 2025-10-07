const logger = require('../../../utils/logger');
const SolflareApiClient = require('../clients/SolflareApiClient');
const PortfolioValidator = require('../helpers/PortfolioValidator');

/**
 * Solflare Portfolio API Tests
 * 
 * Test suite for validating Solflare wallet API endpoints including:
 * - Portfolio token values and calculations
 * - Balance aggregations across multiple wallets
 * - Net worth calculations
 */
describe('Solflare Portfolio API Tests', () => {
    const ADDRESSES = [
        '96Y3j66AX16noUAAVriW8bmwTGzV1PVqBKCEArPd5fuU',
        '7eXxD3vQww9cgBgD3gb7iqTriAzAmCBXFBMpdDi71P3i'
    ];

    let api, validator;

    before(() => {
        api = new SolflareApiClient();
        validator = new PortfolioValidator(0.01);
    });

    /**
     * Test Scenario 1: Total Portfolio Value Validation
     * 
     * Objective: Verify that the total portfolio value is correct
     * 
     * Expected Results:
     * - Calculated token total matches API total value
     * - Total value equals sum of tokensValue + stocksValue
     * - All values within $0.01 tolerance
     */
    describe('Scenario 1: Portfolio value validation', () => {
        ADDRESSES.forEach((address) => {
            it(`validates portfolio for ${address.substring(0, 8)}...`, async () => {
                const testName = `Portfolio Validation - ${address.substring(0, 8)}...`;
                logger.testStart(testName);

                try {
                    // Fetch portfolio data
                    logger.section('📊 Fetching Portfolio Data');
                    const portfolio = await api.getPortfolio(address, 'mainnet');
                    const { tokens, value, tokensValue, stocksValue } = portfolio;

                    logger.apiResponse(200, 'Portfolio data retrieved');

                    // Log portfolio summary
                    validator.logSummary('Portfolio Summary', {
                        'Total Value': value.total,
                        'Tokens Value': tokensValue.total,
                        'Stocks Value': stocksValue.total,
                        'Token Count': tokens.length
                    });

                    // Validation 1: Calculated total matches API total
                    logger.section('✓ Validation 1: Calculated vs API Total');
                    const calculated = PortfolioValidator.tokenValue(tokens);
                    validator.assertMatch(calculated, value.total, 'Calculated Total');

                    // Validation 2: Total equals tokensValue + stocksValue
                    logger.section('✓ Validation 2: Total vs Combined (Tokens + Stocks)');
                    const combined = tokensValue.total + stocksValue.total;
                    validator.assertMatch(value.total, combined, 'Combined Total');

                    logger.testEnd(testName, true);
                } catch (error) {
                    logger.error('Portfolio validation failed', error);
                    logger.testEnd(testName, false);
                    throw error;
                }
            });
        });
    });

    /**
     * Test Scenario 2: Balances Endpoint Validation
     * 
     * Objective: Verify that the net worth is correct across multiple wallets
     * 
     * Expected Results:
     * - Net worth equals sum of individual portfolio values
     * - Net worth equals sum of wallet data values
     * - All calculations within $0.01 tolerance
     */
    describe('Scenario 2: Net worth validation', () => {
        it('validates net worth across multiple wallets', async () => {
            const testName = 'Net Worth Validation - Multiple Wallets';
            logger.testStart(testName);

            try {
                // Step 1: Fetch all portfolios
                logger.section('📊 Fetching Portfolio Data for All Wallets');
                const portfolios = await api.getMultiplePortfolios(ADDRESSES, 'mainnet');
                
                portfolios.forEach((p, i) => {
                    logger.info(`   💼 Wallet ${i + 1}: $${p.value.total.toFixed(2)}`);
                });

                // Calculate expected net worth
                const expectedNetWorth = PortfolioValidator.sum(portfolios, p => p.value.total);
                logger.info(`   💰 Expected Net Worth: $${expectedNetWorth.toFixed(2)}`);

                // Step 2: Fetch aggregated balances
                logger.section('📦 Fetching Balances Endpoint');
                const balances = await api.getBalances(ADDRESSES, 'usd', 'mainnet');
                const { netWorth, data } = balances;

                logger.apiResponse(200, 'Balances retrieved');

                // Log balances summary
                validator.logSummary('Balances Response', {
                    'Net Worth': netWorth,
                    'Wallets': data?.length || 0
                });

                // Validation 1: Net worth equals sum of portfolios
                logger.section('✓ Validation 1: Net Worth vs Sum of Portfolios');
                validator.assertMatch(netWorth, expectedNetWorth, 'Net Worth');

                // Validation 2: Net worth equals sum of data values
                logger.section('✓ Validation 2: Net Worth vs Sum of Data Values');
                const dataSum = PortfolioValidator.sum(data || [], w => w.value || 0);
                validator.assertMatch(netWorth, dataSum, 'Data Sum');

                logger.testEnd(testName, true);
            } catch (error) {
                logger.error('Net worth validation failed', error);
                logger.testEnd(testName, false);
                throw error;
            }
        });
    });
});