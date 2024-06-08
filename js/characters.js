class Characters extends Component {
    #groupTierList = 'renown';
    #popupCharacterId = null;
    #characters = {};
    #properties = {};
    #filters = {};

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

    getCharacterList() {
        return Object.values(this.#characters).filter((character) => !character.hidden);
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

    #updateFilters() {
        for (let id in this.#characters) {
            if (this.#characters.hasOwnProperty(id)) {
                let character = this.#characters[id];
                if (!character.hasOwnProperty('containers')) continue;
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
                for (let containerId in character.containers) {
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
        Utilities.empty(container);

        // Add filter boxes
        let characterToolbar = Utilities.createDiv('characterToolbar', container);
        characterToolbar.appendChild(this.#createFilterBox('species'));
        characterToolbar.appendChild(this.#createFilterBox('pronouns'));
        characterToolbar.appendChild(this.#createFilterBox('sexuality'));

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

    #translateToFlag(value) {
        value = value.replaceAll(" ", "_");
        value = value.replaceAll("/", "_");
        return value.toLowerCase();
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
        let popup = Utilities.showPopup(element.parentNode, 'characterSheet', function() {
            characterController.#popupCharacterId = null;
            characterController.getController().getHistory().unset('character');
        });
        if (character.properties.hasOwnProperty('color')) {
            popup.style.borderColor = character.properties.color.toLowerCase().replace(' ', '');
        }

        // Column 1:
        // Images, Backstory
        let column1 = Utilities.createDiv('column column_1', popup);

        Utilities.createDiv('label section above', column1, 'Headshot');
        let image = Utilities.createDiv('sheetImage section', column1);
        image.style.backgroundImage = 'url(' + this.getImage(characterKey) + ')';

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
        Utilities.createDiv('label', personalityDiv, 'Personality');
        let traits = character.properties.hasOwnProperty('traits') ? character.properties.traits : '';
        let traitsList = Utilities.createElement('ul', 'traits', personalityDiv);
        traits = traits.split(',');
        let traitCount = Math.max(traits.length, 5);
        for (let i = 0; i < traitCount; i++) {
            let trait = i < traits.length ? traits[i] : '';
            Utilities.createElement('li', 'value', traitsList, trait);
        }

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
            let value = character.properties.hasOwnProperty(flagId) ? character.properties[flagId] : null;
            let imageDiv = Utilities.createDiv('flagImage', flagDiv);
            imageDiv.title = value;
            imageDiv.style.backgroundImage = 'url(image/flags/' + this.#translateToFlag(value) + '.png)';
        }

        let preferencesDiv = Utilities.createDiv('preferences', column3);
        let likesDiv = Utilities.createDiv('section likes', preferencesDiv);
        Utilities.createDiv('label', likesDiv).innerHTML = 'Likes &#x1F496;';

        let likes = character.properties.hasOwnProperty('likes') ? character.properties.likes : '';
        likes = likes.split(',');
        let likesCount = Math.max(likes.length, 6);
        for (let i = 0; i < likesCount; i++) {
            let like = i < likes.length ? likes[i] : '';
            Utilities.createDiv('value', likesDiv, like);
        }

        let dislikesDiv = Utilities.createDiv('section dislikes', preferencesDiv);
        Utilities.createDiv('label', dislikesDiv).innerHTML = '&#128148;Dislikes';

        let dislikes = character.properties.hasOwnProperty('dislikes') ? character.properties.dislikes : '';
        dislikes = dislikes.split(',');
        let dislikesCount = Math.max(dislikes.length, 6);
        for (let i = 0; i < dislikesCount; i++) {
            let dislike = i < dislikes.length ? dislikes[i] : '';
            Utilities.createDiv('value', dislikesDiv, dislike);
        }

        let relationshipsDiv =  Utilities.createDiv('section relationships', column3);
        Utilities.createDiv('label section', relationshipsDiv, 'Relationships');
        Utilities.createElement('hr', '', relationshipsDiv);
        let relationships = this.getRelationshipList(characterKey);
        for (let i = 0; i < relationships.length; i++) {
            let relationship = relationships[i];
            let related = this.getCharacter(relationship.character);
            Utilities.createDiv('label', relationshipsDiv, relationship.name);
            Utilities.createDiv('value', relationshipsDiv, related.name);
        }




        // Column 4
        let column4 = Utilities.createDiv('column column_4', popup);

        /*
        let propertiesDiv = Utilities.createDiv('sheetProperties', popup);
        let nameDiv = Utilities.createDiv('sheetName', propertiesDiv);
        nameDiv.innerText = character.full_name;
        let divider = document.createElement('hr');
        divider.className = 'separator';
        propertiesDiv.appendChild(divider);
        let propertiesTable = document.createElement('table');
        propertiesTable.className = 'properties';
        propertiesDiv.appendChild(propertiesTable);
        let propertiesBody = document.createElement('tbody');
        propertiesTable.appendChild(propertiesBody);
        let properties = {... this.getProperties() };
        let characterProperties = {... character.properties };
        if (character.description != null && character.description.length > 0) {
            properties['description'] = {name: 'Description', question: null};
            characterProperties['description'] = character.description;
        }
        if (character.backstory != null && character.backstory.length > 0) {
            properties['backstory'] =  {name: 'Backstory', question: null};
            characterProperties['backstory'] = character.backstory;
        }
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            if (!characterProperties.hasOwnProperty(propertyId)) continue;
            let property = properties[propertyId];
            if (property.question != null) continue;
            let propertyRow = document.createElement('tr');
            propertiesBody.appendChild(propertyRow);
            let propertyHeader = document.createElement('th');
            propertyHeader.innerText = property.name;
            propertyRow.appendChild(propertyHeader);
            let propertyValue = document.createElement('td');
            propertyValue.innerText = characterProperties[propertyId];
            propertyRow.appendChild(propertyValue);
        }

        */
    }

    static getRelationshipName(relationshipId) {
        // Maybe add a relationships.json?
        return Utilities.humanizeKey(relationshipId);
    }

    getRelationshipList(characterId) {
        let characters = this.#characters;
        let character = this.#characters[characterId];
        let relationshipList = [];
        if (!character.hasOwnProperty('relationships')) {
            return relationshipList;
        }
        let relationships = character.relationships;
        for (let relationshipId in relationships) {
            let relationshipTargets = relationships[relationshipId];
            if (!Array.isArray(relationshipTargets)) {
                relationshipTargets = [relationshipTargets];
            }
            relationshipTargets.forEach(function(target) {
                if (!characters.hasOwnProperty(target) || characters[target].hidden) return;
                let relationship = {
                    id: relationshipId,
                    name: Characters.getRelationshipName(relationshipId),
                    character: target
                };
                relationshipList.push(relationship);
            });
        }
        return relationshipList;
    }

    #getImage(characterId, folder, dataKey) {
        let character = this.getCharacter(characterId);
        if (character == null) {
            return '';
        }
        let version = 0;
        if (character.hasOwnProperty(dataKey) && character[dataKey] != null && character[dataKey].hasOwnProperty('version')) {
            version = character[dataKey].version;
        }
        if (character.hasOwnProperty(dataKey) && character[dataKey] != null && character[dataKey].hasOwnProperty('url')) {
            return 'image/' + folder + '/' + character[dataKey].url + '?v=' + version;
        }
        return 'image/' + folder + '/' + characterId + '.png?v=' + version;
    }

    getPortrait(characterId) {
        return this.#getImage(characterId, 'portraits', 'portrait');
    }

    getImage(characterId) {
        return this.#getImage(characterId, 'characters', 'image');
    }

    getTier(characterId, tierList, defaultTier) {
        let character = this.getCharacter(characterId);
        if (character == null || !character.hasOwnProperty('tiers')) {
            return defaultTier;
        }
        return character.tiers.hasOwnProperty(tierList) ? character.tiers[tierList] : {tier_id: defaultTier, priority: 0};
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
}