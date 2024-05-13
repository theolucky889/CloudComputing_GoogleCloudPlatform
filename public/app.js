document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    formData.append('image', imageFile)

    fetcj('/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('results').innerHTML = '<p>Detected Text: ${data.text}</p>';
    })
    .catch(err => console.error('Error', err));
});