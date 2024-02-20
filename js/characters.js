class Characters {
    #characters = {};
    #properties = {};
    #element = null;

    constructor(element) {
        this.#element = element;
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
        let controller = this;
        let container = controller.#element;
        Utilities.empty(container);
        let characters = this.getCharacterList();
        characters.forEach(function(character){
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(' + controller.getPortrait(character.id) + ')';
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
        let characterKey = portrait.dataset.character;
        let character = this.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        let popup = Utilities.showPopup(this.#element.parentNode, 'characterSheet');
        let image = Utilities.createDiv('sheetImage', popup);
        image.style.backgroundImage = 'url(' + this.getImage(characterKey) + ')';
        if (character.properties.hasOwnProperty('color')) {
            image.style.borderColor = character.properties.color.toLowerCase().replace(' ', '');
        }
        let propertiesDiv = Utilities.createDiv('sheetProperties', popup);
        let nameDiv = Utilities.createDiv('sheetName', propertiesDiv);
        nameDiv.innerText = character.full_name;
        let divider = document.createElement('hr');
        propertiesDiv.appendChild(divider);
        let propertiesTable = document.createElement('table');
        propertiesDiv.appendChild(propertiesTable);
        let propertiesBody = document.createElement('tbody');
        propertiesTable.appendChild(propertiesBody);
        let properties = {... this.getProperties() };
        if (character.backstory != null && character.backstory.length > 0) {
            properties['backstory'] = character.backstory;
        }
        for (let propertyId in properties) {
            if (!properties.hasOwnProperty(propertyId)) continue;
            if (!character.properties.hasOwnProperty(propertyId)) continue;
            let propertyRow = document.createElement('tr');
            propertiesBody.appendChild(propertyRow);
            let propertyHeader = document.createElement('th');
            propertyHeader.innerText = this.#properties[propertyId].name;
            propertyRow.appendChild(propertyHeader);
            let propertyValue = document.createElement('td');
            propertyValue.innerText = character.properties[propertyId];
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
        if (character.hasOwnProperty(dataKey) && character[dataKey].hasOwnProperty('url')) {
            return 'image/' + folder + '/' + character[dataKey].url;
        }
        return 'image/' + folder + '/' + characterId + '.png'
    }

    getPortrait(characterId) {
        return this.#getImage(characterId, 'portraits', 'portrait');
    }

    getSheet(characterId) {
        return this.#getImage(characterId, 'sheets', 'sheet');
    }

    getImage(characterId) {
        return this.#getImage(characterId, 'characters', 'image');
    }

    getTier(characterId, tierList, defaultTier) {
        let character = this.getCharacter(characterId);
        if (character == null || !character.hasOwnProperty('tiers')) {
            return defaultTier;
        }
        return character.tiers.hasOwnProperty(tierList) ? character.tiers[tierList] : defaultTier;
    }

    getProperties() {
        return this.#properties;
    }
}