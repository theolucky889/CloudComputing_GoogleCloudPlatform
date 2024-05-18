document.getElementById('ocrForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Check if an image file has been selected
    const imageUploadInput = document.getElementById('imageUpload');
    if (imageUploadInput.files.length === 0) {
        alert("Please select an image file to upload.");
        return;
    }

    const imageFile = imageUploadInput.files[0];
    const formData = new FormData();
    formData.append('image', imageFile);

    // Show the image preview
    const imagePreview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" class="preview-image">`;
    };
    reader.readAsDataURL(imageFile);

    // Show a loading message to inform the user that processing is underway
    const resultsDiv = document.getElementById('ocrResults');
    resultsDiv.innerHTML = `<p>Loading...</p>`;

    // Send the image to the server for OCR processing
    fetch('/perform-ocr', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Check if data includes text and display it
        if (data.text) {
            resultsDiv.innerHTML = `<h3>Detected Text:</h3><pre>${data.text}</pre>`;
        } else {
            resultsDiv.innerHTML = `<p>No text detected or the data is incomplete.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error processing image: ${err.message}</p>`;
    });
});
