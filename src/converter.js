const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { findLibreOffice } = require('./utils');

class OfficeConverter {
    constructor(options = {}) {
        this.binaryPath = options.binaryPath || findLibreOffice();
        if (!this.binaryPath) {
            throw new Error('LibreOffice binary not found. Please install LibreOffice or set LIBREOFFICE_PATH.');
        }
    }

    /**
     * Converts a file to the specified format.
     * @param {string} inputPath - Path to the input file.
     * @param {string} outDir - Directory to save the output file.
     * @param {string} format - Target format (e.g., 'pdf', 'docx').
     * @returns {Promise<string>} - Path to the converted file.
     */
    async convert(inputPath, outDir, format) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(inputPath)) {
                return reject(new Error(`Input file not found: ${inputPath}`));
            }

            // Ensure output directory exists
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const args = [
                '--headless',
                '--convert-to', format,
                '--outdir', outDir,
                inputPath
            ];

            const process = spawn(this.binaryPath, args);

            let stderrData = '';

            process.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Conversion failed with code ${code}: ${stderrData}`));
                }

                // Construct expected output path
                const inputName = path.parse(inputPath).name;
                const outputPath = path.join(outDir, `${inputName}.${format}`);

                resolve(outputPath);
            });

            process.on('error', (err) => {
                reject(err);
            });
        });
    }

    async wordToPdf(inputPath, outDir) {
        return this.convert(inputPath, outDir, 'pdf');
    }

    async pdfToWord(inputPath, outDir) {
        // LibreOffice determines filter automatically, but specifying can sometimes help.
        // For PDF to Word, it's typically import, but standard convert-to docx works.
        return this.convert(inputPath, outDir, 'docx');
    }
}

module.exports = OfficeConverter;
