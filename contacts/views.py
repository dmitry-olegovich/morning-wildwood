import json

from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import ListView
from django.views import View
from django.urls import reverse

from .models import Location

# Create your views here.
class ContactsView(ListView):
    """Return template with context to display contacts list."""
    
    template_name = 'contacts/contacts.html'
    ordering = ['-importance', 'name']
    model = Location

    def get_queryset(self, **kwargs):
        return super().get_queryset(**kwargs).filter(active=True)
        
class ContactsListView(View):
    """Return json contacts payload for AJAX JS calls."""
    
    def get(self, request, *args, **kwargs):
        objects = Location.objects.filter(active=True).order_by('-importance')
        result = []
        for elem in objects:
            result.append( {
                'name': elem.name,
                'schedule_url': f"{reverse('schedule:schedule')}"\
                                 f"?location={elem.name}",
                'contact': f"{elem.city}, {elem.building} {elem.street}"\
                            f", tel. {elem.phone}",
            })
        result = json.dumps(result)
        
        return HttpResponse(result)
