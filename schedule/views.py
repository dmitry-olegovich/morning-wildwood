from datetime import date, time, timedelta

from django.shortcuts import render
from django.views import View

from .models import Classes, Teachers, Subjects, Rooms
from contacts.models import Location
from .modules.schedule import week_range

# Create your views here.
class ScheduleView(View):
    """Provide classes, filter values and lists, next/previous week."""
    template_name = 'schedule/week.html'
    
    def get(self, request, *args, **kwargs):
        SUBJECT_COLOR_PALLETTE_SIZE = 6

        # Calculating the range of the week to display from url params
        requested_day = request.GET.get('starting', '')
        date_from, date_to = week_range(requested_day)
        day = timedelta(days=1)
        next_date = date_to + day
        prev_date = date_from - day
        # Teacher, subject and room for filtering classes from url params
        teacher = request.GET.get('teacher', '')
        subject = request.GET.get('subj', '')
        room = request.GET.get('room', '')
        location = request.GET.get('location', '')

        data = {}

        # Get data from db for each day of the week
        while date_from <= date_to:
            classes_for_day = {}
            classes = Classes.objects.filter(date=date_from)    
            if teacher != '':
                classes = classes.filter(teacher__name=teacher)
            if subject != '':
                classes = classes.filter(subject__name=subject)
            if location != '':
                classes = classes.filter(room__location__name=location)
            if room != '':
                classes = classes.filter(room__name=room)
            
            classes.order_by('time')
            
            # Provide data for each of the classes on this day
            for item in classes:
                entry = {
                    'subject': item.subject.name,
                    'time': item.time,
                    'duration': item.duration,
                    'color': item.subject.id % SUBJECT_COLOR_PALLETTE_SIZE,
                }
                # following fields are not mandotory for model 
                # and may cause Attribute error if abscent, thus is-not-None-checks
                if item.room is not None:
                    entry['room'] = item.room.name
                    entry['location'] = item.room.location.name
                else:
                    entry['room'] = ''
                    entry['location'] = ''
                if item.level is not None:
                    entry['level'] = item.level.name
                else:
                    entry['level'] = ''
                if item.teacher is not None:
                    entry['teacher'] = item.teacher.name
                else:
                    entry['teacher'] = ''
               
                if item.time not in classes_for_day:
                    classes_for_day[item.time] = [entry]
                else:
                    classes_for_day[item.time].append(entry)


            data[date_from] = classes_for_day
            date_from += day

        # Auxillary data for menus and timetable
        hours = [time(h) for h in range(0,24)]
        teachers = Teachers.objects.values_list('name',
                                                flat=True).filter(active=True)
        subjects = Subjects.objects.values_list('name',
                                                flat=True).filter(active=True)
        rooms = Rooms.objects.values_list(
            'name', flat=True).filter(location__active=True)
        locations = Location.objects.values_list('name',
                                                 flat=True).filter(active=True)

        context = {
            'week': data,
            'hours': hours,
            'filters': [teachers, subjects, locations, rooms, requested_day],
            'filters_values': [teacher, subject, location, room],
            'next': next_date,
            'previous': prev_date,
        }

        return render(request, 'schedule/week.html', context)
    
