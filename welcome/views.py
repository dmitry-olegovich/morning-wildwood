from django.shortcuts import render, get_object_or_404
from django.views.generic.base import TemplateView
from django.forms.models import model_to_dict

from .models import Slide

class MainView(TemplateView):
    """Provide welcome page template and slides from db."""
    template_name = 'welcome/welcome.html'
    model = Slide

    def get_context_data(self, **kwargs):
        """Provide slides from db to template as context."""
        context = super().get_context_data(*kwargs)
        context['slides'] = self.model.objects.filter(active=True)

        return context
