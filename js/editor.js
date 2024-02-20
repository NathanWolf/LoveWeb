class Editor {
    #element = null;
    #characters = {};
    #profile = {};
    #characterId = null;

    constructor(element, characters, profile) {
        this.#element = element;
        this.#characters = characters;
        this.#profile = profile;
    }

    show() {
        let controller = this;
        let container = controller.#element;
        Utilities.empty(container);
        let characters = this.#characters;
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character){
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
        let characters = this.#characters;
        let characterKey = portrait.dataset.character;
        let character = this.#characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }

        this.#characterId = characterKey;

        let container = this.#element;
        Utilities.empty(container);

        let headerContainer = Utilities.createDiv('editorHeader', container);
        let portraitImage = document.createElement('div');
        portraitImage.className = 'editingPortrait';
        portraitImage.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
        headerContainer.appendChild(portraitImage);

        let portraitName = document.createElement('div');
        portraitName.innerText = 'Editing ' + character.name;
        headerContainer.appendChild(portraitName);

        let editorContainer = Utilities.createDiv('editing', container);
        let editorForm = document.createElement('form');
        editorContainer.appendChild(editorForm);

        let propertyInputs = {};
        let properties = this.#characters.getProperties();
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let propertySection = document.createElement('section');
            editorForm.appendChild(propertySection);
            let propertyLabel = document.createElement('label');
            propertyLabel.for = 'propertyInput-' + propertyId;
            propertyLabel.innerText = property.name;
            let propertyInput = document.createElement('input');
            propertyInput.id = 'propertyInput-' + propertyId;
            propertyInput.size = 50;
            propertySection.appendChild(propertyLabel);
            propertySection.appendChild(propertyInput);

            if (character.properties != null && character.properties.hasOwnProperty(propertyId)) {
                propertyInput.value = character.properties[propertyId];
            }
            propertyInputs[propertyId] = propertyInput;
        }

        let backstorySection = document.createElement('section');
        editorForm.appendChild(backstorySection);
        let backstoryLabel = document.createElement('label');
        backstoryLabel.for = 'backstoryInput';
        backstoryLabel.innerText = 'Backstory'
        let backstoryInput = document.createElement('textarea');
        backstoryInput.id = 'backstoryInput';
        backstoryInput.rows = 10;
        backstoryInput.cols = 80;
        backstorySection.appendChild(backstoryLabel);
        backstorySection.appendChild(backstoryInput);
        if (character.backstory != null) {
            backstoryInput.value = character.backstory;
        }

        let chatSection = document.createElement('section');
        editorForm.appendChild(chatSection);
        let chatLabel = document.createElement('label');
        chatLabel.for = 'chatInput';
        chatLabel.innerText = 'Chat Prompt'
        let chatInput = document.createElement('textarea');
        chatInput.id = 'chatInput';
        chatInput.rows = 10;
        chatInput.cols = 80;
        chatSection.appendChild(chatLabel);
        chatSection.appendChild(chatInput);
        if (character.chat != null) {
            chatInput.value = character.chat.system;
        }

        let saveButton = document.createElement('button');
        saveButton.className = 'save';
        saveButton.innerText = 'Save';
        let editor = this;
        editorForm.addEventListener('submit', () => {
            let properties = {};
            for (let key in propertyInputs) {
                if (propertyInputs.hasOwnProperty(key)) {
                    properties[key] = propertyInputs[key].value;
                    character.properties[key] = properties[key];
                }
            }
            character.backstory = backstoryInput.value;
            properties['backstory'] = backstoryInput.value;
            if (chatInput.value.length > 0) {
                character.chat = {system: chatInput.value};
            } else {
                character.chat = null;
            }
            properties['chat'] = chatInput.value;
            saveButton.disabled = true;
            editor.#save(properties, saveButton);
        });
        editorForm.appendChild(saveButton);
    }

    #save(properties, saveButton) {
        let user = this.#profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        const request = new XMLHttpRequest();
        let profile = this;
        request.onload = function() {
            profile.#processSave(this.response, saveButton);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to save, sorry!"); saveButton.disabled = false; };

        request.open("POST", "data/editor.php?action=save_character&character=" + this.#characterId
            + '&user=' + user.id
            + '&token=' + user.token
            + '&properties=' + encodeURIComponent(JSON.stringify(properties)), true);
        request.send();
    }

    #processSave(response, saveButton) {
        if (!response.success) {
            alert("An error occurred saving, please try again: " + response.message)
        }
        saveButton.disabled = false;
    }
}