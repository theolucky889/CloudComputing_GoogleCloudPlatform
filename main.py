import os
import logging
from flask import Flask, request, jsonify, render_template
from google.cloud import vision
from werkzeug.utils import secure_filename

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

            client = vision.ImageAnnotatorClient()

            with open(filename, 'rb') as image_file:
                content = image_file.read()
            image = vision.Image(content=content)

            response = client.label_detection(image=image)
            labels = response.label_annotations

            labels_list = [{"description": label.description, "score": label.score} for label in labels]
            labels_list = sorted(labels_list, key=lambda x: x['score'], reverse=True)[:5]
            app.logger.debug('Top 5 Labels: %s', labels_list)

            os.remove(filename)

            return jsonify(labels_list)
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        app.logger.error('Error occurred during label detection: %s', e)
        return jsonify({"error": str(e)}), 500

@app.route('/ocr-text', methods=['POST'])
def ocr_text():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file in the request"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(filename)

            client = vision.ImageAnnotatorClient()

            with open(filename, 'rb') as image_file:
                content = image_file.read()
            image = vision.Image(content=content)

            response = client.text_detection(image=image)
            texts = response.text_annotations

            detected_text = texts[0].description if texts else 'No text detected'
            app.logger.debug('Detected Text: %s', detected_text)

            os.remove(filename)

            return jsonify({"text": detected_text})
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        app.logger.error('Error occurred during OCR: %s', e)
        return jsonify({"error": str(e)}), 500

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

            client = vision.ImageAnnotatorClient()

            with open(filename, 'rb') as image_file:
                content = image_file.read()
            image = vision.Image(content=content)

            response = client.face_detection(image=image)
            faces = response.face_annotations

            faces_list = []
            for face in faces:
                face_data = {
                    "detection_confidence": face.detection_confidence,
                    "joy_likelihood": face.joy_likelihood,
                    "sorrow_likelihood": face.sorrow_likelihood,
                    "anger_likelihood": face.anger_likelihood,
                    "surprise_likelihood": face.surprise_likelihood,
                    "bounding_poly": [{"x": vertex.x, "y": vertex.y} for vertex in face.bounding_poly.vertices]
                }
                faces_list.append(face_data)
            app.logger.debug('Detected Faces: %s', faces_list)

            os.remove(filename)

            return jsonify(faces_list)
        else:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400

    except Exception as e:
        app.logger.error('Error occurred during face detection: %s', e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)