const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Logger Utility - Winston-based logging framework
 * 
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Console output with colors
 * - File output with timestamps
 * - Error log file created only when errors occur
 * - Timestamped log files
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Generate timestamp for log file name
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const logFileName = `test-${timestamp}.log`;
const errorLogFileName = `error-${timestamp}.log`;

/**
 * Custom format for console output with emojis and colors
 */
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
        // Add emoji based on log level
        let emoji = '';
        if (level.includes('error')) emoji = '❌';
        else if (level.includes('warn')) emoji = '⚠️';
        else if (level.includes('info')) emoji = 'ℹ️';
        else if (level.includes('debug')) emoji = '🔍';
        
        return `${emoji} [${timestamp}] ${level}: ${message}`;
    })
);

/**
 * Custom format for file output (no colors, more detailed)
 */
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.uncolorize(),
    winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

/**
 * Create Winston logger instance with lazy error file transport
 */
let errorTransport = null;
let hasErrors = false;

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default to 'info', can be overridden
    transports: [
        // Console transport - colored output for terminal
        new winston.transports.Console({
            format: consoleFormat
        }),
        
        // File transport - all logs
        new winston.transports.File({
            filename: path.join(logsDir, logFileName),
            format: fileFormat,
            level: 'debug' // Log everything to file
        })
        
        // Note: Error file transport is added lazily when first error is logged
    ]
});

/**
 * Add error file transport on first error
 */
function ensureErrorTransport() {
    if (!errorTransport && !hasErrors) {
        hasErrors = true;
        errorTransport = new winston.transports.File({
            filename: path.join(logsDir, errorLogFileName),
            format: fileFormat,
            level: 'error'
        });
        logger.add(errorTransport);
    }
}

/**
 * Custom logging methods with consistent formatting
 */
class Logger {
    /**
     * Log test start
     * @param {string} testName - Name of the test
     */
    testStart(testName) {
        logger.info('═'.repeat(70));
        logger.info(`🚀 TEST STARTED: ${testName}`);
        logger.info('═'.repeat(70));
    }

    /**
     * Log test completion
     * @param {string} testName - Name of the test
     * @param {boolean} passed - Whether test passed
     */
    testEnd(testName, passed = true) {
        logger.info('═'.repeat(70));
        if (passed) {
            logger.info(`✅ TEST PASSED: ${testName}`);
        } else {
            ensureErrorTransport(); // Create error log only when test fails
            logger.error(`❌ TEST FAILED: ${testName}`);
        }
        logger.info('═'.repeat(70));
    }

    /**
     * Log step completion
     * @param {string} message - Step description
     */
    step(message) {
        logger.info(`✓ ${message}`);
    }

    /**
     * Log section start
     * @param {string} message - Section description
     */
    section(message) {
        logger.info(`\n📍 ${message}`);
    }

    /**
     * Log action being performed
     * @param {string} message - Action description
     */
    action(message) {
        logger.debug(`🔧 ACTION: ${message}`);
    }

    /**
     * Log verification/assertion
     * @param {string} message - Verification description
     */
    verify(message) {
        logger.info(`✔ VERIFY: ${message}`);
    }

    /**
     * Log warning
     * @param {string} message - Warning message
     */
    warn(message) {
        logger.warn(message);
    }

    /**
     * Log error
     * @param {string} message - Error message
     * @param {Error} error - Error object (optional)
     */
    error(message, error = null) {
        ensureErrorTransport(); // Create error log file when error is logged
        if (error) {
            logger.error(`${message}\nError: ${error.message}\nStack: ${error.stack}`);
        } else {
            logger.error(message);
        }
    }

    /**
     * Log debug information
     * @param {string} message - Debug message
     * @param {object} data - Additional data to log (optional)
     */
    debug(message, data = null) {
        if (data) {
            logger.debug(`${message}\nData: ${JSON.stringify(data, null, 2)}`);
        } else {
            logger.debug(message);
        }
    }

    /**
     * Log API request
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     */
    apiRequest(method, url) {
        logger.info(`📡 API ${method}: ${url}`);
    }

    /**
     * Log API response
     * @param {number} status - Response status code
     * @param {string} message - Additional message
     */
    apiResponse(status, message = '') {
        if (status >= 200 && status < 300) {
            logger.info(`📥 Response: ${status} OK ${message}`);
        } else {
            logger.warn(`📥 Response: ${status} ${message}`);
        }
    }

    /**
     * Log data summary
     * @param {string} title - Summary title
     * @param {object} data - Data to summarize
     */
    summary(title, data) {
        logger.info(`\n📊 ${title}`);
        Object.entries(data).forEach(([key, value]) => {
            logger.info(`   - ${key}: ${value}`);
        });
    }

    /**
     * Log generic info message
     * @param {string} message - Info message
     */
    info(message) {
        logger.info(message);
    }
}

// Export singleton instance
module.exports = new Logger();