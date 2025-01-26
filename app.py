from flask import Flask, render_template, request, flash, redirect, url_for, jsonify, send_file
import json
from certificate_generator import get_certificates, get_files
import zipfile
import os
import logging

UPLOAD_FOLDER = "uploads"
CERTIFICATE_FOLDER = "generated_certificates"
ZIP_FOLDER = "zipped"

os.makedirs(UPLOAD_FOLDER, exist_ok = True)
os.makedirs(CERTIFICATE_FOLDER, exist_ok=True)
os.makedirs(ZIP_FOLDER, exist_ok=True)

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Required for flashing messages

# Set up logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/certificate-generator', methods=['GET','POST'])
def frontend_certificate_generator():
    return render_template('certificate_generator.html')


@app.route('/submit-data', methods=['POST'])
def submit_data():
    # Handle file uploads
    image_file = request.files.get('image')
    csv_file = request.files.get('csv')
    rectangle_data - request.files.get('rectangleData')
    
    print("Received image:", image_file)
    print("Received CSV:", csv_file)
    print("Received rectangle data:", rectangle_data)

    if image_file and csv_file:
        image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
        csv_path = os.path.join(UPLOAD_FOLDER, csv_file.filename)
        
        image_file.save(image_path)
        csv_file.save(csv_path)

        # Parse rectangle data
        rectangle_data = json.loads(request.form.get('rectangleData', '{}'))

        # Extract files and generate certificates
        image_data, csv_data = get_files(image_path, csv_path)
        get_certificates(rectangle_data, image_data, csv_data)

        # Zip the generated certificates
        zip_file_path = os.path.join(ZIP_FOLDER, "certificates.zip")
        if os.listdir(CERTIFICATE_FOLDER):  # Check if any certificates were generated
            with zipfile.ZipFile(zip_file_path, 'w') as zipf:
                for root, _, files in os.walk(CERTIFICATE_FOLDER):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, os.path.relpath(file_path, CERTIFICATE_FOLDER))
            logging.info("Certificates zipped successfully.")
        else:
            logging.error("No certificates were generated to zip.")

        # Cleanup uploaded files
        os.remove(image_path)
        os.remove(csv_path)

        return jsonify({'download_url': '/download?file=certificates.zip'}), 200

    return jsonify({"error": "Files missing"}), 400

@app.route('/download', methods=['GET'])
def download():
    file_name = request.args.get('file')
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
