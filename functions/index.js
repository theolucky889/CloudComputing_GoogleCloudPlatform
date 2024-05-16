const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
const cors = require('cors')({origin: true});

admin.initializeApp();

const client = new vision.ImageAnnotatorClient();

exports.detectLabels = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const file = req.body.image;
            if (!file) {
                return res.status(400).send('No image file in the request');
            }

            const image = {content: Buffer.from(file, 'base64')};

            const [result] = await client.labelDetection(image);
            const labels = result.labelAnnotations;
            const labelsList = labels.map(label => label.description);

            res.status(200).send(labelsList);
        } catch (error) {
            console.error('Error during label detection:', error);
            res.status(500).send(error.message);
        }
    });
});
