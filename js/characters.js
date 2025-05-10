class Characters extends Component {
    #groupTierList = 'renown';
    #characterIdList = [];
    #popupCharacterId = null;
    #popupImageId = null;
    #popupSecondaryImageId = null;
    #popupImageElement = null;
    #characterImageElement = null;
    #characters = {};
    #properties = {};
    #filters = {};
    #mouseStart = {x: 0, y: 0};
    #rotating = false;
    #moveMinDistance = 20;
    #moveMinPercent = 5;

    constructor(controller, element) {
        super(controller, element);
    }

    addCharacters(characters) {
        for (let id in characters) {
            if (characters.hasOwnProperty(id)) {
                this.#characters[id] = characters[id];
            }
        }
    }

    addProperties(properties) {
        for (let id in properties) {
            if (properties.hasOwnProperty(id)) {
                this.#properties[id] = properties[id];
            }
        }
    }

    getCharacterList(showHidden) {
        let characterList = Object.values(this.#characters);
        if (!showHidden) {
            characterList = characterList.filter((character) => !character.hidden);;
        }
        return characterList;
    }

    getCharacter(id) {
        return this.#characters.hasOwnProperty(id) ? this.#characters[id] : null;
    }

    getProperty(characterId, propertyKey) {
        let value = null;
        if (this.#characters.hasOwnProperty(characterId)) {
            let character = this.#characters[characterId];
            if (character.hasOwnProperty('properties') &&
                character.properties != null &&
                typeof character.properties === 'object' &&
                character.properties.hasOwnProperty(propertyKey)
            ) {
                    value = character.properties[propertyKey];
            }
        }
        return value;
    }

    getPropertyName(propertyKey) {
        return this.#properties.hasOwnProperty(propertyKey) ? this.#properties[propertyKey].name : propertyKey;
    }

    getAllProperties(propertyKey) {
        let propertyMap = {};
        for (let id in this.#characters) {
            let value = this.getProperty(id, propertyKey);
            if (value != null) {
                propertyMap[value] = true;
            }
        }
        let values = Object.keys(propertyMap);
        values.sort();
        return values;
    }

    filter(filter, value) {
        if (value === '*') {
            delete this.#filters[filter];
        } else {
            this.#filters[filter] = value;
        }
        this.#updateFilters();
    }

    #shouldShow(character) {
        let properties = character.hasOwnProperty('properties') && character.properties != null ? character.properties : {};
        let shouldShow = true;
        for (let filterKey in this.#filters) {
            if (this.#filters.hasOwnProperty(filterKey)) {
                let filterValue = this.#filters[filterKey];
                if (properties.hasOwnProperty(filterKey)) {
                    if (properties[filterKey] != filterValue) {
                        shouldShow = false;
                    }
                } else if (filterValue != '?') {
                    shouldShow = false;
                }
            }
        }
        return shouldShow;
    }

    #updateFilters() {
        for (let id in this.#characters) {
            if (this.#characters.hasOwnProperty(id)) {
                let character = this.#characters[id];
                for (let containerId in character.containers) {
                    if (!character.hasOwnProperty('containers')) continuel
                    let shouldShow = this.#shouldShow(character);
                    if (character.containers.hasOwnProperty(containerId)) {
                        Utilities.setVisible(character.containers[containerId], shouldShow);
                    }
                }
            }
        }
    }

    #createFilterBox(propertyKey) {
        let filterSelect = document.createElement('select');
        let propertyName = this.getPropertyName(propertyKey);
        let allOption = document.createElement('option');
        allOption.value = '*';
        allOption.innerText = 'All ' + propertyName;
        filterSelect.appendChild(allOption);
        let unknownOption = document.createElement('option');
        unknownOption.value = '?';
        unknownOption.innerText = 'Unknown ' + propertyName;
        filterSelect.appendChild(unknownOption);
        let allSpecies = this.getAllProperties(propertyKey);
        for (let i = 0; i < allSpecies.length; i++) {
            let option = document.createElement('option');
            option.innerText = allSpecies[i];
            filterSelect.appendChild(option);
        }
        let characterController = this;
        filterSelect.addEventListener('change', function() {
            characterController.filter(propertyKey, this.value);
        });

        return filterSelect;
    }

    show() {
        let characterController = this;
        let container = this.getElement();
        let tiers = this.getController().getTiers();
        this.#filters = {};
        this.#characterIdList = [];
        Utilities.empty(container);

        // Add filter boxes
        let characterToolbar = Utilities.createDiv('characterToolbar', container);
        let showAllButton = Utilities.createElement('button', 'showAll', characterToolbar, 'View All Characters')
        showAllButton.addEventListener('click', function() {
            characterController.#showAllCharacters();
        });
        let filterButton = Utilities.createElement('button', 'filter', characterToolbar, 'Search...')
        filterButton.addEventListener('click', function() {
            if (filters.style.display == 'flex') {
                filters.style.display = 'none';
            } else {
                filters.style.display = 'flex';
            }
        });
        let filters = Utilities.createDiv('characterFilters', characterToolbar);
        filters.style.display = 'none';
        filters.appendChild(this.#createFilterBox('species'));
        filters.appendChild(this.#createFilterBox('pronouns'));
        filters.appendChild(this.#createFilterBox('sexuality'));

        // Create inner div to hold items
        let characterList = Utilities.createDiv('characterList', container);

        // Group characters by the grouping tier
        let characterGroups = tiers.getGroupedCharacters(this.#groupTierList);

        // Show grouped characters with group banners
        Object.values(characterGroups).forEach(function(group) {
            if (group.characters.length == 0) return;
            let header = Utilities.createDiv('characterGroupHeader', characterList);
            Utilities.createSpan('', header, group.name);
            if (group.description != null) {
                Utilities.createSpan('characterGroupDescription', header, group.description);
            }
            header.style.backgroundColor = group.color;
            if (group.dark) {
                Utilities.addClass(header, 'dark');
            }
            group.characters.forEach(function(characterTier) {
                let character = characterController.getCharacter(characterTier.persona_id);
                let portraitContainer = document.createElement('div');
                portraitContainer.className = 'portraitContainer';
                portraitContainer.addEventListener('click', function() {
                    characterController.#showCharacterPopup(character.id);
                });

                let portraitName = document.createElement('div');
                portraitName.className = 'portraitName';
                portraitName.innerText = character.name;
                portraitContainer.appendChild(portraitName);

                let portrait = document.createElement('div');
                portrait.className = 'portrait';
                portrait.style.backgroundImage = 'url(' + characterController.getPortrait(character.id) + ')';
                portraitContainer.appendChild(portrait);

                characterList.appendChild(portraitContainer);

                character.containers = {
                    portrait: portrait,
                    name: portraitName
                };
                characterController.#characterIdList.push(character.id);
            });
        });
    }

    #addCharacterPropertyInfo(character, container, property, label) {
        if (typeof(label) === 'undefined') {
            let properties = this.getProperties();
            if (properties.hasOwnProperty(property)) {
                label = properties[property].name;
            } else {
                label = '?';
            }
        }
        Utilities.createDiv('label', container, label);
        Utilities.createDiv('value', container, character.properties.hasOwnProperty(property) ? character.properties[property] : null);
    }

    #addCharacterPropertyList(listDiv, character, property, maxRows, label, divider) {
        if (typeof(label) === 'undefined') {
            let properties = this.getProperties();
            if (properties.hasOwnProperty(property)) {
                label = properties[property].name;
            } else {
                label = '?';
            }
        }
        Utilities.createDiv('label', listDiv).innerHTML = label;
        if (typeof(divider) !== 'undefined') {
            Utilities.createElement(divider, 'divider', listDiv);
        }

        let list = character.properties.hasOwnProperty(property) ? character.properties[property] : '';
        list = list.split(',');
        let listCount = list.length;
        if (maxRows > 0) {
            listCount = Math.max(maxRows, listCount);
        }
        for (let i = 0; i < listCount; i++) {
            let value = i < list.length ? list[i] : '';
            Utilities.createDiv('value', listDiv, value);
        }
    }

    #showAllCharacters() {
        let element = this.getElement();
        let popup = Utilities.showPopup(element.parentNode, 'allCharacters');
        let characterController = this;
        let tiers = this.getController().getTiers();
        let characterGroups = tiers.getGroupedCharacters(this.#groupTierList);
        let scale = 0.2;
        Object.values(characterGroups).forEach(function(group) {
            if (group.characters.length == 0) return;
            // TODO: group separation?
            group.characters.forEach(function(characterTier) {
                let character = characterController.getCharacter(characterTier.persona_id);
                if (!characterController.#shouldShow(character)) return;
                if (!character.images.hasOwnProperty('full')) return;
                let fullImage = character.images.full;
                if (fullImage.width == null || fullImage.height == null) return;

                let characterContainer = Utilities.createDiv('characterFullContainer', popup);
                let characterImage = Utilities.createDiv('characterFull', characterContainer);
                characterImage.style.minWidth = fullImage.width * scale;
                characterImage.style.minHeight = fullImage.height * scale;
                characterImage.style.maxWidth = fullImage.width * scale;
                characterImage.style.maxHeight = fullImage.height * scale;
                characterImage.style.backgroundImage = 'url(' + characterController.getImage(character.id) + ')';
                let characterName = Utilities.createDiv('characterFullName', characterContainer, character.name);

                if (character.properties.hasOwnProperty('color')) {
                    characterName.style.color = character.properties.color.toLowerCase().replace(' ', '');
                }

                characterContainer.addEventListener('click', function() {
                    characterController.#showCharacterPopup(character.id);
                });
            });
        });
        popup.scrollTop = popup.scrollHeight;
    }

    #showCharacterPopup(characterKey) {
        let character = this.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        this.#popupCharacterId = characterKey;
        this.getController().getHistory().set('character', characterKey);
        let element = this.getElement();
        let characterController = this;
        let buttons = {
            close: function() {
                characterController.#popupCharacterId = null;
                characterController.getController().getHistory().unset('character');
            },
            next: function() {
                characterController.onNextCharacter();
                // Close the popup and make a new one
                return true;
            },
            previous: function() {
                characterController.onPreviousCharacter();
                // Close the popup and make a new one
                return true;
            }
        };
        let popup = Utilities.showPopup(element.parentNode, 'characterSheet', buttons);
        if (character.properties.hasOwnProperty('color')) {
            popup.style.borderColor = character.properties.color.toLowerCase().replace(' ', '');
        }

        // Column 1:
        // Images, Backstory
        let column1 = Utilities.createDiv('column column_1', popup);

        let imageLabel = Utilities.createDiv('label section above clickable', column1, 'Click to View Images');
        imageLabel.addEventListener('click', function() {
            characterController.onShowImages();
        });
        let image = Utilities.createDiv('sheetImage section', column1);
        image.style.backgroundImage = 'url(' + this.getImage(characterKey) + ')';
        image.addEventListener('click', function() {
            characterController.onShowImages();
        });

        Utilities.createDiv('backstory section', column1, character.backstory);
        Utilities.createDiv('label section below', column1, 'Backstory');

        // Column 2
        // Info
        // Personality
        // Favorites
        let column2 = Utilities.createDiv('column column_2', popup);

        // Info
        let infoDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', infoDiv, 'Name');
        Utilities.createDiv('value', infoDiv, character.full_name);
        Utilities.createDiv('label', infoDiv, 'Birth Name');
        Utilities.createDiv('value', infoDiv, character.birth_name);
        this.#addCharacterPropertyInfo(character, infoDiv, 'title');
        this.#addCharacterPropertyInfo(character, infoDiv, 'species');
        this.#addCharacterPropertyInfo(character, infoDiv, 'age');
        this.#addCharacterPropertyInfo(character, infoDiv, 'birthday');

        let personalityDiv = Utilities.createDiv('personality section', column2);
        this.#addCharacterPropertyList(personalityDiv, character, 'traits', 2);

        let favoritesDiv = Utilities.createDiv('favorites section', column2);
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'job');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'color');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'food');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'habits');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'activity');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'fears');

        // Column 3
        let properties = this.getProperties();
        let column3 = Utilities.createDiv('column column_3', popup);
        let flagsDiv = Utilities.createDiv('flags', column3);
        let flags = ['birth_realm', 'sexuality', 'home_realm', 'pronouns'];

        for (let i = 0; i < flags.length; i++) {
            let flagId = flags[i];
            let flagDiv = Utilities.createDiv('section flag', flagsDiv);
            let propertyLabel = properties.hasOwnProperty(flagId) ? properties[flagId].name : '?';
            Utilities.createDiv('label flag', flagDiv, propertyLabel);
            let value = character.properties.hasOwnProperty(flagId) ? character.properties[flagId] : 'none';
            let imageDiv = Utilities.createDiv('flagImage', flagDiv);
            imageDiv.title = value;
            imageDiv.style.backgroundImage = 'url(image/flags/' + Utilities.translateToFlag(value) + '.jpg)';
        }

        let preferencesDiv = Utilities.createDiv('preferences', column3);
        let likesDiv = Utilities.createDiv('section likes', preferencesDiv);
        this.#addCharacterPropertyList(likesDiv, character, 'likes', 6, 'Likes &#x1F496;');
        let dislikesDiv = Utilities.createDiv('section dislikes', preferencesDiv);
        this.#addCharacterPropertyList(dislikesDiv, character, 'dislikes', 6, '&#128148;Dislikes');

        let relationshipsDiv =  Utilities.createDiv('section relationships', column3);
        Utilities.createDiv('label section', relationshipsDiv, 'Relationships');
        Utilities.createElement('hr', '', relationshipsDiv);
        let relationships = this.getController().getRelationships().getRelationshipList(characterKey);
        for (let i = 0; i < relationships.length; i++) {
            let relationship = relationships[i];
            let related = this.getCharacter(relationship.character);
            Utilities.createDiv('label', relationshipsDiv, relationship.name);
            Utilities.createDiv('value', relationshipsDiv, related.name);
        }
        if (character.notes != null && character.notes.length > 0) {
            let notesDiv = Utilities.createDiv('section notes', column3);
            Utilities.createDiv('label', notesDiv, 'Fun Facts');
            Utilities.createElement('hr', '', notesDiv);
            Utilities.createDiv('value', notesDiv, character.notes);
        }

        // Column 4
        let column4 = Utilities.createDiv('column column_4', popup);

        // Row 1
        let c4r1 = Utilities.createDiv('row row1', column4);

        // Health
        let healthDiv = Utilities.createDiv('section health', c4r1);
        Utilities.createDiv('label', healthDiv, 'Health');
        Utilities.createElement('hr', '', healthDiv);
        Utilities.createDiv('label above', healthDiv, 'Physical');
        let physicalHealthValue = character.properties.hasOwnProperty('physical_health') ? character.properties.physical_health : '?';
        Utilities.createDiv('value', healthDiv, physicalHealthValue + ' / 10');
        Utilities.createDiv('label above', healthDiv, 'Mental');
        let mentalHealthValue = character.properties.hasOwnProperty('mental_health') ? character.properties.mental_health : '?';
        Utilities.createDiv('value', healthDiv, mentalHealthValue + ' / 10');
        this.#addCharacterPropertyList(healthDiv, character, 'disorders', 2);
        this.#addCharacterPropertyList(healthDiv, character, 'illnesses', 2);

        // Guilt
        let guiltDiv = Utilities.createDiv('section guilt', c4r1);
        this.#addCharacterPropertyList(guiltDiv, character, 'guilt', 2);
        this.#addCharacterPropertyList(guiltDiv, character, 'secret', 2);

        let c4r2 = Utilities.createDiv('row row2', column4);

        // Skills
        let skillsDiv = Utilities.createDiv('section skills', c4r2);
        this.#addCharacterPropertyList(skillsDiv, character, 'skills', 2, undefined, 'hr');
        let aliveDiv = Utilities.createDiv('section alive', c4r2);
        Utilities.createSpan('', aliveDiv, character.properties.hasOwnProperty('living_status') ? character.properties['living_status'] : '');
        let religionDiv = Utilities.createDiv('section religion', c4r2);
        Utilities.createDiv('label', religionDiv, 'Religion');
        Utilities.createElement('hr', '', religionDiv);
        let religionList = character.properties.hasOwnProperty('religion') ? character.properties.religion : '';
        religionList = religionList.split(',');
        let religionMap = {};
        for (let i = 0; i < religionList.length; i++) {
            let item = religionList[i];
            if (item != '') religionMap[item] = true;
        }
        let religions = ['Love', 'Life', 'Death', 'Chaos', 'None'];
        for (let i = 0; i < religions.length; i++) {
            let religion = religions[i];
            let checkbox = Utilities.createElement('input');
            checkbox.type = 'checkbox';
            if (religionMap.hasOwnProperty(religion)) {
                checkbox.checked = true;
            }
            checkbox.disabled = true;
            let religionRow = Utilities.createDiv('', religionDiv);
            religionRow.appendChild(checkbox);
            Utilities.createSpan('', religionRow, religion);
        }

        let c4r3 = Utilities.createDiv('row row3', column4);
        let behaviorDiv = Utilities.createDiv('section behavior', c4r3);
        Utilities.createDiv('label', behaviorDiv, 'Behavior');
        Utilities.createElement('hr', '', behaviorDiv);
        this.#addCharacterPropertyInfo(character, behaviorDiv, 'perception');
        this.#addCharacterPropertyInfo(character, behaviorDiv, 'coping');

        let miscDic = Utilities.createDiv('section misc', c4r3);
        this.#addCharacterPropertyInfo(character, miscDic, 'comfort_item');
        this.#addCharacterPropertyInfo(character, miscDic, 'weapon');
        this.#addCharacterPropertyInfo(character, miscDic, 'carries');
        this.#addCharacterPropertyInfo(character, miscDic, 'accessories');

        let followingDiv = Utilities.createDiv('section following', c4r2);
        Utilities.createDiv('label', followingDiv, 'Following');
        Utilities.createElement('hr', '', followingDiv);

        let followingList = character.properties.hasOwnProperty('following') ? character.properties.following : '';
        followingList = followingList.split(',');
        let followingMap = {};
        for (let i = 0; i < followingList.length; i++) {
            let item = followingList[i];
            if (item != '') followingMap[item] = true;
        }
        let followings = ['Wrath', 'Lust', 'Gluttony', 'Sloth', 'Envy', 'Pride', 'Greed'];
        for (let i = 0; i < followings.length; i++) {
            let following = followings[i];
            let checkbox = Utilities.createElement('input');
            checkbox.type = 'checkbox';
            if (followingMap.hasOwnProperty(following)) {
                checkbox.checked = true;
            }
            checkbox.disabled = true;
            let followingRow = Utilities.createDiv('', followingDiv);
            followingRow.appendChild(checkbox);
            Utilities.createSpan('', followingRow, following);
        }

        let c4r4 = Utilities.createDiv('row row4', column4);
        let renownDiv = Utilities.createDiv('section reknown', c4r4);
        let renownTier = this.getTier(character.id, 'renown');
        renownTier = renownTier != null ? this.getController().getTiers().getTier('renown', renownTier.tier_id) : null;
        if (renownTier != null) {
            if (renownTier.name_singular != null) {
                renownDiv.innerText = renownTier.name_singular;
            }
            if (renownTier.color != null) {
                renownDiv.style.color = renownTier.color;
            }
        }
    }

    onShowImages() {
        let element = this.getElement();
        let characterController = this;
        let buttons = {
            close: true,
            next: function() {
                characterController.onNextImage();
            },
            previous: function() {
                characterController.onPreviousImage();
            }
        };
        this.#popupImageId = 'full';
        this.#popupSecondaryImageId = null;
        this.#popupImageElement = Utilities.showPopup(element.parentNode, 'characterImageContainer', buttons);

        this.#popupImageElement.addEventListener('mousemove', function(event) {
            characterController.onImageMove(event.clientX, event.clientY);
        });
        this.#popupImageElement.addEventListener('touchmove', function(event) {
            characterController.onImageMove(event.touches[0].clientX, event.touches[0].clientY);
        });
        this.#popupImageElement.addEventListener('mousedown', function(event) {
            characterController.onImageDown(event.clientX, event.clientY);
        });
        this.#popupImageElement.addEventListener('touchstart', function(event) {
            characterController.onImageDown(event.touches[0].clientX, event.touches[0].clientY);
        });
        this.#popupImageElement.addEventListener('touchend', function() {
            characterController.onImageUp();
        });
        this.#popupImageElement.addEventListener('touchcancel', function() {
            characterController.onImageUp();
        });
        this.#popupImageElement.addEventListener('mouseup', function() {
            characterController.onImageUp();
        });

        this.#updatePopupImage();
    }

    onImageDown(x, y) {
        this.#rotating = true;
        this.#mouseStart.x = x;
        this.#mouseStart.y = y;
    }

    onImageMove(x, y) {
        if (!this.#rotating) return;

        let character = this.getCharacter(this.#popupCharacterId);
        let imageId = this.#popupSecondaryImageId != null ? this.#popupSecondaryImageId : this.#popupImageId;
        if (character == null || !character.images.hasOwnProperty(imageId)) return;
        let image = character.images[imageId];
        let screenRatio = this.#moveMinPercent * window.innerWidth / 100;
        let moveDistance = Math.max(this.#moveMinDistance, screenRatio);
        if (x > this.#mouseStart.x + moveDistance) {
            this.#popupSecondaryImageId = image.next_image_id;
        } else if (x < this.#mouseStart.x - moveDistance) {
            this.#popupSecondaryImageId = image.previous_image_id;
        } else {
            return;
        }
        this.#mouseStart.x = x;
        this.#mouseStart.y = y;
        if (this.#popupSecondaryImageId != null) {
            this.#updatePopupFrame();
        }
    }

    onImageUp() {
        this.#rotating = false;
    }

    #updatePopupFrame() {
        if (this.#characterImageElement == null) return;
        let imageContainer = this.#characterImageElement;
        let imageId = this.#popupSecondaryImageId != null ? this.#popupSecondaryImageId : this.#popupImageId;
        let character = this.getCharacter(this.#popupCharacterId);
        if (character == null || !character.images.hasOwnProperty(imageId)) return;
        let image = character.images[imageId];
        imageContainer.style.backgroundImage = 'url(' + this.#getImage(this.#popupCharacterId, imageId) + ')';
        if (image.offset_x != 0) {
            imageContainer.style.marginLeft = image.offset_x;
        }
        if (image.offset_y != 0) {
            imageContainer.style.marginTop = image.offset_y;
        }
    }

    #updatePopupImage() {
        if (this.#popupImageElement == null) return;
        Utilities.empty(this.#popupImageElement);
        let imageId = this.#popupSecondaryImageId != null ? this.#popupSecondaryImageId : this.#popupImageId;
        let character = this.getCharacter(this.#popupCharacterId);
        if (character == null || !character.images.hasOwnProperty(imageId)) return;
        let image = character.images[imageId];
        let title = character.name + ' ' + image.title;
        Utilities.createDiv('characterImageTitle', this.#popupImageElement, title);
        this.#characterImageElement = Utilities.createDiv('characterImage', this.#popupImageElement);
        Utilities.createDiv('characterImageDescription', this.#popupImageElement, image.description);
        this.#updatePopupFrame();
        if (image.previous_image_id != null && image.next_image_id != null) {
            Utilities.createDiv('characterRotateHint', this.#popupImageElement, 'Drag to rotate!');
        }
    }

    onNextImage() {
        this.#goImage(1);
    }

    onPreviousImage() {
        this.#goImage(-1);
    }

    #goImage(direction) {
        let character = this.getCharacter(this.#popupCharacterId);
        let imageList = [];
        for (let imageKey in character.images) {
            if (character.images.hasOwnProperty(imageKey) && !character.images[imageKey].hidden) {
                imageList.push(character.images[imageKey]);
            }
        }
        if (imageList.length == 0) return;
        // Sort the list, but keep the first image as first
        let firstImage = imageList.shift();
        imageList = imageList.sort(function(a, b) {
            return a.priority - b.priority;
        });
        imageList.unshift(firstImage);
        let index = 0;
        for (let i = 0; i < imageList.length; i++) {
            if (imageList[i].image_id == this.#popupImageId) {
                index = i;
                break;
            }
        }
        index = (index + direction + imageList.length) % imageList.length;
        this.#popupImageId = imageList[index].image_id;
        this.#popupSecondaryImageId = null;
        this.#updatePopupImage();
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
            if (characterList[i] == this.#popupCharacterId) {
                index = i;
                break;
            }
        }
        index = (index + direction + characterList.length) % characterList.length;
        this.#showCharacterPopup(characterList[index]);
    }

    #getImage(characterId, dataKey) {
        let image = 'image/ui/missing.png';
        let character = this.getCharacter(characterId);
        if (character != null && character.images.hasOwnProperty(dataKey)) {
            let version = character.images[dataKey].version;
            image = 'image/dynamic/characters/' + characterId + '/' + dataKey + '.png?v=' + version;
        }
        return image;
    }

    getPortrait(characterId) {
        return this.#getImage(characterId, 'portrait');
    }

    getImage(characterId) {
        return this.#getImage(characterId, 'full');
    }

    getTier(characterId, tierList, defaultTier) {
        let character = this.getCharacter(characterId);
        if (character == null || !character.hasOwnProperty('tiers')) {
            return defaultTier;
        }
        if (character.tiers.hasOwnProperty(tierList)) {
            return character.tiers[tierList];
        }
        if (defaultTier) {
            return {tier_id: defaultTier, priority: 0};
        }
        return null;
    }

    getProperties() {
        return this.#properties;
    }

    getTitle() {
        return 'Characters';
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let character = history.get('character');
        if (this.#popupCharacterId != character) {
            if (character == null) {
                Utilities.closePopups();
            } else {
                this.#showCharacterPopup(character);
            }
        }
    }

    deactivate() {
        this.getController().getHistory().unset('character');
    }

    updateCharacter(characterInfo) {
        if (this.#characters.hasOwnProperty(characterInfo.id)) {
            this.#characters[characterInfo.id] = Utilities.merge(this.#characters[characterInfo.id], characterInfo);
        } else {
            this.#characters[characterInfo.id] = characterInfo;
        }
    }

    addRelationship(relationship) {
        let characterId = relationship.persona_id;
        if (this.#characters.hasOwnProperty(characterId)) {
            let character = this.#characters[characterId];
            if (character.relationships.hasOwnProperty(relationship.relationship_id)) {
                if (!character.relationships[relationship.relationship_id].includes(relationship.related_persona_id)) {
                    character.relationships[relationship.relationship_id].push(relationship.related_persona_id);
                }
            } else {
                character.relationships[relationship.relationship_id] = [relationship.related_persona_id];
            }
            this.#characters[characterId].relationships.push(relationship);
        }
    }
}
