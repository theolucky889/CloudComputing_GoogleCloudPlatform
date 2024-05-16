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
            resultsDiv.innerHTML = `<p>Labels Detected: ${data.join(', ')}</p>`;
        } else {
            resultsDiv.innerHTML = `<p>No labels detected or data is missing.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error analyzing image: ${err.message}</p>`;
    });
  });
  