const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusContainer = document.getElementById('status-container');
const progressFill = document.getElementById('progress-fill');
const resultContainer = document.getElementById('result-container');
const downloadBtn = document.getElementById('download-btn');
const statusText = document.getElementById('status-text');
const warningsDiv = document.getElementById('warnings');

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('drag-over');
}

function unhighlight() {
    dropZone.classList.remove('drag-over');
}

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function uploadFile(file) {
    if (!file.name.endsWith('.docx')) {
        alert('Please upload a .docx file.');
        return;
    }

    // UI Reset
    dropZone.classList.add('hidden');
    statusContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    progressFill.style.width = '0%';
    statusText.innerText = 'Uploading...';
    warningsDiv.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 50; // Upload is first 50%
            progressFill.style.width = percentComplete + '%';
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            progressFill.style.width = '100%';
            statusText.innerText = 'Processing...';

            const response = JSON.parse(xhr.responseText);

            setTimeout(() => {
                statusContainer.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                downloadBtn.href = response.downloadUrl;
                downloadBtn.download = response.downloadUrl.split('/').pop();

                if (response.warnings && response.warnings.length > 0) {
                    warningsDiv.innerHTML = '<strong>Warnings:</strong><br>' + response.warnings.join('<br>');
                    warningsDiv.classList.remove('hidden');
                }
            }, 500);

        } else {
            statusText.innerText = 'Error converting file.';
            console.error(xhr.responseText);
            alert('Error: ' + JSON.parse(xhr.responseText).error);
            dropZone.classList.remove('hidden');
            statusContainer.classList.add('hidden');
        }
    };

    xhr.send(formData);
}
