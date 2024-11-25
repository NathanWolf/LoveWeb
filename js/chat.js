class Chat extends Component {
    #messageInput = null;
    #messagesContainer = null;
    #conversations = {};
    #conversationId = null;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let container = this.getElement();
        Utilities.empty(container);
        this.#listChats();
    }

    #createForm(action) {
        let data = new FormData();
        let user = this.getController().getProfile().getUser();
        data.append('action', action);
        if (user != null) {
            data.append('user_id', user.id);
            data.append('user_token', user.token);
        }
        return data;
    }

    async #listChats() {
        // Get list of chats
        let container = this.getElement();
        let controller = this;
        let characters = this.getController().getCharacters();
        let data = this.#createForm('list');
        let listResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (listResponse == null || !listResponse.hasOwnProperty('conversations')) {
            alert("Sorry, something went wrong!");
            return;
        }

        // Add "new chat" row
        let newChatContainer = document.createElement('div');

        newChatContainer.className = 'conversationContainer';
        newChatContainer.addEventListener('click', function() {
            controller.#startNewChat();
        });

        let newChatIcon = document.createElement('div');
        newChatIcon.className = 'portrait small newChat';
        newChatContainer.appendChild(newChatIcon);

        let newChatTitle = document.createElement('div');
        newChatTitle.className = 'chatTitle';
        newChatTitle.innerText = 'New Chat...';
        newChatContainer.appendChild(newChatTitle);

        container.appendChild(newChatContainer);

        let conversations = listResponse.conversations;
        conversations.forEach(function(conversation){
            let conversationId = conversation.id;
            controller.#conversations[conversationId] = conversation;
            if (controller.#conversationId != null) return;

            let character = characters.getCharacter(conversation.target_persona_id);
            let chatContainer = document.createElement('div');

            chatContainer.className = 'conversationContainer';
            chatContainer.addEventListener('click', function() {
                controller.#resume(conversationId);
            });

            let portrait = document.createElement('div');
            portrait.className = 'portrait small';
            portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
            chatContainer.appendChild(portrait);

            let chatTitle = document.createElement('div');
            chatTitle.className = 'chatTitle';
            chatTitle.innerText = conversation.title;
            chatContainer.appendChild(chatTitle);

            container.appendChild(chatContainer);
        });

        if (this.#conversationId != null) {
            this.#resume(this.#conversationId);
        }
    }

    #createPortrait(character) {
        let characters = this.getController().getCharacters();
        let portraitContainer = document.createElement('div');
        portraitContainer.className = 'portraitContainer';

        let portraitName = document.createElement('div');
        portraitName.className = 'portraitName';
        portraitName.dataset.character = character.id;
        portraitName.innerText = character.name;
        portraitContainer.appendChild(portraitName);

        let portrait = document.createElement('div');
        portrait.className = 'portrait';
        portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
        portraitContainer.appendChild(portrait);

        return portraitContainer;
    }

    #startNewChat() {
        let container = this.getElement();
        let controller = this;
        Utilities.empty(container);

        let newChatHeader = document.createElement('div');
        newChatHeader.innerText = 'Who do you want to chat with?';
        newChatHeader.className = 'newChatHeader';
        container.appendChild(newChatHeader);

        let characters = this.getController().getCharacters();
        let characterList = characters.getCharacterList();
        let newChatCharacters = document.createElement('div');
        newChatCharacters.className = 'chatCharacterList';
        container.appendChild(newChatCharacters);
        characterList.forEach(function(character){
            if (character.chat == null) return;
            let portraitContainer = controller.#createPortrait(character);
            portraitContainer.addEventListener('click', function() {
                controller.#chooseSource(character.id);
            });
            newChatCharacters.appendChild(portraitContainer);
        });
    }

    #chooseSource(targetCharacterId) {
        let container = this.getElement();
        let controller = this;
        Utilities.empty(container);

        let newChatHeader = document.createElement('div');
        newChatHeader.innerText = 'Who do you want to chat as?';
        newChatHeader.className = 'newChatHeader';
        container.appendChild(newChatHeader);

        let newChatCharacters = document.createElement('div');
        newChatCharacters.className = 'chatCharacterList';
        container.appendChild(newChatCharacters);

        let user = this.getController().getProfile().getUser();
        if (user != null) {
            let portraitContainer = document.createElement('div');
            portraitContainer.className = 'portraitContainer';

            let portraitName = document.createElement('div');
            portraitName.className = 'portraitName';
            portraitName.innerText = 'Myself';
            portraitContainer.appendChild(portraitName);

            let portrait = document.createElement('div');
            portrait.className = 'portrait ';
            let userCharacter = this.getController().getProfile().getCharacterId();
            if (userCharacter != null) {
                let portraitUrl = this.getController().getCharacters().getPortrait(userCharacter)
                portrait.style.backgroundImage = 'url(' + portraitUrl + ')';
            }
            portraitContainer.appendChild(portrait);

            portraitContainer.addEventListener('click', function() {
                // TODO: Make this cool
                controller.#newChat(targetCharacterId, null);
            });
            newChatCharacters.appendChild(portraitContainer);
        }

        let portraitContainer = document.createElement('div');
        portraitContainer.className = 'portraitContainer';

        let portraitName = document.createElement('div');
        portraitName.className = 'portraitName';
        portraitName.innerText = 'Anonymous';
        portraitContainer.appendChild(portraitName);

        let portrait = document.createElement('div');
        portrait.className = 'portrait anonymous';
        portraitContainer.appendChild(portrait);

        portraitContainer.addEventListener('click', function() {
            controller.#newChat(targetCharacterId, null);
        });
        newChatCharacters.appendChild(portraitContainer);

        let characters = this.getController().getCharacters();
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character){
            if (character.chat == null) return;
            let portraitContainer = controller.#createPortrait(character);
            portraitContainer.addEventListener('click', function() {
                controller.#newChat(targetCharacterId, character.id);
            });
            newChatCharacters.appendChild(portraitContainer);
        });
    };

    async #resume(conversationId) {
        this.#conversationId = conversationId;
        if (!this.#conversations.hasOwnProperty(conversationId)) {
            // We will try to resume it on load?
            return;
        }
        let conversation = this.#conversations[conversationId];
        this.getController().getHistory().set('chat', conversationId);

        let data = this.#createForm('resume');
        data.append('chat_id', conversationId);
        let resumeResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (resumeResponse == null || !resumeResponse.hasOwnProperty('messages')) {
            alert("Sorry, something went wrong!");
            return;
        }

        let targetCharacterId = conversation.target_persona_id;
        this.#showChat(targetCharacterId);
        let controller = this;
        resumeResponse.messages.forEach(function(message){
            if (message.role == 'system') return;
            controller.addMessage(message.role, message.content, targetCharacterId);
        });
    }

    async #newChat(targetCharacterId, sourceCharacterId) {
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(targetCharacterId);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        let sourceCharacter = sourceCharacterId == null ? null : characters.getCharacter(sourceCharacterId);
        let title = 'Chat with ' + character.name;
        if (sourceCharacter != null) {
            title = 'Chat between ' + sourceCharacter.name + ' and ' + character.name;
        }

        let data = this.#createForm('start');
        data.append('title', title);
        data.append('target_persona_id', targetCharacterId);
        if (sourceCharacterId != null) {
            data.append('source_persona_id', sourceCharacterId);
        }
        let startResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (startResponse == null || !startResponse.hasOwnProperty('conversation')) {
            alert("Sorry, something went wrong!");
            return;
        }

        let conversation = startResponse.conversation;
        this.#conversationId = conversation.id;
        this.#conversations[conversation.id] = conversation;
        this.#showChat(targetCharacterId);
    }

    #showChat(characterKey) {
        let controller = this;
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }

        let container = this.getElement();
        Utilities.empty(container);

        let chatWindow = Utilities.createDiv('chatContainer', container);
        this.#messagesContainer = Utilities.createDiv('chatMessages', chatWindow);
        let chatInputContainer = Utilities.createDiv('chatInputContainer', chatWindow);
        let chatInput = Utilities.createDiv('chatInput', chatInputContainer);
        let input = document.createElement('textarea');
        input.rows = 1;
        input.placeholder = 'Send a message to ' + character.name;
        this.#messageInput = input;
        chatInput.appendChild(input);
        let button = document.createElement('button');
        button.innerHTML = '&uarr;';
        button.onclick = function() { controller.sendMessage(); };
        chatInput.appendChild(button);

        input.onkeyup = function() {
            controller.onMessageKeyUp();
        };
        input.onkeydown = function(event) {
            controller.onMessageKeyDown(event);
        };

        input.focus();
    }

    onMessageKeyDown(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
            return false;
        }
    }

    addMessage(role, message, characterId) {
        let conversation = this.getConversation();
        if (conversation == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        let messageDiv = Utilities.createDiv('message ' + role, this.#messagesContainer);
        let icon = Utilities.createDiv('identity', messageDiv);
        if (role == 'user') {
            let userCharacter = this.getController().getProfile().getCharacterId();
            if (conversation.source_persona_id != null) {
                let characters = this.getController().getCharacters();
                icon.style.backgroundImage = 'url(' + characters.getPortrait(conversation.source_persona_ide) + ')';
            } else if (userCharacter != null) {
                Utilities.addClass(icon, 'portrait');
                Utilities.addClass(icon, 'small');
                let portrait = this.getController().getCharacters().getPortrait(userCharacter)
                icon.style.backgroundImage = 'url(' + portrait + ')';
            }
        } else if (role == 'assistant' && typeof(characterId) !== 'undefined') {
            let characters = this.getController().getCharacters();
            icon.style.backgroundImage = 'url(' + characters.getPortrait(characterId) + ')';
        }

        let content = Utilities.createDiv('content', messageDiv);
        content.innerHTML = message;

        this.#messagesContainer.scrollTop = this.#messagesContainer.scrollHeight;
        return messageDiv;
    }

    updateMessage(container, message) {
        const content = container.querySelector(".content");
        content.innerHTML  = Utilities.convertMarkdown(message);
    }

    getConversation() {
        if (this.#conversationId == null || !this.#conversations.hasOwnProperty(this.#conversationId)) {
            return null;
        }

        return this.#conversations[this.#conversationId];
    }

    async sendMessage() {
        let conversation = this.getConversation();
        if (conversation == null) {
            alert("Not in a conversation, can't send message");
            return;
        }

        let question = Utilities.escapeHtml(this.#messageInput.value);
        let controller = this;
        let characters = this.getController().getCharacters();
        let characterId = conversation.target_persona_id;
        let character = characters.getCharacter(characterId);

        // Add user message to chat list
        this.addMessage('user', question);

        // Send message and await response

        // initialize message with blinking cursor
        let message = this.addMessage( 'assistant', '<div id="cursor"></div>', characterId);

        // empty the message input field
        this.#messageInput.value = '';

        // send message
        let data = this.#createForm('message');
        data.append("chat_id", conversation.id);
        data.append("message", question);

        // send message and get chat id
        let messageResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });
        if (messageResponse == null || !messageResponse.hasOwnProperty('conversation_id')) {
            alert("Sorry, something went wrong!");
            return;
        }

        // listen for response tokens
        let eventUrl = "data/chat.php?action=stream&chat_id=" + conversation.id;
        let user = this.getController().getProfile().getUser();
        if (user != null) {
            eventUrl += "&user_id=" + user.id + "&user_token=" + user.token;
        }
        const eventSource = new EventSource(eventUrl);

        // handle errors
        eventSource.addEventListener( "error", function() {
            controller.updateMessage(message, "Sorry, there was an error in the request. Check your error logs." );
        } );

        // Initialize ChatGPT response
        let response = "";
        let paragraph = "";

        // when a new token arrives
        eventSource.addEventListener( "message", function( event ) {
            let json = JSON.parse( event.data );

            // append token to response
            response += json.content;
            paragraph += json.content;

            if(paragraph.indexOf( "\n\n" ) !== -1) {
                paragraph = "";
            }

            let scrolled = controller.isScrolledToBottom();

            // update message in UI
            controller.updateMessage(message, response);

            if (scrolled) {
                controller.scrollToBottom();
            }
        });

        eventSource.addEventListener( "stop", async function() {
            eventSource.close();
        } );

        this.#messageInput.focus();
    }

    scrollToBottom() {
        this.#messagesContainer.scrollTop = this.#messagesContainer.scrollHeight;
    }

    isScrolledToBottom() {
        return (Math.ceil(this.#messagesContainer.scrollTop) + this.#messagesContainer.offsetHeight) >= this.#messagesContainer.scrollHeight;
    }

    onMessageKeyUp() {
        this.#messageInput.style.height = "auto";
        let height = this.#messageInput.scrollHeight + 2;
        if( height > 200 ) {
            height = 200;
        }
        this.#messageInput.style.height = height + "px";
    }

    getTitle() {
        return 'Chat';
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let conversationHistory = history.get('chat');
        let conversation = this.getConversation();
        let conversationId = conversation == null ? null : conversation.id;
        if (conversationId != conversationHistory) {
            if (conversationHistory == null) {
                this.show();
            } else {
                this.#resume(conversationHistory);
            }
        }
    }

    deactivate() {
        this.#conversationId = null;
        this.getController().getHistory().unset('chat');
    }
}