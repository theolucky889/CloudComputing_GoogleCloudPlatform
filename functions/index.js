const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');

exports.ocrImage = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(403).send('Forbidden!');
    }

    const client = new vision.ImageAnnotatorClient();
    const image = {content: req.body.image}; // Adjust depending on how you send the image data

    try {
        const [result] = await client.textDetection(image);
        const detections = result.textAnnotations;
        res.json({text: detections[0] ? detections[0].description : 'No text found'});
    } catch (error) {
        console.error('Error detecting text:', error);
        res.status(500).json({error: error.message});
    }
});
