document.getElementById('facialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    formData.append('image', imageFile);

    fetch('/facial-recognition', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
        document.getElementById('facialResults').innerHTML = `<p>${data.faces}</p>`;
      })
      .catch(err => {
        console.error('Error:', err);
        document.getElementById('facialResults').innerHTML = `<p>Error detecting faces.</p>`;
      });
});
