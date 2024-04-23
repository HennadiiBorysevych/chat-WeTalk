import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timesince import timesince

from account.models import User

from .templatetags.chatextras import initials
from .models import Message, Room


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        await self.get_room()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json["type"]
        message = text_data_json["message"]
        name = text_data_json["name"]
        agent = text_data_json.get('agent', '')

        print(f"type: {type}")
        if type == "message":
            new_message = await self.create_message(name, message, agent)
            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "chat_message", 
                    "message": message,
                    "name": name,
                    "agent": agent,
                    'initials': initials(name),
                    'created_at': timesince(new_message.created_at),
                })
            
    async def chat_message(self, event):
        message = event["message"]
        name = event["name"]
        agent = event["agent"]
        initials = event["initials"]
        type = event["type"]
        created_at = event["created_at"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": type,
            "message": message,
            "name": name,
            "agent": agent,
            "initials": initials,
            "created_at": created_at,
        }))
    
    @sync_to_async
    def get_room(self):
        self.room = Room.objects.get(uuid=self.room_name)

    @sync_to_async
    def create_message(self, sent_by, message, agent):
        new_message = Message.objects.create(body=message, sent_by=sent_by)
        
        if agent:
            message.created_by = User.object.get(pk=agent)
            message.save()
        
        self.room.messages.add(new_message)
        return new_message