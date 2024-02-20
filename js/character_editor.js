class CharacterEditor extends Editor {
    #characters = {};
    #profile = {};
    #characterId = null;

    constructor(element, characters, profile) {
        super(element);
        this.#characters = characters;
        this.#profile = profile;
    }

    show() {
        let controller = this;
        let container = this.getElement();
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

        let container = this.getElement();
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

        let firstNameInput = this.createInput(editorForm, {id: 'first_name', name: 'First Name'});
        firstNameInput.value = character.first_name;
        let lastNameInput = this.createInput(editorForm, {id: 'last_name', name: 'Last Name'});
        lastNameInput.value = character.last_name;

        let propertyInputs = {};
        let properties = this.#characters.getProperties();
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let propertyInput = this.createInput(editorForm, property);
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
        let descriptionInput = this.createLongInput(editorForm, {id: "description", name: "Description"}, character.description);
        let backstoryInput = this.createLongInput(editorForm, {id: "backstory", name: "Backstory"}, character.backstory);
        let chatInput = this.createLongInput(editorForm, {id: "chat", name: "Chat Prompt"}, character.chat != null ? character.chat.system : null);

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
            editor.beginSave();
            editor.#save(properties);
        });
        editorForm.addEventListener('keyup', () => {
            editor.clearSaved();
        });
        let saveContainer = Utilities.createDiv('save', editorForm);
        let saveButton = this.createSaveButton(editorForm);
        let confirmedDiv = this.createSaveConfirm(editorForm);

        saveContainer.appendChild(saveButton);
        saveContainer.appendChild(confirmedDiv);
    }

    #save(properties) {
        let user = this.#profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        let editor = this;
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function() {
            editor.processSave(this.response);
        };
        request.onerror = function() {
            editor.saveFailed();
        };

        request.open("POST", "data/editor.php?action=save_character&character=" + this.#characterId
            + '&user=' + user.id
            + '&token=' + user.token
            + '&properties=' + encodeURIComponent(JSON.stringify(properties)), true);
        request.send();
    }
}