class Editor {
    #element = null;
    #characters = {};
    #profile = {};
    #characterId = null;
    #saveButton = null;
    #confirmedElement = null;

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

    #createInput(editorForm, property) {
        let propertySection = document.createElement('section');
        editorForm.appendChild(propertySection);
        let propertyLabel = document.createElement('label');
        propertyLabel.for = 'propertyInput-' + property.id;
        propertyLabel.innerText = property.name;
        let propertyInput = document.createElement('input');
        propertyInput.id = 'propertyInput-' + property.id;
        propertyInput.size = 50;
        propertySection.appendChild(propertyLabel);
        propertySection.appendChild(propertyInput);
        return propertyInput;
    }

    #createLongInput(editorForm, property, value) {
        let section = document.createElement('section');
        editorForm.appendChild(section);
        let label = document.createElement('label');
        label.for = 'input-' + property.id;
        label.innerText = property.name;
        let input = document.createElement('textarea');
        input.id = 'input-' + property.id;
        input.rows = 10;
        input.cols = 80;
        section.appendChild(label);
        section.appendChild(input);
        if (value != null) {
            input.value = value;
        }
        return input;
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

        let firstNameInput = this.#createInput(editorForm, {id: 'first_name', name: 'First Name'});
        firstNameInput.value = character.first_name;
        let lastNameInput = this.#createInput(editorForm, {id: 'last_name', name: 'Last Name'});
        lastNameInput.value = character.last_name;

        let propertyInputs = {};
        let properties = this.#characters.getProperties();
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let propertyInput = this.#createInput(editorForm, property);
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
        let descriptionInput = this.#createLongInput(editorForm, {id: "description", name: "Description"}, character.description);
        let backstoryInput = this.#createLongInput(editorForm, {id: "backstory", name: "Backstory"}, character.backstory);
        let chatInput = this.#createLongInput(editorForm, {id: "chat", name: "Chat Prompt"}, character.chat != null ? character.chat.system : null);

        let saveButton = document.createElement('button');
        saveButton.className = 'save';
        saveButton.innerText = 'Save';
        this.#saveButton = saveButton;
        let editor = this;
        editorForm.addEventListener('submit', () => {
            let properties = {};
            for (let key in propertyInputs) {
                if (propertyInputs.hasOwnProperty(key)) {
                    properties[key] = propertyInputs[key].value;
                    if (properties[key].length == 0) {
                        delete character.properties[key];
                    } else {
                        character.properties[key] = properties[key];
                    }
                }
            }
            character.description = descriptionInput.value;
            properties['description'] = descriptionInput.value;
            character.backstory = backstoryInput.value;
            properties['backstory'] = backstoryInput.value;
            if (chatInput.value.length > 0) {
                character.chat = {system: chatInput.value};
            } else {
                character.chat = null;
            }
            properties['chat'] = chatInput.value;
            properties['first_name'] = firstNameInput.value;
            properties['last_name'] = lastNameInput.value;
            character.first_name = firstNameInput.value;
            character.last_name = lastNameInput.value;
            character.name = character.first_name;
            character.full_name = character.first_name;
            if (lastNameInput.value.length > 0) {
                character.full_name += ' ' + lastNameInput.value;
            }
            saveButton.disabled = true;
            editor.#save(properties);
        });
        editorForm.addEventListener('keyup', () => {
            editor.#clearSaved();
        });
        let saveContainer = Utilities.createDiv('save', editorForm);
        let confirmedDiv = Utilities.createDiv('confirmed', editorForm);
        confirmedDiv.innerHTML = '&#9989;'
        confirmedDiv.style.display = 'none';
        this.#confirmedElement = confirmedDiv;
        saveContainer.appendChild(saveButton);
        saveContainer.appendChild(confirmedDiv);
    }

    #save(properties) {
        let user = this.#profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        const request = new XMLHttpRequest();
        let profile = this;
        request.onload = function() {
            profile.#processSave(this.response);
        };
        request.responseType = 'json';
        let saveButton = this.#saveButton;
        request.onerror = function() {
            alert("Failed to save, sorry!");
            saveButton.disabled = false;
        };

        request.open("POST", "data/editor.php?action=save_character&character=" + this.#characterId
            + '&user=' + user.id
            + '&token=' + user.token
            + '&properties=' + encodeURIComponent(JSON.stringify(properties)), true);
        request.send();
    }

    #processSave(response) {
        if (!response.success) {
            alert("An error occurred saving, please try again: " + response.message)
        }

        this.#saveButton.disabled = false;
        this.#confirmedElement.style.display = 'block';
    }

    #clearSaved() {
        if (this.#confirmedElement != null) {
            this.#confirmedElement.style.display = 'none';
        }
    }
}