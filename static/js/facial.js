document.getElementById('facialForm').addEventListener('submit', function(e) {
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
    const resultsDiv = document.getElementById('facialResults');
    resultsDiv.innerHTML = `<p>Loading...</p>`;
  
    // Send the image to the server for facial recognition processing
    fetch('/detect-faces', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Display the number of faces detected
        if (data.faces !== undefined) {
            resultsDiv.innerHTML = `<p>Number of faces detected: ${data.faces}</p>`;
        } else {
            resultsDiv.innerHTML = `<p>No faces detected or data is incomplete.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error detecting faces: ${err.message}</p>`;
    });
  });
  