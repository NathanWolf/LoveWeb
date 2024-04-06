class Characters extends Component {
    #groupTierList = 'renown';
    #popupCharacterId = null;
    #characters = {};
    #properties = {};

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

    show() {
        let characterController = this;
        let container = this.getElement();
        let tiers = this.getController().getTiers();

        // Group characters by the grouping tier
        let characterGroups = tiers.getGroupedCharacters(this.#groupTierList);

        // Show grouped characters with group banners
        Utilities.empty(container);
        Object.values(characterGroups).forEach(function(group) {
            if (group.characters.length == 0) return;
            let header = Utilities.createDiv('characterGroupHeader', container);
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
                container.appendChild(portrait);
                let portraitName = document.createElement('div');
                portraitName.className = 'portraitName';
                portraitName.dataset.character = character.id;
                portraitName.innerText = character.name;
                portraitName.addEventListener('click', function(event) {
                    characterController.onPortraitClick(event.target);
                })
                container.appendChild(portraitName);
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