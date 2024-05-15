const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");
const cors = require("cors")({origin: true});
const admin = require("firebase-admin");
const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

admin.initializeApp();

const client = new vision.ImageAnnotatorClient();
const upload = multer({storage: multer.memoryStorage()});

exports.ocrImage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({error: "Failed to upload file"});
      }

      // Validate the file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only JPG, JPEG, and PNG are allowed." });
      }

      try {
        const tempFilePath = path.join(os.tmpdir(), req.file.originalname);
        fs.writeFileSync(tempFilePath, req.file.buffer);

        const [result] = await client.textDetection(tempFilePath);
        const detections = result.textAnnotations;
        const text = detections[0] 
          ? detections[0].description 
          : "No text detected";

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        res.status(200).json({text});
      } catch (error) {
        console.error("Error during OCR:", error);
        res.status(500).json({error: error.message});
      }
    });
  });
});
