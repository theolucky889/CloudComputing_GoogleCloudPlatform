import os
import webbrowser
from flask import Flask, request, jsonify, render_template
from google.cloud import vision
from werkzeug.utils import secure_filename
from threading import Timer

app = Flask(__name__, static_folder='static', template_folder='templates')

# Set the environment variable for Google Cloud credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'vivid-router-423116-h0-cb81109d8309.json'

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes to serve HTML pages
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

# Endpoint to handle OCR
@app.route('/perform-ocr', methods=['POST'])
def perform_ocr():
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

            # Performs text detection on the image file
            response = client.text_detection(image=image)
            texts = response.text_annotations

            # Extract detected text and return it
            detected_text = texts[0].description if texts else "No text detected"

            # Clean up the temporary file
            os.remove(filename)

            return jsonify({"text": detected_text})
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to handle facial recognition
@app.route('/detect-faces', methods=['POST'])
def detect_faces():
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

            # Performs face detection on the image file
            response = client.face_detection(image=image)
            faces = response.face_annotations

            # Extract and return the number of faces detected
            num_faces = len(faces)

            # Clean up the temporary file
            os.remove(filename)

            return jsonify({"faces": num_faces})
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to handle image analysis
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
            labels_list = [label.description for label in labels]

            # Clean up the temporary file
            os.remove(filename)

            return jsonify(labels_list)
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to open the web browser
def open_browser():
    webbrowser.open_new("http://localhost:5000/")

if __name__ == '__main__':
    Timer(1, open_browser).start()  # Open the web browser after 1 second
    app.run(debug=True)
