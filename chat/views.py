import json 

from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Room


@require_POST
def create_room(request, uuid):
    name  = request.POST.get('name', '')
    url = request.POST.get('url', '')
    room = Room.objects.create(client=name, url=url, uuid=uuid)

    return JsonResponse({
        'message': 'Room Created',
    })