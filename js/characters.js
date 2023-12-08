class Characters {
    #characters = {};
    #sheetElement = null;
    #sheetPopupElement = null;
    #listElement = null;

    addCharacters(characters) {
        for (let id in characters) {
            if (characters.hasOwnProperty(id)) {
                this.#characters[id] = characters[id];
            }
        }
    }

    setSheetElement(container) {
        this.#sheetElement = container;
    }

    setSheetPopupElement(container) {
        this.#sheetPopupElement = container;
    }

    setListElement(container) {
        this.#listElement = container;
    }

    #checkElements() {
        if (this.#sheetElement == null) throw new Error("Sheet element not set");
        if (this.#sheetPopupElement == null) throw new Error("Sheet popup element not set");
        if (this.#listElement == null) throw new Error("List element not set");
    }

    getCharacterList() {
        return Object.values(this.#characters);
    }

    getCharacter(id) {
        return this.#characters.hasOwnProperty(id) ? this.#characters[id] : null;
    }

    showPortraits() {
        this.#checkElements();
        let controller = this;
        let container = controller.#listElement;
        let characters = this.getCharacterList();
        characters.forEach(function(character){
            let image = character.id + ".png";
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(image/portraits/' + image + ')';
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
        this.#checkElements();

        let characterKey = portrait.dataset.character;
        let character = this.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        if (character.sheet) {
            this.#sheetPopupElement.style.display = 'flex';
            this.#sheetElement.style.backgroundImage = "url('image/sheets/" + characterKey + ".png')";
        } else {
            document.getElementById('characterSheetMissingName').innerText = character.name;
            document.getElementById('characterSheetMissingPopup').style.display = 'flex';
        }
    }
}