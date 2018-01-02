import sys
import os
from PIL import Image

def greyscale(directory, image_filename):
    img = Image.open(os.path.join(directory, image_filename)).convert('LA')
    # creat output filename
    f, e = os.path.splitext(image_filename)
    out_filename = f + "_grey" + e
    try:
        img.save(os.path.join(directory, out_filename))
        print(out_filename)
    except IOError:
        print("cannot save file ")

if __name__ ==  "__main__":
    directory = sys.argv[1]
    image_filename = sys.argv[2]
    greyscale(directory, image_filename)
