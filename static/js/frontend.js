const imageUpload = document.getElementById('image-upload');
const csvUpload = document.getElementById('csv-upload');
const dropdown = document.getElementById('csv-header');
const downloadButton = document.getElementById('download-button');
const loadingMessage = document.getElementById('loading-message');

// Elements for rectangle and sliders
const rectangle = document.getElementById('rectangle');
const x1Slider = document.getElementById('x1-slider');
const y1Slider = document.getElementById('y1-slider');
const x2Slider = document.getElementById('x2-slider');
const y2Slider = document.getElementById('y2-slider');
const x1Val = document.getElementById('x1-val');
const y1Val = document.getElementById('y1-val');
const x2Val = document.getElementById('x2-val');
const y2Val = document.getElementById('y2-val');
const imageElement = document.getElementById('image');
const submitButton = document.getElementById('submit-button');

// Initial slider values
let x1Pos = parseInt(x1Slider.value);
let y1Pos = parseInt(y1Slider.value);
let x2Pos = parseInt(x2Slider.value);
let y2Pos = parseInt(y2Slider.value);

// Update rectangle position and size on slider change
x1Slider.addEventListener('input', function () {
    x1Pos = parseInt(x1Slider.value);
    x1Val.textContent = x1Pos;
    updateRectangleSize();
});

y1Slider.addEventListener('input', function () {
    y1Pos = parseInt(y1Slider.value);
    y1Val.textContent = y1Pos;
    updateRectangleSize();
});

x2Slider.addEventListener('input', function () {
    x2Pos = parseInt(x2Slider.value);
    x2Val.textContent = x2Pos;
    updateRectangleSize();
});

y2Slider.addEventListener('input', function () {
    y2Pos = parseInt(y2Slider.value);
    y2Val.textContent = y2Pos;
    updateRectangleSize();
});

// Update the rectangle dimensions and ensure they stay within the image boundaries
function updateRectangleSize() {
    const width = Math.max(0, x2Pos - x1Pos);
    const height = Math.max(0, y2Pos - y1Pos);
    rectangle.style.width = `${width}px`;
    rectangle.style.height = `${height}px`;

    rectangle.style.left = `${Math.min(x1Pos, imageElement.clientWidth)}px`;
    rectangle.style.top = `${Math.min(y1Pos, imageElement.clientHeight)}px`;
}

// Handle image upload
imageUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageElement.src = e.target.result;
            imageElement.style.display = 'block';
            updateRectangleSize();
        };
        reader.readAsDataURL(file);
    }
});

// Handle CSV upload
csvUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const lines = contents.split('\n');
            const headers = lines[0].split(',');
            populateDropdown(headers);
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid CSV file.');
    }
});

// Populate dropdown with CSV headers
function populateDropdown(headers) {
    dropdown.innerHTML = ''; // Clear existing options
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        dropdown.appendChild(option);
    });
}

// Handle submit button click
submitButton.addEventListener('click', function () {
    const formData = new FormData();
    formData.append('image', imageUpload.files[0]);
    formData.append('csv', csvUpload.files[0]);
    formData.append('rectangleData', JSON.stringify({
        x1: document.getElementById('x1-slider').value,
        y1: document.getElementById('y1-slider').value,
        x2: document.getElementById('x2-slider').value,
        y2: document.getElementById('y2-slider').value,
        selectedHeader: dropdown.value
    }));

    loadingMessage.style.display = 'block';

    fetch('/submit-data', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = 'none';
            if (data.error) {
                alert(`Error: ${data.error}`);
                return;
            }
            if (data.download_url) {
                downloadButton.style.display = 'block';
                downloadButton.onclick = function () {
                    window.location.href = data.download_url;
                };
            }
        })
        .catch(error => {
            loadingMessage.style.display = 'none';
            alert(`Submission failed: ${error.message}`);
        });
});


// Handle download button click
downloadButton.addEventListener('click', function () {
    window.location.href = '/download-certificates';
});
