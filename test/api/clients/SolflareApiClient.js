const axios = require('axios');
const crypto = require('crypto');

/**
 * Solflare API Client - Simplified Service Object
 */
class SolflareApiClient {
    constructor(baseUrl = 'https://wallet-api.solflare.com') {
        this.baseUrl = baseUrl;
        this.authToken = crypto.randomUUID();
    }

    get headers() {
        return { 'Authorization': `Bearer ${this.authToken}` };
    }

    async getPortfolio(address) {
        const { data } = await axios.get(
            `${this.baseUrl}/v3/portfolio/tokens/${address}`,
            { headers: this.headers, params: { network: 'mainnet' } }
        );
        return data;
    }

    async getBalances(addresses) {
        const { data } = await axios.post(
            `${this.baseUrl}/v2/portfolio/balances`,
            {
                pubkeys: addresses.map(addr => `1${addr}`),
                currency: 'usd',
                general: true,
                network: 'mainnet'
            },
            { headers: this.headers }
        );
        return data;
    }

    async getMultiplePortfolios(addresses) {
        return await Promise.all(addresses.map(addr => this.getPortfolio(addr)));
    }
}

module.exports = SolflareApiClient;