import json 

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

from .models import Room
from django.shortcuts import render
from account.models import User


@require_POST
def create_room(request, uuid):
    name  = request.POST.get('name', '')
    url = request.POST.get('url', '')
    room = Room.objects.create(client=name, url=url, uuid=uuid)

    return JsonResponse({
        'message': 'Room Created',
    })

@login_required
def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)
    return render(request, 'chat/admin.html', {'rooms': rooms, 'users': users})

@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)

    if room.status == Room.WAITING:
        room.status = Room.ACTIVE
        room.agent = request.user
        room.save()

    return render(request, 'chat/room.html', {'room': room})