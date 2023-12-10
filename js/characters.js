class Characters {
    #characters = {};
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

    getCharacterList() {
        return Object.values(this.#characters);
    }

    getCharacter(id) {
        return this.#characters.hasOwnProperty(id) ? this.#characters[id] : null;
    }

    show() {
        let controller = this;
        let container = controller.#element;
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
        if (character.sheet) {
            let popup = Utilities.showPopup(this.#element.parentNode, 'characterSheet');
            popup.style.backgroundImage = 'url(' + this.getSheet(characterKey) + ')';
        } else {
            let popup = Utilities.showPopup(this.#element.parentNode, 'characterSheetMissing');
            let contentSpan = document.createElement('span');
            contentSpan.innerText = 'Information on ';
            let nameSpan = document.createElement('span');
            nameSpan.className = 'characterSheetMissingName';
            nameSpan.innerText = character.name;
            let contentSpan2 = document.createElement('span');
            contentSpan2.innerText = ' Coming soon!';
            popup.appendChild(contentSpan);
            popup.appendChild(nameSpan);
            popup.appendChild(contentSpan2);
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
}