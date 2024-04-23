
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
const chatinputElement = document.querySelector('#chat_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')


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
            chatLogElement.value += data.message + '\n'
        }

        chatSocket.onopen = function(e) {
            console.log('Chat socket opened')
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