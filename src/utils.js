const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Attempts to find the LibreOffice executable 'soffice'.
 * Checks environment variable LIBREOFFICE_PATH first, then common installation locations.
 * @returns {string|null} The path to soffice executable or null if not found.
 */
function findLibreOffice() {
    // 1. Check environment variable
    if (process.env.LIBREOFFICE_PATH) {
        if (fs.existsSync(process.env.LIBREOFFICE_PATH)) {
            return process.env.LIBREOFFICE_PATH;
        }
    }

    // 2. Platform specific checks
    const platform = os.platform();

    if (platform === 'win32') {
        const commonPaths = [
            'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
            // Add more specific version paths if necessary or generic glob equivalent in a real scenario
        ];

        for (const p of commonPaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
    } else if (platform === 'linux') {
        // Simple check for linux, usually in path, but here checking common locations just in case
        const commonPaths = [
            '/usr/bin/soffice',
            '/usr/local/bin/soffice',
            '/opt/libreoffice/program/soffice'
        ];

        for (const p of commonPaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
    }

    return null;
}

module.exports = { findLibreOffice };
