import cv2
import os
from concurrent.futures import ThreadPoolExecutor
from PIL import ImageFont, ImageDraw, Image
import numpy as np
import pandas as pd
import logging

def get_files(image_path, csv_path):
    image = cv2.imread(image_path)
    csv = pd.read_csv(csv_path)
    return image, csv

def get_certificates(rectangle_data, image, csv):
    with ThreadPoolExecutor() as executor:
        try:
            for _, row in csv.iterrows():
                text = row.get(rectangle_data['selectedHeader'], '')
                executor.submit(create_certificates, rectangle_data, image, text)
        except Exception as e:
            logging.error(f"Error in get_certificates: {e}")

def create_certificates(rectangle_data, image, text):
    x1 = int(rectangle_data['x1'])
    y1 = int(rectangle_data['y1'])
    x2 = int(rectangle_data['x2'])
    y2 = int(rectangle_data['y2'])
    try:
        # Finding centre
        centrex = (x1 + x2) // 2
        centrey = (y1 + y2) // 2
        
        # Copying image and loading font
        temp_image = image.copy()
        pil_image = Image.fromarray(cv2.cvtColor(temp_image, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(pil_image)
        
        # Setting text position
        font_path = 'Poppins/Poppins-Italic.ttf'
        rect_height = y2 - y1
        font = ImageFont.truetype(font_path, rect_height, encoding="UTF-8")
        text_width, text_height = font.getbbox(text)[2:]
        text_position = (centrex - text_width // 2, centrey - text_height // 2)

        # Writing text
        draw.text(text_position, text, font=font, fill=(0, 0, 0))

        # Saving image file
        temp_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        output_image = os.path.join("generated_certificates", f"{text}.jpg")
        logging.info(f"Created certificate: {output_image}")
        cv2.imwrite(output_image, temp_image)

    except Exception as e:
        logging.error(f"Error in create_certificates: {e}")
