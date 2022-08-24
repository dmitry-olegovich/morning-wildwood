import traceback

import sys
from os import path
from PIL import Image
from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile


def get_upload_path(instance, filename):
    """
    Returns a path composed of app_name/table_name/filename.
    """
    return path.join(instance._meta.app_label, instance._meta.db_table, filename)

def get_upload_path_small(instance, filename):
    """
    Returns a path composed of app_name/table_name/filename_small.<original_extention>.
    """
    filename = '.'.join(filename.split('.')[0:-1]) + '_small' + '.' + filename.split('.')[-1]

    return get_upload_path(instance, filename)

def get_upload_path_thumbnail(instance, filename):
    """
    Returns a path composed of app_name/table_name/filename_thumbnail.<original_extention>.
    """
    filename = '.'.join(filename.split('.')[0:-1]) + '_thumbnail' + '.' + filename.split('.')[-1]

    return get_upload_path(instance, filename)

def resize_image(photo, size_x, size_y):
    """
    Uses pilow to make a thumbnail of Django ImageField Objects.
    Returns JPEG image, which can be used in model.save().
    If image size is less than size_x, size_y, returns image in original size.
    In case of errors returns None.
    """
    if not photo:
        return None
    fill_alpha_color = 0  # color used to fill alpha chanel if any, when saving to jpeg
    alpha_chanel_modes = ('RGBA', 'LA')
    try:
        output = BytesIO()
        with Image.open(photo) as image:
            x, y = image.size
            if x < y:
                k = size_x / x
            else:
                k = size_y / y
            # make thumbnail only if size is larger
            if x > size_x and y > size_y:
                image.thumbnail((k*x, k*y))
            # check if image has an alpha chanel - we are saving a jpeg
            if image.mode in alpha_chanel_modes:
                backg = Image.new(image.mode[:-1], image.size, fill_alpha_color)
                backg.paste(image, image.split()[-1])
                image = backg
            image.save(output, format='JPEG')
            output.seek(0)
            
            return InMemoryUploadedFile(output, 'ImageField', 
                        photo.name, 'image/jpeg',
                        sys.getsizeof(output), None)
                        
    except IOError:  # as a side effect check if the file is image at all
        print(f"*** ERROR *** resize_image caused IOError!")  # DEBUG
        traceback.print_exc()
        return None
