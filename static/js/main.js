
let chatName = ''
let chatSocket = null
let chatWindowUrl = window.location.href
let chatRoomUuid = Math.random().toString(36).slice(2, 12)



const chatElement = document.querySelector('#chat')
const chatOpenElement = document.querySelector('#chat_open')
const chatJoinElement = document.querySelector('#chat_join')
const chatIconElement = document.querySelector('#chat_icon')
const chatWelcomeElement = document.querySelector('#chat_welcome')
const chatRoomElement = document.querySelector('#chat_room')
const chatNameElement = document.querySelector('#chat_name')
const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')


function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function onChatMessage(data) {
    if (data.type === 'chat_message') {
        if (data.agent){
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                </div>
            `
        } else {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>

                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                </div>
            `
        }
    }
    scrollToBottom()
}

async function sendMessage() {
    const message = chatInputElement.value

    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': message,
        'name': chatName
    }))

    chatInputElement.value = ''
}

async function joinChatRoom() {
    chatName = chatNameElement.value
    console.log('Join as:', chatName);
    console.log('Room uuid:', chatRoomUuid);

    const data = new FormData()
    data.append('name', chatName)
    data.append('url', chatWindowUrl)

    await fetch(`/api/create_room/${chatRoomUuid}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            },
        body: data
        }
    )
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        chatSocket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/'
            + chatRoomUuid + '/'
        )

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data)
            console.log(data);
            onChatMessage(data)
        }

        chatSocket.onopen = function(e) {
            console.log('Chat socket opened')
            scrollToBottom()
        }

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly')
        }
    })
}



/**
 * Event listeners
 */

chatOpenElement.addEventListener('click', (e) => {
    e.preventDefault()

    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')
})

chatJoinElement.addEventListener('click', (e) => {
    e.preventDefault()

    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    joinChatRoom()
})

chatSubmitElement.addEventListener('click', (e) => {
    e.preventDefault()
   sendMessage()
})