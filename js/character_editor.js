class CharacterEditor extends Editor {
    #groupTierList = 'renown';
    #characterId = null;
    #characterIdList = [];
    #scrollPosition = 0;
    #filterProperty = '*';
    #relationshipInputs = [];

    #portraitSelector = null
    #portraitCenter = null;
    #portraitRadius = 0;
    #portraitRatio = 0;
    #portraitDragState = 'none';
    #portraitCenterStart = null;
    #portraitRadiusStart = null;
    #portraitDragStart = null;

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

        let characterToolbar = Utilities.createDiv('characterToolbar', container);
        Utilities.createSpan('', characterToolbar, 'Show only characters missing: ');
        let properties = characters.getProperties();
        let filterSelect = document.createElement('select');
        let allOption = document.createElement('option');
        allOption.value = '*';
        allOption.innerText = '(Showing all characters)';
        filterSelect.appendChild(allOption);

        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            let propertyOption = document.createElement('option');
            propertyOption.value = property.id;
            propertyOption.innerText = property.name;
            if (property.question != null) {
                propertyOption.innerText += ': ' + property.question;
            }
            if (this.#filterProperty == property.id) {
                propertyOption.selected = true;
            }
            filterSelect.appendChild(propertyOption);
        }
        characterToolbar.appendChild(filterSelect);
        filterSelect.addEventListener('change', function() {
            controller.#filter(this.value);
        });

        // Create inner div to hold items
        let characterList = Utilities.createDiv('characterList', container);

        // Group characters by the grouping tier
        let characterGroups = tiers.getGroupedCharacters(this.#groupTierList, true, true);

        // Show grouped characters with group banners
        this.#characterIdList = [];
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

                if (controller.#filterProperty != '*' && character.properties.hasOwnProperty(controller.#filterProperty)) return;

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
                controller.#characterIdList.push(character.id);
            });
        });

        characterList.scrollTop = this.#scrollPosition;
        this.#scrollPosition = 0;
    }

    #filter(filterProperty) {
        this.#filterProperty = filterProperty;
        this.show();
    }

    #selectCharacter(characterKey) {
        this.showCharacter(characterKey);
    }

    showCharacter(characterKey) {
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong! (Unknown character: " + characterKey + ")");
            return;
        }
        let characterList = characters.getCharacterList(true, true);

        this.#characterId = characterKey;
        this.#portraitCenter = null;
        this.#portraitSelector = null;
        this.#portraitRatio = 0;
        this.#relationshipInputs = [];
        this.clearModified();

        let container = this.getElement();
        if (container != null && container.children.length > 0) {
            let characterListContainer = container.children[0];
            this.#scrollPosition = characterListContainer.scrollTop;
        }
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
            let portraitHandles = Utilities.createDiv('portraitHandles', portraitImage);
            let portraitCenter = Utilities.createDiv('portraitCenter', portraitHandles);
            let portraitInfo = character.images.hasOwnProperty('portrait') && character.images.portrait.metadata != null ? JSON.parse(character.images.portrait.metadata) : {};
            let center = portraitInfo.hasOwnProperty('center') ? portraitInfo.center : [loadImage.width * 0.5, loadImage.height * 0.1];
            let radius = portraitInfo.hasOwnProperty('radius') ? portraitInfo.radius : loadImage.width * 0.5;

            // Adjust portrait width/height based on loaded image
            let widthRatio = portraitWidth / loadImage.width;
            let heightRatio = portraitHeight / loadImage.height;
            let ratio = Math.min(widthRatio, heightRatio);
            portraitWidth = loadImage.width * ratio;
            portraitHeight = loadImage.height * ratio;

            portraitImage.style.backgroundSize = portraitWidth + 'px ' + portraitHeight + 'px';
            portraitCenter.addEventListener('mousedown', function(event) {
                event.stopPropagation();
                editor.#startPortraitMove(event.screenX, event.screenY);
            });
            portraitHandles.addEventListener('mousedown', function(event) {
                event.stopPropagation();
                editor.#startPortraitResize(event.screenX, event.screenY);
            });
            portraitImage.addEventListener('mouseup', function(event) {
                editor.#stopPortraitDrag(event.screenX, event.screenY);
            });
            portraitImage.addEventListener('mousemove', function(event) {
                editor.#updateDraggedPortrait(event.screenX, event.screenY);
            });

            editor.#portraitRadiusStart = radius;
            editor.#portraitCenterStart = center;
            editor.#portraitRatio = ratio;
            editor.#portraitRadius = radius;
            editor.#portraitCenter = center;
            editor.#portraitSelector = [portraitCenter, portraitHandles];
            editor.#updatePortraitSelector();
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
        let doneButton = Utilities.createElement('button', 'doneButton', saveContainer, 'Done');
        doneButton.addEventListener('click', () => {
            editor.show();
        });
        let newVariantButton = Utilities.createElement('button', 'newVariant', saveContainer, 'Create New Variant');
        newVariantButton.addEventListener('click', () => {
            editor.createVariant();
        });

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
        let notesInput = this.createLongInput(editorForm, {id: "notes", name: "Notes"}, character.notes);

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
            character.notes = notesInput.value;
            properties['notes'] = notesInput.value;
            if (chatInput.value.length > 0) {
                character.chat = {system: chatInput.value};
            } else {
                character.chat = null;
            }
            properties['chat'] = character.chat == null ? '' : JSON.stringify(character.chat)
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
            if (editor.isModified('portrait')) {
                let portrait = {center: editor.#portraitCenter, radius: editor.#portraitRadius};
                properties.portrait = JSON.stringify(portrait);
            }
            if (editor.isModified('relationships')) {
                let relationships = {};
                for (let relationshipIndex = 0; relationshipIndex < this.#relationshipInputs.length; relationshipIndex++) {
                    let relationship = this.#relationshipInputs[relationshipIndex];
                    let relationshipType = relationship.relationshipSelect.value;
                    let relationshipTarget = relationship.characterSelect.value;
                    if (!relationships.hasOwnProperty(relationshipType)) {
                        relationships[relationshipType] = [];
                    }
                    relationships[relationshipType].push(relationshipTarget);
                }
                properties.relationships = JSON.stringify(relationships);
            }
            editor.beginSave();
            editor.#save(properties);
        });
        editorForm.addEventListener('keyup', () => {
            editor.clearSaved();
        });

        let relationshipContainer = Utilities.createDiv('relationshipContainer', outerContainer);

        let relationshipTable = Utilities.createElement('table', 'relationshipTable', relationshipContainer);
        let relationshipBody = Utilities.createElement('tbody', '', relationshipTable);

        let newRow = Utilities.createElement('tr', '', relationshipBody);
        let relationshipCell = Utilities.createElement('td', '', newRow);
        Utilities.createSpan('', relationshipCell, 'has a');
        let newRelationship = this.#createRelationshipSelect(relationshipCell);
        let toCell = Utilities.createElement('td', '', newRow);
        Utilities.createSpan('', toCell, 'named');
        let newTarget = this.#createCharacterSelect(toCell);
        newRelationship.addEventListener('change', function() {
            editor.#checkNewRow(newRow, newRelationship, newTarget);
        });
        newTarget.addEventListener('change', function() {
            editor.#checkNewRow(newRow, newRelationship, newTarget);
        });

        let relationships = character.relationships;
        for (let relationshipType in relationships) {
            if (!character.relationships.hasOwnProperty(relationshipType)) continue;
            let related = relationships[relationshipType];
            for (let relatedIndex = 0; relatedIndex < related.length; relatedIndex++) {
                let relatedCharacter = characters.getCharacter(related[relatedIndex]);
                if (relatedCharacter == null) continue;
                this.#createRelationshipRow(relationshipBody, relationshipType, relatedCharacter.id);
            }
        }
    }

    #createRelationshipRow(relationshipBody, relationshipType, relatedCharacterId) {
        let relationshipRow = Utilities.createElement('tr', '', relationshipBody);
        let relationshipCell = Utilities.createElement('td', '', relationshipRow);
        Utilities.createSpan('', relationshipCell, 'has a');
        let relationshipSelect = this.#createRelationshipSelect(relationshipCell, relationshipType)
        let toCell = Utilities.createElement('td', '', relationshipRow);
        Utilities.createSpan('', toCell, 'named');
        let characterSelect = this.#createCharacterSelect(toCell, relatedCharacterId);
        let editor = this;
        relationshipSelect.addEventListener('change', function() {
            editor.#modifyRelationship(relationshipRow);
        });
        characterSelect.addEventListener('change', function() {
            editor.#modifyRelationship(relationshipRow);
        });
        this.#relationshipInputs.push({
            relationshipSelect: relationshipSelect,
            characterSelect: characterSelect
        });

        return relationshipRow;
    }

    #modifyRelationship(row) {
        this.setModified('relationships');
        row.className = 'modified';
    }

    #checkNewRow(row, relationshipSelect, characterSelect) {
        let relationship = relationshipSelect.value;
        let character = characterSelect.value;
        if (relationship != '' && character != '') {
            relationshipSelect.value = '';
            characterSelect.value = '';
            let tbody = row.parentElement;
            let newRow = this.#createRelationshipRow(tbody, relationship, character);
            this.#modifyRelationship(newRow);
        }
    }

    #createRelationshipSelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, '(Choose)').value = '';
        }
        let relationships = this.getController().getRelationships().getRelationships();
        let ids = Object.keys(relationships);
        ids.sort();
        for (let idIndex = 0; idIndex < ids.length; idIndex++) {
            let id = ids[idIndex];
            let option = Utilities.createElement('option', '', select, relationships[id].name);
            option.value = id;
            if (selectedId == id) {
                option.selected = true;
            }
        }
        return select;
    }

    #createCharacterSelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, '(Choose)').value = '';
        }
        let characterList = this.getController().getCharacters().getCharacterList(true, true);
        characterList.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        for (let characterIndex = 0; characterIndex < characterList.length; characterIndex++) {
            let character = characterList[characterIndex];
            let option = Utilities.createElement('option', '', select, character.name);
            option.value = character.id;
            if (selectedId == character.id) {
                option.selected = true;
            }
        }
        return select;
    }

    onNextCharacter() {
        this.#goCharacter(1);
    }

    onPreviousCharacter() {
        this.#goCharacter(-1);
    }

    #goCharacter(direction) {
        let characterList = this.#characterIdList;
        let index = 0;
        for (let i = 0; i < characterList.length; i++) {
            if (characterList[i] == this.#characterId) {
                index = i;
                break;
            }
        }
        index = (index + direction + characterList.length) % characterList.length;
        this.showCharacter(characterList[index]);
    }

    createVariant() {
        let profile = this.getController().getProfile();
        let user = profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        let label = prompt("Enter a label for this variant. This should not include the character name, and should be something short like Origins, Past, Little.");
        if (label == "" || label == null) {
            alert("You didn't enter anything, skipping");
            return;
        }

        let characterId = this.#characterId;
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterId);
        if (character.base_id != null) {
            characterId = character.base_id;
        }

        let editor = this;
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function() {
            editor.processCreateVariant(this.response);
        };
        request.onerror = function() {
            editor.saveFailed();
        };

        request.open("POST", "data/editor.php", true);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        let parameters = "action=create_variant_character&character=" + characterId
            + '&user=' + user.id
            + '&token=' + user.token
            + '&label=' + encodeURIComponent(label);
        request.send(parameters);
    }

    processCreateVariant(response) {
        if (!response.success) {
            this.saveFailed(response.message);
            return;
        }

        this.getController().getCharacters().addVariant(response.character);
        this.showCharacter(response.character.id);
    }

    #updatePortraitSelector() {
        if (this.#portraitSelector == null) return;
        let center = this.#portraitCenter;
        let ratio = this.#portraitRatio;
        let radius = this.#portraitRadius;
        let scaledRadius = radius * ratio;

        this.#portraitSelector[0].style.left = '0px';
        this.#portraitSelector[0].style.top = '0px';

        this.#portraitSelector[0].style.width = (scaledRadius * 2) + 'px';
        this.#portraitSelector[0].style.height = (scaledRadius * 2) + 'px';

        this.#portraitSelector[1].style.left = (center[0] * ratio - scaledRadius - 4) + 'px';
        this.#portraitSelector[1].style.top = (center[1] * ratio - scaledRadius - 4) + 'px';

        this.#portraitSelector[1].style.width = (scaledRadius * 2 + 8) + 'px';
        this.#portraitSelector[1].style.height = (scaledRadius * 2 + 8) + 'px';
    }

    #startPortraitMove(offsetX, offsetY) {
        this.#portraitDragState = 'move';
        this.#portraitDragStart = [offsetX, offsetY];
    }

    #startPortraitResize(offsetX, offsetY) {
        this.#portraitDragState = 'resize';
        this.#portraitDragStart = [offsetX, offsetY];
    }

    #updateDraggedPortrait(offsetX, offsetY) {
        switch (this.#portraitDragState) {
            case 'move':
                this.#movePortraitFromDrag(offsetX, offsetY);
                this.#updatePortraitSelector();
                break;
            case 'resize':
                this.#resizePortraitFromDrag(offsetX, offsetY);
                this.#updatePortraitSelector();
                break;
        }
    }

    #movePortraitFromDrag(offsetX, offsetY) {
        if (this.#portraitRatio == 0) return;
        let dragDistanceX = offsetX - this.#portraitDragStart[0];
        let dragDistanceY = offsetY - this.#portraitDragStart[1];
        this.#portraitCenter = [dragDistanceX / this.#portraitRatio + this.#portraitCenterStart[0], dragDistanceY / this.#portraitRatio + this.#portraitCenterStart[1]];
        this.#updatePortraitSelector();
        this.setModified('portrait');
    }

    #resizePortraitFromDrag(offsetX, offsetY) {
        if (this.#portraitRatio == 0 || this.#portraitDragStart == null) return this.#portraitRadius;
        let dragDistanceX = offsetX - this.#portraitDragStart[0];
        let dragDistanceY = offsetY - this.#portraitDragStart[1];
        let dragDistance = dragDistanceY;
        if (Math.abs(dragDistanceX) > Math.abs(dragDistanceY)) {
            dragDistance = dragDistanceX;
        }
        this.#portraitRadius = Math.max(32, this.#portraitRadiusStart + dragDistance / this.#portraitRatio);
    }

    #stopPortraitDrag(offsetX, offsetY) {
        switch (this.#portraitDragState) {
            case 'move':
                this.#movePortraitFromDrag(offsetX, offsetY);
                break;
            case 'resize':
                this.#resizePortraitFromDrag(offsetX, offsetY);
                break;
            case 'none':
                return;
        }
        this.#updatePortraitSelector();
        this.#portraitCenterStart = this.#portraitCenter;
        this.#portraitRadiusStart = this.#portraitRadius;
        this.#portraitDragStart = null;
        this.#portraitDragState = 'none';
        this.setModified('portrait');
    }

    processSave(response) {
        super.processSave(response);

        if (response.success) {
            this.getController().getCharacters().updateCharacter(response.character);
            for (let i = 0; i < response.relationships.length; i++) {
                let relationship = response.relationships[i];
                this.getController().getCharacters().addRelationship(relationship);
            }
        }
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

        request.open("POST", "data/editor.php", true);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        let parameters = "action=save_character&character=" + this.#characterId
            + '&user=' + user.id
            + '&token=' + user.token
            + '&properties=' + encodeURIComponent(JSON.stringify(properties));
        request.send(parameters);
    }
}