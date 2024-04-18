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
        return Object.values(this.#characters);
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
                header.style.color = 'white';
            }
            group.characters.forEach(function(characterTier) {
                let character = characterController.getCharacter(characterTier.persona_id);
                let portrait = document.createElement('div');
                portrait.className = 'portrait';
                portrait.style.backgroundImage = 'url(' + characterController.getPortrait(character.id) + ')';
                characterList.appendChild(portrait);
                let portraitName = document.createElement('div');
                portraitName.className = 'portraitName';
                portraitName.dataset.character = character.id;
                portraitName.innerText = character.name;
                portraitName.addEventListener('click', function(event) {
                    characterController.onPortraitClick(event.target);
                })
                characterList.appendChild(portraitName);
                character.containers = {
                    portrait: portrait,
                    name: portraitName
                };
            });
        });
    }

    onPortraitClick(portrait) {
        let characterKey = portrait.dataset.character;
        this.#showCharacterPopup(characterKey);
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
        let image = Utilities.createDiv('sheetImage', popup);
        image.style.backgroundImage = 'url(' + this.getImage(characterKey) + ')';
        if (character.properties.hasOwnProperty('color')) {
            image.style.borderColor = character.properties.color.toLowerCase().replace(' ', '');
        }
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

        let relationships = this.getRelationshipList(characterKey);
        if (relationships.length > 0) {
            let propertyRow = document.createElement('tr');
            propertyRow.className = 'headerRow';
            propertiesBody.appendChild(propertyRow);
            let propertyHeader = document.createElement('th');
            propertyHeader.colSpan = 2;
            propertyRow.appendChild(propertyHeader);
            propertyHeader.innerText = 'Relationships';
            propertyRow.appendChild(propertyHeader);
        }
        for (let i = 0; i < relationships.length; i++) {
            let relationship = relationships[i];
            let propertyRow = document.createElement('tr');
            propertiesBody.appendChild(propertyRow);
            let propertyHeader = document.createElement('th');
            propertyHeader.innerText = relationship.name;
            propertyRow.appendChild(propertyHeader);
            let propertyValue = document.createElement('td');
            let related = this.getCharacter(relationship.character);
            propertyValue.innerText = related.name;
            propertyRow.appendChild(propertyValue);
        }
    }

    static getRelationshipName(relationshipId) {
        // Maybe add a relationships.json?
        return Utilities.humanizeKey(relationshipId);
    }

    getRelationshipList(characterId) {
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