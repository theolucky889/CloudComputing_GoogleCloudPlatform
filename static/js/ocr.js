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

    // Show a loading message to inform the user that processing is underway
    const resultsDiv = document.getElementById('ocrResults');
    resultsDiv.innerHTML = `<p>Loading...</p>`;

    // Display the original image
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; height: auto;">`;
    };
    reader.readAsDataURL(imageFile);

    // Send the image to the server for OCR processing
    fetch('/ocr-text', {
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
            resultsDiv.innerHTML = `<p>Detected Text: ${data.text}</p>`;
        } else {
            resultsDiv.innerHTML = `<p>No text detected or the data is incomplete.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error processing image: ${err.message}</p>`;
    });
});
