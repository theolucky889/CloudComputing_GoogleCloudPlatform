document.getElementById('ocrForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    formData.append('image', imageFile);

    fetch('/ocr', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
        document.getElementById('ocrResults').innerHTML = `<p>Detected Text: ${data.text}</p>`;
      })
      .catch(err => {
        console.error('Error:', err);
        document.getElementById('ocrResults').innerHTML = `<p>Error processing image.</p>`;
      });
});
