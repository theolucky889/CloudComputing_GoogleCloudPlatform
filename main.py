import os
import logging
from flask import Flask, request, jsonify, render_template
from google.cloud import vision
from werkzeug.utils import secure_filename
import webbrowser
import threading

app = Flask(__name__)

# Set the environment variable for Google Cloud credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'vivid-router-423116-h0-410fd67b4dd5.json'

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ocr')
def ocr():
    return render_template('ocr.html')

@app.route('/facial-recognition')
def facial_recognition():
    return render_template('facial-recognition.html')

@app.route('/image-analysis')
def image_analysis():
    return render_template('image-analysis.html')

@app.route('/detect-labels', methods=['POST'])
def detect_labels():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file in the request"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(filename)

            # Instantiates a client
            client = vision.ImageAnnotatorClient()

            # Loads the image into memory
            with open(filename, 'rb') as image_file:
                content = image_file.read()
            image = vision.Image(content=content)

            # Performs label detection on the image file
            response = client.label_detection(image=image)
            labels = response.label_annotations

            # Extract descriptions and return them
            labels_list = [{"description": label.description, "score": label.score} for label in labels]
            app.logger.debug('Labels: %s', labels_list)

            # Clean up the temporary file
            os.remove(filename)

            return jsonify(labels_list)
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        app.logger.error('Error occurred during label detection: %s', e)
        return jsonify({"error": str(e)}), 500

def open_browser():
    webbrowser.open_new('http://localhost:5000/')

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    # Start the Flask app in a separate thread
    threading.Timer(1.25, open_browser).start()
    app.run(debug=True)
