document.getElementById('analysisForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate that an image file has been selected
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

    // Display a loading message to improve user experience
    const resultsDiv = document.getElementById('analysisResults');
    resultsDiv.innerHTML = `<p>Loading...</p>`;

    // Make the POST request with the image data
    fetch('/detect-labels', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data by displaying the labels
        if (data.error) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        } else if (data.length > 0) {
            let labelsList = data.map(label => `<li>${label}</li>`).join('');
            resultsDiv.innerHTML = `<h3>Labels Detected:</h3><ul>${labelsList}</ul>`;
        } else {
            resultsDiv.innerHTML = `<p>No labels detected or data is missing.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error analyzing image: ${err.message}</p>`;
    });
});
