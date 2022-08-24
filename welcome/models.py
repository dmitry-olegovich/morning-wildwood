from django.db import models

import schedule.modules.validators as validators
import schedule.modules.upload_files_helpers as file_helpers


class Slide(models.Model):
    """Slide is a picture w/ text and title for front page.
    
    Fields:
    title - self explanatory; 
    text - self explanatory;
    photo - self explanatory, custom validator is used to refuse large files;
    importance - used for sorting slides when passing them to template;
    active - if False, this slide is not going to be shown.
    
    Methods:
    save - overriden, images are passed on to a helper function for resize.
    """
    title = models.CharField(max_length=250, blank=True,
                             help_text="Max 250 charecters!")
    text = models.CharField(max_length=2200, blank=True,
                            help_text="Max 2200 charecters!")
    photo = models.ImageField(upload_to=file_helpers.get_upload_path,
                              validators=[validators.validate_file_size],
                              help_text="Max 4MB!")
    # used for sorting querysets
    importance = models.IntegerField(blank=True, null=True)
    active = models.BooleanField(default=True)

    image_size = (1200, 800)

    def __str__(self):
        return self.title if self.title is not None else ''

    def save(self, *args, **kwargs):
        self.photo = file_helpers.resize_image(self.photo, *self.image_size)
        super(Slide, self).save(*args, **kwargs)
