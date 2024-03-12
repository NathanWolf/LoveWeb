class Chat extends Component {
    #messageInput = null;
    #messages = null;
    #characterId = null;
    #chatId = 0;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let controller = this;
        let container = this.getElement()
        Utilities.empty(container);
        let characters = this.getController().getCharacters();
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character){
            if (character.chat == null) return;
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
            container.appendChild(portrait);
            let portraitName = document.createElement('div');
            portraitName.className = 'portraitName';
            portraitName.dataset.character = character.id;
            portraitName.innerText = character.name;
            portraitName.addEventListener('click', function(event) {
                controller.onPortraitClick(event.target);
            })
            container.appendChild(portraitName);
        });
    }

    onPortraitClick(portrait) {
        let characterKey = portrait.dataset.character;
        this.#selectCharacter(characterKey);
    }

    #selectCharacter(characterKey) {
        let controller = this;
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }

        this.#characterId = characterKey;
        this.getController().getHistory().set('character', characterKey);

        let container = this.getElement();
        Utilities.empty(container);

        let chatWindow = Utilities.createDiv('chatContainer', container);
        this.#messages = Utilities.createDiv('chatMessages', chatWindow);
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
        let messageDiv = Utilities.createDiv('message ' + role, this.#messages);
        let icon = Utilities.createDiv('identity', messageDiv);
        let userCharacter = this.getController().getProfile().getCharacterId();
        if (userCharacter != null) {
            Utilities.addClass(icon, 'portrait');
            Utilities.addClass(icon, 'small');
            let portrait = this.getController().getCharacters().getPortrait(userCharacter)
            icon.style.backgroundImage = 'url(' + portrait + ')';
        }

        let content = Utilities.createDiv('content', messageDiv);
        content.innerHTML = message;
        if (typeof(characterId) !== 'undefined') {
            let characters = this.getController().getCharacters();
            icon.style.backgroundImage = 'url(' + characters.getPortrait(characterId) + ')';
        }

        this.#messages.scrollTop = this.#messages.scrollHeight;
        return messageDiv;
    }

    updateMessage(container, message) {
        const content = container.querySelector(".content");
        content.innerHTML  = Utilities.convertMarkdown(message);
    }

    async sendMessage() {
        let question = Utilities.escapeHtml(this.#messageInput.value);
        let controller = this;
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(this.#characterId);

        // Add user message to chat list
        this.addMessage('user', question);

        // Send message and await response

        // initialize message with blinking cursor
        let message = this.addMessage( 'assistant', '<div id="cursor"></div>', this.#characterId);

        // empty the message input field
        this.#messageInput.value = '';

        // send message
        let data = new FormData();
        data.append("chat_id", this.#chatId);
        data.append("message", question);
        data.append('system', character.chat.system);

        // send message and get chat id
        this.#chatId = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.text();
        });

        // listen for response tokens
        const eventSource = new EventSource(
            "data/chat.php?chat_id=" + this.#chatId
        );

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
        this.#messages.scrollTop = this.#messages.scrollHeight;
    }

    isScrolledToBottom() {
        return (Math.ceil(this.#messages.scrollTop) + this.#messages.offsetHeight) >= this.#messages.scrollHeight;
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
        let character = history.get('character');
        if (this.#characterId != character) {
            if (character == null) {
                this.show();
            } else {
                this.#selectCharacter(character);
            }
        }
    }

    deactivate() {
        this.getController().getHistory().unset('character');
    }
}