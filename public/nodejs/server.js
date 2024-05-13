const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const app = express();
const port = 3000;

const client = new ImageAnnotatorClient({
    keyFilename: ''
});
const upload = multer({dest: 'uploads/'})

app.use(express.static('public'))   //serve static file

app.post('/analyze', upload.single('image'), async (req, res) => {
    const [result] = await client.documentTextDetection(`./uploads/${req.file.filename}`);
    const detections = result.textAnnotations;
    res.json({ text: detections[0] ? detections[0].description : "No text detected." });
});

app.listen(port, () => {
    console.log('Server running on http://localhost:${port}');
});