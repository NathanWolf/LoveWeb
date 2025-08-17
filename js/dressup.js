class Dressup extends Component {
    #container;
    #characterId;
    #dressupCharacters = {};
    #categories = {};

    constructor(controller, element) {
        super(controller, element)
    }

    addData(dressup) {
        for (let id in dressup.characters) {
            if (dressup.characters.hasOwnProperty(id)) {
                this.#dressupCharacters[id] = dressup.characters[id];
            }
        }
        for (let id in dressup.categories) {
            if (dressup.categories.hasOwnProperty(id)) {
                this.#categories[id] = dressup.categories[id];
            }
        }
    }

    show() {
        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('dressupContainer', element);

        this.showCharacterSelect();
    }

    #createPortrait(characterId) {
        let characters = this.getController().getCharacters();
        let character = characters.getCharacter(characterId);
        let dressupCharacter = this.#dressupCharacters[characterId];
        let name = character.name;
        let portraitId = dressupCharacter.portrait_id != null ? dressupCharacter.portrait_id : 'portrait';
        let portraitContainer = document.createElement('div');
        portraitContainer.className = 'portraitContainer';

        let portraitName = document.createElement('div');
        portraitName.className = 'portraitName';
        portraitName.dataset.character = character.id;
        portraitName.innerText = name;
        portraitContainer.appendChild(portraitName);

        let portrait = document.createElement('div');
        portrait.className = 'portrait';
        portrait.style.backgroundImage = 'url(' + characters.getImage(character.id, portraitId) + ')';
        portraitContainer.appendChild(portrait);

        return portraitContainer;
    }

    showCharacterSelect() {
        let controller = this;
        this.#characterId = null;
        Utilities.empty(this.#container);

        let dressupCharacterChoice = Utilities.createDiv('dressupCharacterChoice', this.#container);
        Utilities.createDiv('dressupCharacterChoiceHeader', dressupCharacterChoice, 'Who do you want to dress up?');
        let dressupCharacters = Utilities.createDiv('dressupCharacterList', dressupCharacterChoice);
        for (let characterId  in this.#dressupCharacters) {
            if (!this.#dressupCharacters.hasOwnProperty(characterId)) continue;
            let portraitContainer = controller.#createPortrait(characterId);
            portraitContainer.addEventListener('click', function() {
                controller.showCharacter(characterId);
            });
            dressupCharacters.appendChild(portraitContainer);
        }
    }

    showCharacter(characterId) {
        if (!this.#dressupCharacters.hasOwnProperty(characterId)) {
            alert("Something went wrong, please try again!");
            this.showCharacterSelect();
            return;
        }
        this.#characterId = characterId;
        this.getController().getHistory().set('character', characterId);
        Utilities.empty(this.#container);
        let dressupCharacter = this.#dressupCharacters[characterId];
        let characterContainer = Utilities.createDiv('dressupCharacterContainer', this.#container);
        let baseImage = Utilities.createDiv('dressupLayer dressupBase', characterContainer);
        baseImage.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/base.png)';
        let aspectRatio = dressupCharacter.width / dressupCharacter.height;
        baseImage.style.aspectRatio = aspectRatio.toString();

        let itemContainer = Utilities.createDiv('dressupItemContainer', this.#container);
        for (let categoryId in dressupCharacter.items) {
            if (!this.#categories.hasOwnProperty(categoryId)) continue;
            if (!dressupCharacter.items.hasOwnProperty(categoryId)) continue;
            let category = this.#categories[categoryId];
            let categoryHeader = Utilities.createDiv('dressupCategoryHeader', itemContainer);
            categoryHeader.innerText = category.name;
            let categoryContainer = Utilities.createDiv('dressupCategoryContainer', itemContainer);
            let categoryItems = dressupCharacter.items[categoryId];
            for (let itemId in categoryItems) {
                if (!categoryItems.hasOwnProperty(itemId)) continue;
                let item = categoryItems[itemId];
                let itemLayer = Utilities.createDiv('dressupLayer', characterContainer);
                itemLayer.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/items/' + categoryId + '/' + itemId + '.png)';
                itemLayer.style.display = 'none';
                itemLayer.style.zIndex = (10 + item.layer).toString();
                itemLayer.style.aspectRatio = aspectRatio.toString();

                let itemThumbnail = Utilities.createDiv('dressupThumbnail', categoryContainer);
                itemThumbnail.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/thumbnails/' + categoryId + '/' + itemId + '.png)';
                itemThumbnail.title = item.title;

                itemThumbnail.addEventListener('click', e => {
                    if (itemLayer.style.display == 'none') {
                        Utilities.addClass(itemThumbnail, 'selected');
                        itemLayer.style.display = 'block';
                    } else {
                        Utilities.removeClass(itemThumbnail, 'selected');
                        itemLayer.style.display = 'none';
                    }
                });
            }
        }
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let characterId = history.get('character');
        if (this.#characterId != characterId) {
            if (characterId == null) {
                this.showCharacterSelect();
            } else {
                this.showCharacter(characterId);
            }
        }
    }

    deactivate() {
        this.#characterId = null
        this.getController().getHistory().unset('character');
    }
}
