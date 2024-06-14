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

            data.forEach((face, index) => {
                // Draw bounding box
                ctx.beginPath();
                ctx.moveTo(face.bounding_poly[0].x, face.bounding_poly[0].y);
                face.bounding_poly.forEach(vertex => {
                    ctx.lineTo(vertex.x, vertex.y);
                });
                ctx.closePath();
                ctx.stroke();
            });

            // Create a results list
            const resultsList = document.createElement('div');
            resultsList.classList.add('results-list');
            data.forEach((face, index) => {
                const faceInfo = document.createElement('div');
                faceInfo.classList.add('face-info');
                faceInfo.innerHTML = `
                    <h3>Face ${index + 1}</h3>
                    <p><strong>Joy:</strong> ${face.joy_likelihood}</p>
                    <p><strong>Sorrow:</strong> ${face.sorrow_likelihood}</p>
                    <p><strong>Anger:</strong> ${face.anger_likelihood}</p>
                    <p><strong>Surprise:</strong> ${face.surprise_likelihood}</p>
                    <p><strong>Confidence:</strong> ${(face.detection_confidence * 100).toFixed(2)}%</p>
                `;
                resultsList.appendChild(faceInfo);
            });

            // Append image and results list to the results div
            resultsDiv.innerHTML = '';
            const container = document.createElement('div');
            container.classList.add('results-container');
            container.appendChild(canvas);
            container.appendChild(resultsList);
            resultsDiv.appendChild(container);
        };
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error detecting faces: ${err.message}</p>`;
    });
});
