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
        // Handle the response data by displaying the labels
        if (data.length > 0) {
            displayResults(data);
        } else {
            resultsDiv.innerHTML = `<p>No labels detected or data is missing.</p>`;
        }
    })
    .catch(err => {
        console.error('Error:', err);
        resultsDiv.innerHTML = `<p>Error analyzing image: ${err.message}</p>`;
    });
  });
  
  function displayResults(labels) {
    const resultsDiv = document.getElementById('analysisResults');
    const chartTypeSelect = document.getElementById('chartType');
    const chartType = chartTypeSelect.value;
  
    const labelNames = labels.map(label => label.description);
    const labelScores = labels.map(label => label.score);
  
    const canvas = document.createElement('canvas');
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(canvas);
  
    if (window.resultsChart) {
      window.resultsChart.destroy();
    }
  
    window.resultsChart = new Chart(canvas, {
      type: chartType === 'Bar Graph' ? 'bar' : 'pie',
      data: {
        labels: labelNames,
        datasets: [{
          label: 'Confidence Scores',
          data: labelScores,
          backgroundColor: labelScores.map(() => getRandomColor()),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  document.getElementById('chartType').addEventListener('change', function() {
    const resultsDiv = document.getElementById('analysisResults');
    if (resultsDiv.innerHTML !== '') {
      displayResults(window.currentLabels);
    }
  });
  