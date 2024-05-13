const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const app = express();
const upload = multer({ dest: 'uploads/' }); // Stores files in 'uploads/' directory
const client = new ImageAnnotatorClient();

// OCR Endpoint
app.post('/ocr', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.textDetection({ image: { source: { filename: req.file.path } } });
        const detections = result.textAnnotations;
        res.json({ text: detections[0] ? detections[0].description : 'No text detected' });
    } catch (error) {
        console.error('OCR error:', error);
        res.status(500).json({ message: 'Failed to process image for OCR', error: error.message });
    }
});

// Facial Recognition Endpoint
app.post('/facial-recognition', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.faceDetection({ image: { source: { filename: req.file.path } } });
        const faces = result.faceAnnotations;
        res.json({ faces: faces.length });
    } catch (error) {
        console.error('Facial recognition error:', error);
        res.status(500).json({ message: 'Failed to process image for facial recognition', error: error.message });
    }
});

// Image Analysis Endpoint
app.post('/image-analysis', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.labelDetection({ image: { source: { filename: req.file.path } } });
        const labels = result.labelAnnotations.map(label => label.description);
        res.json({ labels });
    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({ message: 'Failed to process image for analysis', error: error.message });
    }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
