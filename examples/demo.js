const OfficeConverter = require('../src/converter');
const path = require('path');
const fs = require('fs');

async function runDemo() {
    try {
        console.log('Initializing Converter...');
        // You can explicitly pass binaryPath if detection fails
        // const converter = new OfficeConverter({ binaryPath: 'C:\\Path\\To\\soffice.exe' });
        const converter = new OfficeConverter();
        console.log(`Using LibreOffice at: ${converter.binaryPath}`);

        const inputDir = path.join(__dirname, 'files');
        const outputDir = path.join(__dirname, 'output');

        // Ensure input dir exists for demo purposes
        if (!fs.existsSync(inputDir)) {
            fs.mkdirSync(inputDir, { recursive: true });
            console.log(`Created input dir: ${inputDir}. Please place files there to test.`);
            // Create a dummy text file to test if no real word doc exists? 
            // LibreOffice might complain if it's just a text file renamed to docx, 
            // but let's try creating a simple text file for basics if we had one.
            // For now, we will rely on user providing or just dry running if empty.
        }

        // Example flow check
        // 1. Check for 'test.docx'
        const docxPath = path.join(inputDir, 'test.docx');
        if (fs.existsSync(docxPath)) {
            console.log(`Converting ${docxPath} to PDF...`);
            const pdfPath = await converter.wordToPdf(docxPath, outputDir);
            console.log(`Success! PDF saved to: ${pdfPath}`);

            console.log(`Converting ${pdfPath} back to Word...`);
            const backToWordPath = await converter.pdfToWord(pdfPath, outputDir);
            console.log(`Success! Word doc saved to: ${backToWordPath}`);
        } else {
            console.log(`No 'test.docx' found in ${inputDir}. Skipping specific file test.`);
        }

    } catch (err) {
        console.error('Conversion process failed:', err);
    }
}

runDemo();
