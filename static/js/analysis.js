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

    // Show the image preview
    const imagePreview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" class="preview-image">`;
    };
    reader.readAsDataURL(imageFile);

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
        if (data.error) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        } else if (data.length > 0) {
            // Prepare data for the chart
            const labels = data.map(label => label.description);
            const scores = data.map(label => (label.score * 100).toFixed(2)); // Convert to percentage

            // Create the chart
            createChart(labels, scores);

            // Display the raw data (optional)
            let labelsList = data.map(label => `<li>${label.description}: ${(label.score * 100).toFixed(2)}%</li>`).join('');
            resultsDiv.innerHTML = `<h3>Labels Detected:</h3><ul>${labelsList}</ul>`;
        } else {
            resultsDiv.innerHTML = `<p>No labels detected or data is missing.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error analyzing image: ${err.message}</p>`;
    });
});

function createChart(labels, scores) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    const chartType = document.getElementById('chartType').value;

    // Destroy the previous chart if it exists
    if (window.resultsChart) {
        window.resultsChart.destroy();
    }

    window.resultsChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Label Scores',
                data: scores,
                backgroundColor: chartType === 'pie' ? getPieColors(scores.length) : 'rgba(54, 162, 235, 0.2)',
                borderColor: chartType === 'pie' ? getPieColors(scores.length) : 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage'
                    }
                }
            } : {}
        }
    });
}

function getPieColors(numColors) {
    const colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    return Array.from({ length: numColors }, (_, i) => colors[i % colors.length]);
}

// Update the chart when the chart type selection changes
document.getElementById('chartType').addEventListener('change', function() {
    const labels = window.resultsChart.data.labels;
    const scores = window.resultsChart.data.datasets[0].data;
    createChart(labels, scores);
});
