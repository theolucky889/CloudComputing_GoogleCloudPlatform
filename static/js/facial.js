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
    fetch('/detect-faces', {
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
        if (data.length === 0) {
            resultsDiv.innerHTML = `<p>No faces detected.</p>`;
            return;
        }

        // Display the original image
        const imageURL = URL.createObjectURL(imageFile);
        const image = new Image();
        image.src = imageURL;
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            data.forEach(face => {
                // Draw bounding box
                ctx.beginPath();
                face.bounding_poly.forEach(([x, y], index) => {
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.closePath();
                ctx.stroke();

                // Display likelihoods
                ctx.font = '14px Arial';
                ctx.fillStyle = 'yellow';
                ctx.fillText(`Joy: ${face.joy_likelihood}`, face.bounding_poly[0][0], face.bounding_poly[0][1] - 20);
                ctx.fillText(`Sorrow: ${face.sorrow_likelihood}`, face.bounding_poly[0][0], face.bounding_poly[0][1] - 40);
                ctx.fillText(`Anger: ${face.anger_likelihood}`, face.bounding_poly[0][0], face.bounding_poly[0][1] - 60);
                ctx.fillText(`Surprise: ${face.surprise_likelihood}`, face.bounding_poly[0][0], face.bounding_poly[0][1] - 80);
            });

            // Append canvas to results div
            resultsDiv.innerHTML = '';
            resultsDiv.appendChild(canvas);
        };
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error detecting faces: ${err.message}</p>`;
    });
});
