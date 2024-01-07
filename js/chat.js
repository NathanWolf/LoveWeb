class Chat {
    #characters = {};
    #element = null;

    constructor(element, characters) {
        this.#element = element;
        this.#characters = characters;
    }

    show() {
        let controller = this;
        let container = controller.#element;
        Utilities.empty(container);
        let characters = this.#characters;
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character){
            if (!character.hasOwnProperty('chat')) return;
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(' + characters.getPortrait(character.id) + ')';
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
        let character = this.#characters.getCharacter(characterKey);
        if (character == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        alert("Chat coming soon!");
    }
}