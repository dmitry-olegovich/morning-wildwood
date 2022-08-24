from django.core.exceptions import ValidationError

MAX_SIZE = 4194304

def validate_file_size(file):
    filesize = file.size

    if filesize > MAX_SIZE:
        raise ValidationError('The maximum file size is 4 MB!')
    else:
        return file