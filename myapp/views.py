from django.shortcuts import render_to_response
from django.template import RequestContext


def myapp(request):

    return render_to_response('todo.html',
                              {},
                              context_instance=RequestContext(request))
