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
        let characterKey = portrait.dataset.character;
        let character = this.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        if (character.sheet) {
            let popup = Utilities.showPopup(this.#element.parentNode, 'characterSheet');
            popup.style.backgroundImage = "url('image/sheets/" + characterKey + ".png')";
        } else {
            let popup = Utilities.showPopup(this.#element.parentNode, 'characterSheetMissing');
            let contentSpan = document.createElement('span');
            contentSpan.innerText = 'Information on ';
            let nameSpan = document.createElement('span');
            nameSpan.className = 'characterSheetMissingName';
            let contentSpan2 = document.createElement('span');
            contentSpan2.innerText = ' Coming soon!';
            popup.appendChild(contentSpan);
            popup.appendChild(nameSpan);
            popup.appendChild(contentSpan2);
        }
    }
}