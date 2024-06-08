class CharacterEditor extends Editor {
    #groupTierList = 'renown';
    #characterId = null;
    #portraitOffset = null;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let controller = this;
        let container = this.getElement();
        Utilities.empty(container);
        let tiers = this.getController().getTiers();
        let characters = this.getController().getCharacters();

        // TODO: Centralize this so it's not copied from the character list

        // Create inner div to hold items
        let characterList = Utilities.createDiv('characterList', container);

        // Group characters by the grouping tier
        let characterGroups = tiers.getGroupedCharacters(this.#groupTierList);

        // Show grouped characters with group banners
        Object.values(characterGroups).forEach(function(group) {
            if (group.characters.length == 0) return;
            let header = Utilities.createDiv('characterGroupHeader', characterList);
            header.innerText = group.name;
            header.style.backgroundColor = group.color;
            if (group.dark) {
                Utilities.addClass(header, 'dark');
            }
            group.characters.forEach(function(characterTier) {
                let character = characters.getCharacter(characterTier.persona_id);
                let portraitContainer = document.createElement('div');
                portraitContainer.className = 'portraitContainer';
                portraitContainer.addEventListener('click', function() {
                    controller.#selectCharacter(character.id);
                });

                let portraitName = document.createElement('div');
                portraitName.className = 'portraitName';
                portraitName.innerText = character.name;
                portraitContainer.appendChild(portraitName);

                let portrait = document.createElement('div');
                portrait.className = 'portrait';
                portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
                portraitContainer.appendChild(portrait);

                characterList.appendChild(portraitContainer);

                character.containers = {
                    portrait: portrait,
                    name: portraitName
                };
            });
        });
    }

    #selectCharacter(characterKey) {
        this.showCharacter(characterKey);
    }

    showCharacter(characterKey) {
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        let characterList = characters.getCharacterList();

        this.#characterId = characterKey;
        this.#portraitOffset = null;

        let container = this.getElement();
        Utilities.empty(container);

        let outerContainer = Utilities.createDiv('editorContainer', container);
        let headerContainer = Utilities.createDiv('editorHeader', outerContainer);

        let portraitName = Utilities.createDiv('editorName', headerContainer);
        portraitName.innerText = 'Editing ' + character.name;

        let portraitImage = document.createElement('div');
        portraitImage.className = 'editingPortrait';
        portraitImage.style.backgroundImage = 'url(' + characters.getImage(character.id) + ')';
        headerContainer.appendChild(portraitImage);

        let editor = this;

        // Load the image directly to get the dimensions
        let imageSrc = portraitImage.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
        let loadImage = new Image();
        loadImage.onload = function () {
            if (loadImage.width == 0 || loadImage.height == 0) return;

            let portraitStyle = getComputedStyle(portraitImage);
            let borderSize = 2 * parseFloat(portraitStyle.borderWidth);
            let portraitWidth = portraitImage.offsetWidth - borderSize;
            let portraitHeight = portraitImage.offsetHeight - borderSize;
            let portraitCenter = Utilities.createDiv('portraitCenter', portraitImage);
            let offset = character.hasOwnProperty('portrait') && character.portrait.hasOwnProperty('offset') ? character.portrait.offset : [0.5, 0.1];

            // Adjust portrait width/height based on loaded image
            let widthRatio = portraitWidth / loadImage.width;
            let heightRatio = portraitHeight / loadImage.height;
            let ratio = Math.min(widthRatio, heightRatio);
            portraitWidth = loadImage.width * ratio;
            portraitHeight = loadImage.height * ratio;

            portraitImage.style.backgroundSize = portraitWidth + 'px ' + portraitHeight + 'px';
            portraitImage.addEventListener('click', function(event) {
                editor.#movePortraitOffset(event.offsetX, event.offsetY, portraitWidth, portraitHeight, portraitCenter);
            });
            portraitCenter.style.left = (offset[0] * portraitWidth - 8) + 'px';
            portraitCenter.style.top = (offset[1] * portraitHeight - 8) + 'px';
        };
        loadImage.src = imageSrc;

        let saveContainer = Utilities.createDiv('save', headerContainer);
        let saveButton = this.createSaveButton(saveContainer);
        let backButton = document.createElement('button');
        backButton.className = 'back';
        backButton.innerText = '< Back';
        saveContainer.appendChild(backButton);
        backButton.addEventListener('click', () => {
            editor.onPreviousCharacter();
        });
        let nextButton = document.createElement('button');
        nextButton.className = 'next';
        nextButton.innerText = 'Next >';
        saveContainer.appendChild(nextButton);
        nextButton.addEventListener('click', () => {
            editor.onNextCharacter();
        });
        this.createSaveConfirm(saveContainer);

        let editorContainer = Utilities.createDiv('editing', outerContainer);
        let editorForm = document.createElement('form');
        editorForm.id = 'characterForm';
        editorContainer.appendChild(editorForm);

        let firstNameInput = this.createInput(editorForm, {id: 'first_name', name: 'First Name'});
        firstNameInput.value = character.first_name;
        let middleNameInput = this.createInput(editorForm, {id: 'middle_name', name: 'Middle Name'});
        middleNameInput.value = character.middle_name;
        let lastNames = {};
        for (let i = 0; i < characterList.length; i++) {
            if (characterList[i].last_name == null || characterList[i].last_name.length == 0) continue;
            lastNames[characterList[i].last_name] = true;
        }
        lastNames = Object.keys(lastNames);
        let lastNameInput = this.createInput(editorForm, {id: 'last_name', name: 'Last Name'}, lastNames);
        lastNameInput.value = character.last_name;
        let nickNameInput = this.createInput(editorForm, {id: 'nick_name', name: 'Nickname'});
        nickNameInput.value = character.nick_name;
        let birthNameInput = this.createInput(editorForm, {id: 'birth_name', name: 'Birth Name'});
        birthNameInput.value = character.birth_name;
        let propertyInputs = {};
        let properties = characters.getProperties();
        let wasQuestion = false;
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let isQuestion = property.question != null;
            if (!wasQuestion && isQuestion) {
                Utilities.createElement('hr', '', editorForm);
                wasQuestion = true;
            }
            let options = characters.getAllProperties(propertyId);
            let propertyInput = this.createInput(editorForm, property, options);
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
            properties['middle_name'] = middleNameInput.value;
            properties['nick_name'] = nickNameInput.value;
            properties['birth_name'] = birthNameInput.value;
            character.first_name = firstNameInput.value;
            character.last_name = lastNameInput.value;
            character.nick_name = nickNameInput.value;
            character.middle_name = middleNameInput.value;
            character.birth_name = birthNameInput.value;
            character.name = character.first_name;
            if (nickNameInput.value.length > 0) {
                character.name = nickNameInput.value;
            }
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

    onNextCharacter() {
        this.#goCharacter(1);
    }

    onPreviousCharacter() {
        this.#goCharacter(-1);
    }

    #goCharacter(direction) {
        let characterList = this.getController().getCharacters().getCharacterList();
        let index = 0;
        for (let i = 0; i < characterList.length; i++) {
            if (characterList[i].id == this.#characterId) {
                index = i;
                break;
            }
        }
        index = (index + direction + characterList.length) % characterList.length;
        this.showCharacter(characterList[index].id);
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