class CharacterEditor extends Editor {
    #characterId = null;
    #portraitOffset = null;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let controller = this;
        let container = this.getElement();
        Utilities.empty(container);
        let characters = this.getController().getCharacters();
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character){
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
            container.appendChild(portrait);
            let portraitName = document.createElement('div');
            portraitName.className = 'portraitNameVisible';
            portraitName.dataset.character = character.id;
            portraitName.innerText = character.name;
            portraitName.addEventListener('click', function(event) {
                controller.onPortraitClick(event.target);
            })
            container.appendChild(portraitName);
        });
    }

    onPortraitClick(portrait) {
        let characters = this.getController().getCharacters();
        let characterKey = portrait.dataset.character;
        let character = characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }

        this.#characterId = characterKey;
        this.#portraitOffset = null;

        let container = this.getElement();
        Utilities.empty(container);

        let headerContainer = Utilities.createDiv('editorHeader', container);

        let portraitName = Utilities.createDiv('editorName', headerContainer);
        portraitName.innerText = 'Editing ' + character.name;

        let portraitImage = document.createElement('div');
        portraitImage.className = 'editingPortrait';
        portraitImage.style.backgroundImage = 'url(' + characters.getImage(character.id) + ')';
        headerContainer.appendChild(portraitImage);

        let editor = this;
        let portraitStyle = getComputedStyle(portraitImage);
        let borderSize = 2 * parseFloat(portraitStyle.borderWidth);
        let portraitWidth = portraitImage.offsetWidth - borderSize;
        let portraitHeight = portraitImage.offsetHeight - borderSize;
        let portraitCenter = Utilities.createDiv('portraitCenter', portraitImage);
        let offset = character.hasOwnProperty('portrait') && character.portrait.hasOwnProperty('offset') ? character.portrait.offset : [0.5, 0.1];

        portraitImage.addEventListener('click', function(event) {
            editor.#movePortraitOffset(event.offsetX, event.offsetY, portraitWidth, portraitHeight, portraitCenter);
        });
        portraitCenter.style.left = (offset[0] * portraitWidth - 8) + 'px';
        portraitCenter.style.top = (offset[1] * portraitHeight - 8) + 'px';

        // I couldn't figure out a simpler way to get the size of this image
        // didn't end up using this, but keeping it here just in case.
        /*
        let imageSrc = portraitImage.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
        let loadImage = new Image();
        loadImage.onload = function () {
            portraitCenter.style.left = (offset[0] * loadImage.width) + 'px';
            portraitCenter.style.top = (offset[1] * loadImage.height) + 'px';
        };
        loadImage.src = imageSrc;
        */

        let saveContainer = Utilities.createDiv('save', headerContainer);
        let saveButton = this.createSaveButton(saveContainer);
        this.createSaveConfirm(saveContainer);

        let editorContainer = Utilities.createDiv('editing', container);
        let editorForm = document.createElement('form');
        editorForm.id = 'characterForm';
        editorContainer.appendChild(editorForm);

        let firstNameInput = this.createInput(editorForm, {id: 'first_name', name: 'First Name'});
        firstNameInput.value = character.first_name;
        let lastNameInput = this.createInput(editorForm, {id: 'last_name', name: 'Last Name'});
        lastNameInput.value = character.last_name;
        let propertyInputs = {};
        let properties = characters.getProperties();
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let propertyInput = this.createInput(editorForm, property);
            if (character.properties != null && character.properties.hasOwnProperty(propertyId)) {
                propertyInput.value = character.properties[propertyId];
            }
            propertyInputs[propertyId] = propertyInput;
        }

        let descriptionInput = this.createLongInput(editorForm, {id: "description", name: "Description"}, character.description);
        let backstoryInput = this.createLongInput(editorForm, {id: "backstory", name: "Backstory"}, character.backstory);
        let chatInput = this.createLongInput(editorForm, {id: "chat", name: "Chat Prompt"}, character.chat != null ? character.chat.system : null);

        saveButton.addEventListener('click', () => {
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
            if (editor.#portraitOffset != null) {
                properties.portraitOffset = editor.#portraitOffset;
            }
            editor.beginSave();
            editor.#save(properties);
        });
        editorForm.addEventListener('keyup', () => {
            editor.clearSaved();
        });
    }

    #movePortraitOffset(offsetX, offsetY, portraitWidth, portraitHeight, portraitCenter) {
        portraitCenter.style.left = (offsetX - 8) + 'px';
        portraitCenter.style.top = (offsetY - 8) + 'px';

        this.#portraitOffset = [offsetX / portraitWidth, offsetY / portraitHeight];
    }

    #save(properties) {
        let profile = this.getController().getProfile();
        let user = profile.getUser();
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