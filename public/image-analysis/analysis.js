document.getElementById('analysisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    formData.append('image', imageFile);

    fetch('/image-analysis', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
        document.getElementById('analysisResults').innerHTML = `<p>Labels Detected: ${data.labels}</p>`;
      })
      .catch(err => {
        console.error('Error:', err);
        document.getElementById('analysisResults').innerHTML = `<p>Error analyzing image.</p>`;
      });
});
