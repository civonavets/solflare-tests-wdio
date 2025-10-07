const { expect } = require('chai');
const logger = require('../../../utils/logger');

/**
 * Portfolio Validator - Simplified with fluent assertions
 */
class PortfolioValidator {
    constructor(tolerance = 0.01) {
        this.tolerance = tolerance;
    }

    // Quick calculations
    static sum(items, getValue) {
        return items.reduce((total, item) => total + getValue(item), 0);
    }

    static tokenValue(tokens) {
        return this.sum(tokens, t => (t.totalUiAmount || 0) * (t.price?.usdPrice || 0));
    }

    // Fluent assertion API
    assertMatch(actual, expected, label) {
        const diff = Math.abs(actual - expected);
        
        logger.info(`   - ${label}: $${actual.toFixed(2)} vs $${expected.toFixed(2)}`);
        logger.info(`   - Difference: $${diff.toFixed(4)}`);
        
        expect(diff).to.be.lessThan(this.tolerance);
        logger.verify(`✓ Match within tolerance ($${this.tolerance})`);
        
        return this;
    }

    logSummary(title, data) {
        logger.summary(title, 
            Object.entries(data).reduce((acc, [key, val]) => {
                acc[key] = typeof val === 'number' ? `$${val.toFixed(2)}` : val;
                return acc;
            }, {})
        );
        return this;
    }
}

module.exports = PortfolioValidator;