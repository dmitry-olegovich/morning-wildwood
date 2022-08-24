import datetime

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from contacts.models import Location
from .modules.validators import validate_file_size
from .modules import upload_files_helpers as helpers
from .modules.schedule import date_4months


DEFUALT_ID = 1  # for when .create() needs some default foriegn key id
     
# Create your models here.
class Subjects(models.Model):
    """Subject off the class event.
    
    Fields:
    name - self explanitory;
    description - self explanitory, text description;
    photo - original photo;
    photo_small - resized photo (see small_image_size class attr.);
    photo_thumbnail - even more resized photo (see thumbnail_size class attr.);
    importance - used for sorting queries;
    active - non active ones are filtered out of the context.
    
    Methods:
    save - overriden, to also save resized small and thumbnail versions;
    """
    name = models.CharField(max_length=200, unique=True)
    #color_code = models.AutoField()  # just going to use id for coloring
    description = models.CharField(max_length=1200, blank=True, null=True)
    photo = models.ImageField(blank=True, null=True,
                                upload_to=helpers.get_upload_path,
                                validators=[validate_file_size])
    photo_small = models.ImageField(blank=True, null=True,
                                upload_to=helpers.get_upload_path_small,
                                validators=[validate_file_size])
    photo_thumbnail = models.ImageField(blank=True, null=True, 
                                upload_to=helpers.get_upload_path_thumbnail,
                                validators=[validate_file_size]) 
    # used for sorting querysets
    importance = models.IntegerField(blank=True, null=True)
    active = models.BooleanField(default=True)

    small_image_size = (640, 480)
    thumbnail_size = (120, 90)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.photo_small = helpers.resize_image(self.photo,
                                                *self.small_image_size)
        self.photo_thumbnail = helpers.resize_image(self.photo,
                                                    *self.thumbnail_size)
        super(Subjects, self).save(*args, **kwargs)
        

class Teachers(models.Model):
    """Teachers that can teach at class event.
    
    Fields:
    name - self explanitory;
    speciality - can be multiple values from 'Subjects' table;
    description - self explanitory, text description;
    photo - original photo;
    photo_small - resized photo (see small_image_size class attr.);
    photo_thumbnail - even more resized photo (see thumbnail_size class attr.);
    importance - used for sorting queries;
    active - non active ones are filtered out of the context.
    
    Methods:
    save - overriden, to also save resized small and thumbnail versions;
    """
    name = models.CharField(max_length=200, unique=True)
    speciality = models.ManyToManyField(Subjects)
    description = models.CharField(max_length=1200, blank=True, null=True)
    photo = models.ImageField(blank=True, null=True,
                                upload_to=helpers.get_upload_path,
                                validators=[validate_file_size])
    photo_small = models.ImageField(blank=True, null=True,
                                upload_to=helpers.get_upload_path_small,
                                validators=[validate_file_size])
    photo_thumbnail = models.ImageField(blank=True, null=True, 
                                upload_to=helpers.get_upload_path_thumbnail,
                                validators=[validate_file_size])               
    # used for sorting querysets
    importance = models.IntegerField(blank=True, null=True)
    active = models.BooleanField(default=True)

    small_image_size = (640, 480)
    thumbnail_size = (120, 90)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.photo_small = helpers.resize_image(self.photo,
                                                *self.small_image_size)
        self.photo_thumbnail = helpers.resize_image(self.photo,
                                                    *self.thumbnail_size)
        super(Teachers, self).save(*args, **kwargs)

        
class Rooms(models.Model):
    """Rooms that hold class events.
    
    Fields:
    name - self explanitory;
    location - can be some value from the 'contacts.Location' table;
    """
    name = models.CharField(max_length=200, unique=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE,
                                    default=DEFUALT_ID)

    def __str__(self):
        return self.location.name + ': ' + self.name

class Levels(models.Model):
    """Proficiency level for the class event.
    
    Fields:
    name - self explanitory;
    """
    name = models.CharField(max_length=200, unique=True)
    
    def __str__(self):
        return self.name

class Classes(models.Model):
    """Class event.
    
    Fields:
    date - self explanitory;
    time - self explanitory;
    subject - one of the 'Subjects' values;
    teacher - one of the 'Teachers' values;
    duration - event duration in minutes;
    level - expected proficiency level of students (from 'Levels' table);
    room - from 'Rooms';
    repeat - repeat cycle in days, if zero - one time event;
    repeat_until - if 'repeat' != 0, create matching events until this date;
    delete_ID - used to easily filter all repeating classes for deleteion;
    
    Methods:
    name - can be used as property, used for consistancy with other classes;
    save - overriden to create repeating events if needed;
    """
    date = models.DateField(default=datetime.date.today)
    time = models.TimeField(default=datetime.datetime.now)
    subject = models.ForeignKey(Subjects, on_delete=models.CASCADE,
                default=DEFUALT_ID)
    teacher = models.ForeignKey(Teachers, on_delete=models.CASCADE, 
                blank=True, null=True)
    duration = models.IntegerField(default=60,
                validators=[MinValueValidator(1), MaxValueValidator(720)])
    level = models.ForeignKey(Levels, on_delete=models.SET_NULL,
                blank=True, null=True)
    room = models.ForeignKey(Rooms, on_delete=models.SET_NULL,
                blank=True, null=True)
    repeat = models.IntegerField(default=7,
                validators=[MinValueValidator(0), MaxValueValidator(365)],
                blank=True, null=True)
    repeat_until = models.DateField(default=date_4months,
                 blank=True, null=True)
    delete_ID = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return (str(self.date) +' | '+ str(self.time) +' | '+ str(self.room))

    @property
    def name(self):
        return ' '.join(
                        [str(self.date), str(self.time), str(self.room),
                        str(self.subject), str(self.level),
                        str(self.teacher),]
                        )
    
    def save(self, *args, **kwargs):
        if self.repeat is not None and self.repeat > 0 and self.repeat_until:
            classes_list = []
            day = self.date
            while day <= self.repeat_until:
                classes_list.append(
                    Classes(
                        date = day,
                        time = self.time,
                        subject = self.subject,
                        teacher = self.teacher,
                        duration = self.duration,
                        level = self.level,
                        room = self.room,
                        repeat = self.repeat,
                        repeat_until = self.repeat_until,
                        delete_ID = '|'.join(
                                        [str(self.date), str(self.time),
                                        str(self.subject), str(self.teacher),
                                        str(self.room)]
                                        )
                    )
                )
                day += datetime.timedelta(days=self.repeat)
            Classes.objects.bulk_create(classes_list)
        else:
            super(Classes, self).save(*args, **kwargs)


