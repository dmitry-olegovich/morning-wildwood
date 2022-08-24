import pdb

from django.shortcuts import render, get_object_or_404
from django.views import generic
from django.http import Http404
from django.forms.models import model_to_dict

from schedule.models import Teachers, Subjects

def to_model(key:str):
    """Return model from str typed key.
    
    A very strict name string to model converter that only allows
    specific model names defined in 'models' local var.
    """
    models = {
        'teachers': Teachers,
        'classes': Subjects,
    }
    if key not in models:
        raise Http404
    
    return models[key]

def object_list_to_dict_list(obj_list:list, spec=False):
    """Return dict of a Django orm model object.
    
    A wrapper over model_to_dict() to do it for a large number of 
    objects.
    """
    result = []
    for elem in obj_list:
        result.append(model_to_dict(elem))
        if spec:
            result[-1]['speciality_active'] = \
                                            elem.speciality.filter(active=True)
    
    return result

# Create your views here.
class ItemListView(generic.ListView):
    """Return model object list context depending on request param."""
    template_name = "list/item_list.html"
    paginate_by = 6
    ordering = ['-importance', 'name']

    def get_queryset(self, **kwargs):
        self.model = to_model(self.kwargs['list_name'])
        
        return super().get_queryset(**kwargs).filter(active=True)

    def get_context_data(self, **kwargs):
        spec = False
        context = super().get_context_data(**kwargs)
        if self.kwargs['list_name'] == 'teachers':
            spec = True  # this is needed to poroperly treat m-2-m feild filter
                         # in object_list_to_dict_list as a quickfix
        context['object_list'] = \
                         object_list_to_dict_list(context['object_list'], spec)
        context['table'] = self.kwargs['list_name']
        
        return context
    

class ShowItemView(generic.DetailView):
    """Return a model object context depending on request param."""
    template_name = "list/show_item.html"

    def get_queryset(self, **kwargs):
        self.model = to_model(self.kwargs['list_name'])
        
        return super().get_queryset(**kwargs).filter(active=True)
    
    def get_context_data(self, **kwargs):
        
        context = super().get_context_data(**kwargs)
        if self.kwargs['list_name'] == 'teachers':
            context['speciality_active'] = \
                               context['object'].speciality.filter(active=True)
        context['table'] = self.kwargs['list_name']
        
        return context
