# VIBE CODING APP - Local Word to PDF

A local-only, free Word to PDF converter with a premium UI.

## Features
- **Local Conversion**: Uses Python (Flask) + Mammoth + xhtml2pdf. No external APIs.
- **Privacy First**: Files stay on your machine.
- **Premium UI**: Glassmorphism design with drag-and-drop.

## Prerequisites
- Python 3.x
- `pip`

## Quick Start
1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the App**:
    ```bash
    python app.py
    ```

3.  **Use**:
    Open [http://localhost:5000](http://localhost:5000) in your browser.

## Tech Stack
- **Backend**: Python (Flask)
- **Conversion**: `mammoth` (DOCX → HTML), `xhtml2pdf` (HTML → PDF)
- **Frontend**: HTML5, CSS3, Vanilla JS
