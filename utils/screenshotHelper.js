const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Screenshot Helper - Generic screenshot creation module
 * 
 * Features:
 * - Automatic directory creation
 * - Timestamped screenshots
 * - Failure screenshots
 * - Custom screenshot capture at any point
 */
class ScreenshotHelper {
    constructor() {
        this.screenshotsDir = path.join(process.cwd(), 'screenshots');
        this.ensureDirectory();
    }

    /**
     * Ensure screenshots directory exists
     */
    ensureDirectory() {
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
            logger.debug(`Created screenshots directory: ${this.screenshotsDir}`);
        }
    }

    /**
     * Generate timestamp string for filename
     * @returns {string} Timestamp in format YYYY-MM-DD_HH-mm-ss
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '')
            .replace('T', '_');
    }

    /**
     * Sanitize filename by removing invalid characters
     * @param {string} name - Original filename
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(name) {
        return name
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .substring(0, 100);
    }

    /**
     * Take screenshot on test failure
     * @param {string} testName - Name of the failed test
     * @returns {Promise<string>} Path to saved screenshot
     */
    async captureFailure(testName) {
        const timestamp = this.getTimestamp();
        const sanitized = this.sanitizeFilename(testName);
        const filename = `${sanitized}_FAILED_${timestamp}.png`;
        const filepath = path.join(this.screenshotsDir, filename);

        try {
            await browser.saveScreenshot(filepath);
            logger.info(`📸 Failure screenshot: ${filename}`);
            return filepath;
        } catch (error) {
            logger.error('Failed to capture screenshot', error);
            throw error;
        }
    }

    /**
     * Take screenshot at any point in test
     * @param {string} stepName - Name/description of the step
     * @returns {Promise<string>} Path to saved screenshot
     */
    async capture(stepName) {
        const timestamp = this.getTimestamp();
        const sanitized = this.sanitizeFilename(stepName);
        const filename = `${sanitized}_${timestamp}.png`;
        const filepath = path.join(this.screenshotsDir, filename);

        try {
            await browser.saveScreenshot(filepath);
            logger.debug(`Screenshot captured: ${filename}`);
            return filepath;
        } catch (error) {
            logger.error('Failed to capture screenshot', error);
            throw error;
        }
    }

    /**
     * Take screenshot with custom filename
     * @param {string} filename - Custom filename (without extension)
     * @returns {Promise<string>} Path to saved screenshot
     */
    async captureWithName(filename) {
        const sanitized = this.sanitizeFilename(filename);
        const filepath = path.join(this.screenshotsDir, `${sanitized}.png`);

        try {
            await browser.saveScreenshot(filepath);
            logger.debug(`Screenshot saved: ${sanitized}.png`);
            return filepath;
        } catch (error) {
            logger.error('Failed to capture screenshot', error);
            throw error;
        }
    }

    /**
     * Take screenshot of specific element
     * @param {Element} element - WebdriverIO element
     * @param {string} name - Screenshot name
     * @returns {Promise<string>} Path to saved screenshot
     */
    async captureElement(element, name) {
        const timestamp = this.getTimestamp();
        const sanitized = this.sanitizeFilename(name);
        const filename = `${sanitized}_element_${timestamp}.png`;
        const filepath = path.join(this.screenshotsDir, filename);

        try {
            await element.saveScreenshot(filepath);
            logger.debug(`Element screenshot: ${filename}`);
            return filepath;
        } catch (error) {
            logger.error('Failed to capture element screenshot', error);
            throw error;
        }
    }

    /**
     * Get all screenshots in directory
     * @returns {string[]} Array of screenshot filenames
     */
    getScreenshots() {
        this.ensureDirectory();
        return fs.readdirSync(this.screenshotsDir)
            .filter(file => file.endsWith('.png'));
    }

    /**
     * Clear all screenshots from directory
     */
    clearScreenshots() {
        this.ensureDirectory();
        const files = this.getScreenshots();
        
        files.forEach(file => {
            fs.unlinkSync(path.join(this.screenshotsDir, file));
        });
        
        logger.info(`🗑️  Cleared ${files.length} screenshots`);
    }

    /**
     * Get screenshot count
     * @returns {number} Number of screenshots
     */
    getScreenshotCount() {
        return this.getScreenshots().length;
    }
}

// Export singleton instance
module.exports = new ScreenshotHelper();