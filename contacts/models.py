from django.db import models
from django.core.validators import RegexValidator

import schedule.modules.validators as validators
import schedule.modules.upload_files_helpers as file_helpers

# Create your models here.
class Location(models.Model):
    """Location records for displaying contacts of specific locations.
    
    Fields:
    name - self explanatory; 
    city - self explanatory;
    street - self explanatory;
    building - self explanatory;
    additional - any additional info used to pinpoint the address, 
        office number, etc.;
    photo - self explanatory, custom validator is used to refuse large files;
    route_photo - self explanatory, validator is used to refuse large files;
    active - if False, this slide is not going to be shown;
    phone - self explanatory, a custom validator is used for format;
    email - self explanatory; 
    social - any additional urls, planned as links to social network pages;
    importance - used for sorting slides when passing them to template.
    
    
    Methods:
    address - return combined address fields as single string;
    contacts - return combined contacts fields as single string;
    """
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. \
                 Up to 15 digits allowed.")

    name = models.CharField(max_length=20, unique=True)
    city = models.CharField(max_length=40)
    street = models.CharField(max_length=80)
    building = models.CharField(max_length=20)
    additional = models.CharField(max_length=20, null=True, blank=True)
    photo = models.ImageField(upload_to=file_helpers.get_upload_path,
                                validators=[validators.validate_file_size],
                                null=True, blank=True)
    route_photo = models.ImageField(upload_to=file_helpers.get_upload_path,
                                validators=[validators.validate_file_size],
                                null=True, blank=True)
    active = models.BooleanField(default=True)
    phone = models.CharField(validators=[phone_regex],max_length=17,
                                null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    social = models.URLField(null=True, blank=True)
    importance = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name

    def address(self):
        result = f"{self.city}, {self.street} {self.building}"
        if self.additional:
            result += f", {self.additional}"

        return result

    def contacts(self):
        result = []
        if self.phone:
            result.append(self.phone)
        if self.email:
            result.append(self.email)
        if self.social:
            result.append(self.social)

        return result
    
    

    
