class Chat extends Component {
    #messageInput = null;
    #messagesContainer = null;
    #messages = {};
    #conversations = {};
    #conversationId = null;
    #tiers = [
        {'name': 'Breaking the Fourth Wall', 'color': 'rgb(124, 124, 124)'},
        {'name': 'Characters That Have Variants', 'color': 'rgb(124, 10, 2)'},
        {'name': 'Characters That Have Detailed Prompts', 'color': 'rgb(230, 118, 66)'},
        {'name': 'Other Characters (chat may not be as detailed)', 'color': 'rgb(255, 166, 74)'}
    ];

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
        let realms = this.getController().getRealms();
        let data = this.#createForm('list');
        let listResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (listResponse == null || !listResponse.success || !listResponse.hasOwnProperty('conversations')) {
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

        let now = new Date();
        let conversations = listResponse.conversations;
        conversations.forEach(function(conversation){
            let conversationId = conversation.id;
            controller.#conversations[conversationId] = conversation;
            if (controller.#conversationId != null) return;

            let character = characters.getCharacter(conversation.target_persona_id);
            let realm = realms.getRealm(conversation.target_realm_id);
            let chatContainer = document.createElement('div');

            chatContainer.className = 'conversationContainer';
            chatContainer.addEventListener('click', function() {
                controller.#resume(conversationId);
            });

            if (conversation.source_persona_id != null) {
                let character = characters.getCharacter(conversation.source_persona_id);
                let portrait = document.createElement('div');
                portrait.className = 'portrait small';
                portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
                chatContainer.appendChild(portrait);
            }

            let portrait = document.createElement('div');
            portrait.className = 'portrait small';
            if (realm != null) {
                portrait.style.backgroundImage = 'url(' + realms.getPortrait(realm.id) + ')';
            } else {
                portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
            }
            chatContainer.appendChild(portrait);

            let chatTitle = document.createElement('div');
            chatTitle.className = 'chatTitle';
            chatTitle.innerText = conversation.title;
            chatContainer.appendChild(chatTitle);
            Utilities.createDiv('toolbarFiller', chatContainer);

            let timeDiv = Utilities.createDiv('chatTimeContainer', chatContainer);
            let updatedTime = new Date(conversation.updated);
            let updatedDays = Math.floor((now.getTime() - updatedTime.getTime()) / 1000 / 3600 / 24);
            if (updatedDays > 0) {
                timeDiv.innerText = updatedDays + 'd';
            }

            let deleteContainer = document.createElement('div');
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#x1f5d1;'
            deleteContainer.appendChild(deleteButton);
            chatContainer.appendChild(deleteContainer);
            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation();
                controller.#deleteChat(conversation, chatContainer);
            });

            container.appendChild(chatContainer);
        });

        if (this.#conversationId != null) {
            this.#resume(this.#conversationId);
        }
    }

    async #deleteChat(conversation, container) {
        let confirmMessage = "Are you sure you want to delete this chat?\n\n";
        confirmMessage += conversation.title + "\n\n";
        confirmMessage += "This cannot be undone!";
        if (!confirm(confirmMessage)) {
            return;
        }

        let data = this.#createForm('delete');
        data.append('chat_id', conversation.id);
        let deleteResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (!deleteResponse.success) {
            alert("Something went wrong, sorry!\n\n" + deleteResponse.message);
            return;
        }

        delete this.#conversations[conversation.id];
        container.remove();
    }

    #createPortrait(character, name) {
        let characters = this.getController().getCharacters();
        name = typeof(name) === 'undefined' ? character.name : name;
        let portraitContainer = document.createElement('div');
        portraitContainer.className = 'portraitContainer';

        let portraitName = document.createElement('div');
        portraitName.className = 'portraitName';
        portraitName.dataset.character = character.id;
        portraitName.innerText = name;
        portraitContainer.appendChild(portraitName);

        let portrait = document.createElement('div');
        portrait.className = 'portrait';
        portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
        portraitContainer.appendChild(portrait);

        return portraitContainer;
    }

    #sortCharacters(characterList) {
        characterList.forEach(function(character) {
            if (character.chat == null) character.chat_tier = 3;
            else if (character.chat.hasOwnProperty('alternatives') && character.chat.alternatives.length > 0) character.chat_tier = 1;
            else character.chat_tier = 2;
        });

        characterList.sort(function(a, b) {
            if (a.chat_tier != b.chat_tier) {
                return a.chat_tier < b.chat_tier ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        return characterList;
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
        characterList = this.#sortCharacters(characterList);
        let currentTier = -1;
        characterList.forEach(function(character){
            if (currentTier != character.chat_tier) {
                currentTier = character.chat_tier;
                let tier = controller.#tiers[currentTier];
                let header = Utilities.createDiv('characterGroupHeader', newChatCharacters);
                Utilities.createSpan('', header, tier.name);
                header.style.backgroundColor = tier.color;
            }

            let portraitContainer = controller.#createPortrait(character);
            portraitContainer.addEventListener('click', function() {
                if (character.chat != null && character.chat.hasOwnProperty('alternatives') && character.chat.alternatives.length > 0) {
                    controller.#chooseAlternative(character.id, function(alternativeIndex) {
                        controller.#chooseSource(character.id, alternativeIndex);
                    });
                } else {
                    controller.#chooseSource(character.id, null);
                }
            });
            newChatCharacters.appendChild(portraitContainer);
        });
    }

    #chooseAlternative(characterId, callback) {
        let container = this.getElement();
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterId);

        Utilities.empty(container);

        let newChatHeader = Utilities.createDiv('newChatHeader', container);
        newChatHeader.innerText = 'What version of ' + character.name +'?';

        let newChatCharacters = Utilities.createDiv('chatCharacterList', container);
        let alternativeList = [{index: null, label: 'Present Day'}];
        for (let i = 0; i < character.chat.alternatives.length; i++) {
            let alternative = character.chat.alternatives[i];
            let label = alternative.hasOwnProperty('label') ? alternative.label : 'Alternative#' + index;
            alternativeList.push({index: i, label: label});
        }

        for (let i = 0; i < alternativeList.length; i++) {
            let alternative = alternativeList[i];
            let portraitContainer = this.#createPortrait(character, alternative.label);
            portraitContainer.addEventListener('click', function() {
                callback(alternative.index);
            });
            newChatCharacters.appendChild(portraitContainer);
        }
    }

    #chooseSource(targetCharacterId, targetAlternativeIndex, realmId) {
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
                controller.#newChat(targetCharacterId, null, targetAlternativeIndex, null, false, realmId);
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
            controller.#newChat(targetCharacterId, null, targetAlternativeIndex, null, true, realmId);
        });
        newChatCharacters.appendChild(portraitContainer);

        let characters = this.getController().getCharacters();
        let characterList = characters.getCharacterList();
        characterList = this.#sortCharacters(characterList);
        let currentTier = -1;
        characterList.forEach(function(character){
            if (currentTier != character.chat_tier) {
                currentTier = character.chat_tier;
                let tier = controller.#tiers[currentTier];
                let header = Utilities.createDiv('characterGroupHeader', newChatCharacters);
                Utilities.createSpan('', header, tier.name);
                header.style.backgroundColor = tier.color;
            }
            let portraitContainer = controller.#createPortrait(character);
            portraitContainer.addEventListener('click', function() {
                if (character.chat != null && character.chat.hasOwnProperty('alternatives') && character.chat.alternatives.length > 0) {
                    controller.#chooseAlternative(character.id, function(alternativeIndex) {
                        controller.#newChat(targetCharacterId, character.id, targetAlternativeIndex, alternativeIndex, false, realmId);
                    });
                } else {
                    controller.#newChat(targetCharacterId, character.id, targetAlternativeIndex, null, false, realmId);
                }
            });
            newChatCharacters.appendChild(portraitContainer);
        });
    };

    startRealmChat(realmId) {
        this.#chooseSource(null, null, realmId);
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
        let targetRealmId = conversation.target_realm_id;
        this.#showChat(targetCharacterId, targetRealmId);
        let controller = this;
        resumeResponse.messages.forEach(function(message){
            if (message.role == 'system') return;
            controller.addMessageObject(message, targetCharacterId, targetRealmId);
        });
    }

    async #newChat(targetCharacterId, sourceCharacterId, targetAlternative, sourceAlternative, anonymous, targetRealmId) {
        let characters = this.getController().getCharacters();
        let realms = this.getController().getRealms();
        let character = null;
        let realm = null;
        let targetName = null;
        if (targetRealmId != null) {
            realm = realms.getRealm(targetRealmId);
            if (realm == null) {
                alert("Sorry, something went wrong!");
                return;
            }
            targetName = realm.name;
        } else {
            character = characters.getCharacter(targetCharacterId);
            if (character == null) {
                alert("Sorry, something went wrong!");
                return;
            }
            targetName = character.name;

            if (targetAlternative != null && character.chat.alternatives[targetAlternative].hasOwnProperty('label')) {
                targetName += ' (' + character.chat.alternatives[targetAlternative].label + ')';
            }
        }
        let title = 'Chat with ' + targetName;
        let sourceCharacter = sourceCharacterId == null ? null : characters.getCharacter(sourceCharacterId);
        if (sourceCharacter != null) {
            let sourceName = sourceCharacter.name;
            if (sourceAlternative != null && sourceCharacter.chat.alternatives[sourceAlternative].hasOwnProperty('label')) {
                sourceName += ' (' + sourceCharacter.chat.alternatives[sourceAlternative].label + ')';
            }
            title = 'Chat between ' + sourceName + ' and ' + targetName;
        }

        let data = this.#createForm('start');
        data.append('title', title);
        if (targetAlternative != null) {
            data.append('target_alternative_id', targetAlternative);
        }
        if (sourceCharacterId != null) {
            data.append('source_persona_id', sourceCharacterId);
        }
        if (sourceAlternative != null) {
            data.append('source_alternative_id', sourceAlternative);
        }
        if (anonymous) {
            data.append('anonymous', true);
        }
        if (targetRealmId != null) {
            data.append('target_realm_id', targetRealmId);
        } else {
            data.append('target_persona_id', targetCharacterId);
        }
        let startResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (startResponse == null || !startResponse.success || !startResponse.hasOwnProperty('conversation')) {
            alert("Sorry, something went wrong!");
            return;
        }

        let conversation = startResponse.conversation;
        this.#conversationId = conversation.id;
        this.#conversations[conversation.id] = conversation;
        this.#showChat(targetCharacterId, targetRealmId);
    }

    #showChat(characterKey, realmId) {
        let controller = this;
        let target = null;
        if (realmId != null) {
            target = this.getController().getRealms().getRealm(realmId);
        } else {
            let characters = this.getController().getCharacters();
            target = characters.getCharacter(characterKey);
        }
        if (target == null) {
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
        input.placeholder = 'Send a message to ' + target.name;
        this.#messageInput = input;
        chatInput.appendChild(input);
        let button = document.createElement('button');
        button.innerHTML = '&uarr;';
        button.onclick = function(event) {
            event.preventDefault();
            input.focus();
            controller.sendMessage();
        };
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

    addMessageObject(message, characterId, realmId) {
        this.#messages[message.id] = message;
        this.addMessage(message.role, message.content, characterId, message.id, realmId);
    }

    addMessage(role, message, characterId, messageId, realmId, rawMessage) {
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
                icon.style.backgroundImage = 'url(' + characters.getPortrait(conversation.source_persona_id) + ')';
            } else if (userCharacter != null) {
                Utilities.addClass(icon, 'portrait');
                Utilities.addClass(icon, 'small');
                let portrait = this.getController().getCharacters().getPortrait(userCharacter)
                icon.style.backgroundImage = 'url(' + portrait + ')';
            }
        } else if (role == 'assistant' && typeof(characterId) !== 'undefined' && characterId != null) {
            let characters = this.getController().getCharacters();
            icon.style.backgroundImage = 'url(' + characters.getPortrait(characterId) + ')';
        } else if (role == 'assistant' && typeof(realmId) !== 'undefined' && realmId != null) {
            let realms = this.getController().getRealms();
            icon.style.backgroundImage = 'url(' + realms.getPortrait(realmId) + ')';
        }

        let content = Utilities.createDiv('content', messageDiv);
        if (!rawMessage) {
            message = Utilities.convertMarkdown(Utilities.convertFromHTML(message));
        }
        content.innerHTML = message;

        if (messageId !== 'undefined') {
            this.makeEditable(messageId, messageDiv);
        }

        this.scrollToBottom();
        return messageDiv;
    }

    editMessage(messageId, messageDiv, contentDiv) {
        if (!this.#messages.hasOwnProperty(messageId)) {
            return;
        }

        // Check if already editing
        if (contentDiv.style.display == 'none') return;

        Utilities.setVisible(contentDiv, false);

        let content = this.#messages[messageId].content;
        let editorDiv = Utilities.createDiv('messageEditorContainer', messageDiv);
        let textDiv = Utilities.createDiv('messageTextAreaContainer', editorDiv);
        let editorInput = document.createElement('textarea');
        editorInput.rows = 8;
        editorInput.cols = 24;
        editorInput.value = Utilities.convertFromHTML(content);
        textDiv.appendChild(editorInput);
        let editorToolbar = Utilities.createDiv('messageEditorToolbar', editorDiv);
        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#x1f5d1;'
        editorToolbar.appendChild(deleteButton);
        Utilities.createSpan('toolbarFiller', editorToolbar);
        let cancelButton = document.createElement('button');
        cancelButton.innerText = 'Cancel';
        editorToolbar.appendChild(cancelButton);
        let saveButton = document.createElement('button');
        saveButton.innerText = 'Save';
        editorToolbar.appendChild(saveButton);

        editorInput.focus();

        let controller = this;
        cancelButton.addEventListener('click', function() {
            Utilities.setVisible(contentDiv, true);
            editorDiv.remove();
        });

        saveButton.addEventListener('click', async function() {
            let editedContent = editorInput.value;
            let content = Utilities.convertMarkdown(editedContent);
            // Looks like the markdown process converts tags anyway
            // content = Utilities.convertToHTML(content);
            contentDiv.innerHTML = content;
            controller.#messages[messageId].content = content;
            Utilities.setVisible(contentDiv, true);
            editorDiv.remove();

            // save edited message
            let conversation = controller.getConversation();
            let data = controller.#createForm('edit');
            data.append("chat_id", conversation.id);
            data.append("message_id", messageId)
            data.append("message", editedContent);

            // edit message
            let editResponse = await fetch( "data/chat.php", {
                method: "POST",
                body: data
            } ).then((response) => {
                return response.json();
            });
            if (editResponse == null || !editResponse.success) {
                alert("Sorry, something went wrong!");
                return;
            }
        });

        deleteButton.addEventListener('click', async function() {
            if (confirm("Are you sure you want to delete this message\n\nAND ALL MESSAGES AFTER?\n\nThis cannot be undone!")) {
                controller.#deleteMessage(messageId);
            } else {
                Utilities.setVisible(contentDiv, true);
                editorDiv.remove();
            }
        });
    }

    async #deleteMessage(messageId) {
        let data = this.#createForm('delete_message');
        data.append('chat_id', this.#conversationId);
        data.append('message_id', messageId);
        let deleteResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });

        if (!deleteResponse.success) {
            alert("Something went wrong, sorry!\n\n" + deleteResponse.message);
            return;
        }
        this.#resume(this.#conversationId);
    }

    updateMessage(container, message) {
        const content = container.querySelector(".content");
        content.innerHTML = Utilities.convertMarkdown(message);
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
        let characterId = conversation.target_persona_id;
        let realmId = conversation.target_realm_id;

        // send message
        let data = this.#createForm('message');
        data.append("chat_id", conversation.id);
        data.append("message", question);

        // send message and get message id
        let messageResponse = await fetch( "data/chat.php", {
            method: "POST",
            body: data
        } ).then((response) => {
            return response.json();
        });
        if (messageResponse == null || !messageResponse.hasOwnProperty('message') || !messageResponse.success) {
            alert("Sorry, something went wrong!");
            return;
        }

        // Add user message to chat list
        this.addMessageObject(messageResponse.message);

        // initialize response message with blinking cursor
        let message = this.addMessage( 'assistant', '<div id="cursor"></div>', characterId, null, realmId, true);

        // empty the message input field
        this.#messageInput.value = '';

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

        eventSource.addEventListener( "stop", async function(event) {
            // The ChatGPT API emits a stopped event, but we want to wait for our custom one that contains
            // the message data
            if (event.data != 'stopped') {
                let json = JSON.parse( event.data );
                if (json.hasOwnProperty('content')) {
                    // TODO: De-duplicate this code

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
                }

                if (json.hasOwnProperty('id')) {
                    controller.#messages[json.id] = json;
                    controller.makeEditable(json.id, message);
                }
                eventSource.close();
            }
        } );

        this.#messageInput.focus();
    }

    makeEditable(messageId, messageDiv) {
        let controller = this;
        // Get inner content div
        let contentDiv = messageDiv.querySelector('.content');
        if (contentDiv == null) return;

        contentDiv.addEventListener('click', function() {
            controller.editMessage(messageId, messageDiv, contentDiv);
        });
    }

    scrollToBottom() {
        if (this.#messagesContainer == null) return;
        this.#messagesContainer.scrollTop = this.#messagesContainer.scrollHeight;
    }

    isScrolledToBottom() {
        if (this.#messagesContainer == null) return false;
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

    onResize() {
        this.scrollToBottom();
    }
}