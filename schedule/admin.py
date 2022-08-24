from django.contrib import admin

# Register your models here.
from .models import Classes, Teachers, Rooms, Levels, Subjects

class TeachersAdmin(admin.ModelAdmin):
    exclude = ('photo_small', 'photo_thumbnail')
    
class SubjectsAdmin(admin.ModelAdmin):
    exclude = ('photo_small', 'photo_thumbnail')
    
class ClassesAdmin(admin.ModelAdmin):
    readonly_fields = ('delete_ID',)

admin.site.register(Classes, ClassesAdmin)
admin.site.register(Teachers, TeachersAdmin)
admin.site.register(Rooms)
admin.site.register(Levels)
admin.site.register(Subjects, SubjectsAdmin)

