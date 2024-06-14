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
                ctx.moveTo(face.bounding_poly[0][0], face.bounding_poly[0][1]);
                for (let i = 1; i < face.bounding_poly.length; i++) {
                    ctx.lineTo(face.bounding_poly[i][0], face.bounding_poly[i][1]);
                }
                ctx.closePath();
                ctx.stroke();

                // Display likelihoods with background
                ctx.font = '14px Arial';
                ctx.fillStyle = 'yellow';
                const x = face.bounding_poly[0][0];
                const y = face.bounding_poly[0][1];
                const textLines = [
                    `Joy: ${face.joy_likelihood}`,
                    `Sorrow: ${face.sorrow_likelihood}`,
                    `Anger: ${face.anger_likelihood}`,
                    `Surprise: ${face.surprise_likelihood}`
                ];
                
                ctx.textBaseline = 'top';
                textLines.forEach((line, index) => {
                    const textX = x + 5; // Slight offset to ensure text is inside the bounding box
                    const textY = y - (index * 20) - 60; // Adjust text placement relative to the bounding box
                    if (textY < 0) textY = 0; // Prevent text from going above the canvas
                    ctx.fillText(line, textX, textY);
                });
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
