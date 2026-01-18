import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import mammoth
from xhtml2pdf import pisa
from io import BytesIO
from werkzeug.utils import secure_filename
from urllib.parse import quote

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return app.send_static_file('index.html')

def convert_html_to_pdf(source_html, output_filename):
    with open(output_filename, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(
            source_html,
            dest=result_file)
    return pisa_status.err

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.docx'):
        original_filename = file.filename
        # Sanitize filename
        filename = secure_filename(original_filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Convert DOCX to HTML using Mammoth
        try:
            with open(file_path, "rb") as docx_file:
                result = mammoth.convert_to_html(docx_file)
                html = result.value
                messages = result.messages # Warnings
                
            # Basic styling for PDF
            styled_html = f"""
            <html>
            <head>
            <style>
                body {{ font-family: sans-serif; padding: 20px; }}
                p {{ margin-bottom: 10px; }}
            </style>
            </head>
            <body>
            {html}
            </body>
            </html>
            """
            
            pdf_filename = filename.replace('.docx', '.pdf')
            pdf_path = os.path.join(CONVERTED_FOLDER, pdf_filename)
            
            # Convert HTML to PDF
            err = convert_html_to_pdf(styled_html, pdf_path)
            
            if err:
                 return jsonify({'error': 'PDF conversion failed'}), 500
            
            # URL encode the filename for the link
            safe_pdf_filename = quote(pdf_filename)

            return jsonify({
                'message': 'File converted successfully',
                'downloadUrl': f'/download/{safe_pdf_filename}',
                'warnings': [m.message for m in messages]
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type. Only .docx allowed'}), 400

@app.route('/download/<filename>')
def download_file(filename):
    # Decode implicitly by Flask, but just in case secure it again or check path
    # secure_filename removes path separators, so it prevents traversal
    filename = secure_filename(filename)
    file_path = os.path.join(CONVERTED_FOLDER, filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
        
    return send_file(file_path, as_attachment=True, download_name=filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
