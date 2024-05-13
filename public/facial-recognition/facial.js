document.getElementById('facialForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Ensure an image file is selected
  const imageUploadInput = document.getElementById('imageUpload');
  if (imageUploadInput.files.length === 0) {
      alert("Please select an image file to upload.");
      return;
  }
  
  const imageFile = imageUploadInput.files[0];
  const formData = new FormData();
  formData.append('image', imageFile);

  // Update UI to show loading status
  const resultsDiv = document.getElementById('facialResults');
  resultsDiv.innerHTML = `<p>Loading...</p>`;

  // Send the form data with the image file to the server
  fetch('/facial-recognition', {
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
      // Display the results from the server
      if (data.faces) {
          resultsDiv.innerHTML = `<p>${data.faces}</p>`;
      } else {
          resultsDiv.innerHTML = `<p>No faces detected or data is missing.</p>`;
      }
  })
  .catch(err => {
      console.error('Error:', err);
      resultsDiv.innerHTML = `<p>Error detecting faces: ${err.message}</p>`;
  });
});
