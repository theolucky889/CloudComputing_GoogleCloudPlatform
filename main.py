import os
from flask import Flask, request, jsonify
from google.cloud import vision

app = Flask(__name__)

# Set the environment variable for Google Cloud credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'vivid-router-423116-h0-cb81109d8309.json'

@app.route('/detect-labels', methods=['POST'])
def detect_labels():
    try:
        image_uri = request.json['image_uri']  # Expecting image URI in JSON format from the frontend

        # Instantiates a client
        client = vision.ImageAnnotatorClient()

        # Configures the image to use
        image = vision.Image()
        image.source.image_uri = image_uri

        # Performs label detection on the image file
        response = client.label_detection(image=image)
        labels = response.label_annotations

        # Extract descriptions and return them
        labels_list = [label.description for label in labels]
        return jsonify(labels_list)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
