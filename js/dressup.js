class Dressup extends Component {
    #container;
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

    showCharacterSelect() {
        // Skipping for now!
        this.showCharacter('thirteen');
    }

    showCharacter(characterId) {
        if (!this.#dressupCharacters.hasOwnProperty(characterId)) {
            alert("Something went wrong, please try again!");
            this.showCharacterSelect();
            return;
        }
        Utilities.empty(this.#container);
        let dressupCharacter = this.#dressupCharacters[characterId];
        let characterContainer = Utilities.createDiv('dressupCharacterContainer', this.#container);
        let baseImage = Utilities.createDiv('dressupLayer dressupBase', characterContainer);
        baseImage.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/base.png)';

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
}
