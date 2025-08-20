class Dressup extends Component {
    #container;
    #characterContainer;
    #characterId;
    #outfitId;
    #outfitTitle;
    #dressupCharacters = {};
    #categories = {};
    #items = {};

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
        this.loadHistory();
        if (this.#characterId != null) {
            this.showCharacter(this.#characterId, this.#outfitId);
        } else {
            this.showCharacterSelect();
        }
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
        this.#setCharacterId(null);
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

    #setCharacterId(characterId) {
        this.#characterId = characterId;
        this.getController().getHistory().setOrClear('character', characterId);
    }

    #setOutfitId(outfitId, outfitTitle) {
        this.#outfitId = outfitId;
        this.#outfitTitle = outfitTitle;
        this.getController().updateTitle();
        this.getController().getHistory().setOrClear('outfit', outfitId);
    }

    getCategory(categoryId) {
        let category = this.#categories[categoryId];
        if (this.#characterId != null) {
            let character = this.#dressupCharacters[this.#characterId];
            if (character.categories.hasOwnProperty(categoryId)) {
                let characterCategory = character.categories[categoryId];
                let omitNull = obj => {
                    Object.keys(obj).filter(key => obj[key] === null).forEach(key => delete(obj[key]))
                    return obj
                }
                category = { ...omitNull(category), ...omitNull(characterCategory) }
            }
        }

        return category;
    }

    showCharacter(characterId, outfitId) {
        if (!this.#dressupCharacters.hasOwnProperty(characterId)) {
            alert("Something went wrong, please try again!");
            this.showCharacterSelect();
            return;
        }
        let controller = this;
        this.#items = {};
        this.#outfitId = null;
        this.#setCharacterId(characterId);
        Utilities.empty(this.#container);
        let dressupCharacter = this.#dressupCharacters[characterId];
        let characterContainer = Utilities.createDiv('dressupCharacterContainer', this.#container);
        this.#characterContainer = characterContainer;
        let baseImage = Utilities.createDiv('dressupLayer dressupBase', characterContainer);
        baseImage.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/base.png?version=' + _version +')';
        let aspectRatio = dressupCharacter.width / dressupCharacter.height;
        baseImage.style.aspectRatio = aspectRatio.toString();

        let controlsContainer = Utilities.createDiv('dressupControlsContainer', this.#container);
        let buttonsContainer = Utilities.createDiv('dressupButtonsContainer', controlsContainer);
        let randomizeButton = Utilities.createElement('button', 'dressupButton', buttonsContainer, 'Randomize');
        randomizeButton.addEventListener('click', function() {
            controller.randomize();
        });
        let clearButton = Utilities.createElement('button', 'dressupButton', buttonsContainer, 'Clear');
        clearButton.addEventListener('click', function() {
            controller.clear();
        });
        let shareButton = Utilities.createElement('button', 'dressupButton', buttonsContainer, 'Share');
        shareButton.addEventListener('click', function() {
            controller.share();
        });
        let itemContainer = Utilities.createDiv('dressupItemContainer', controlsContainer);
        for (let categoryId in this.#categories) {
            if (!this.#categories.hasOwnProperty(categoryId)) continue;
            if (!dressupCharacter.items.hasOwnProperty(categoryId)) continue;
            this.#items[categoryId] = {};
            let category = this.getCategory(categoryId);
            let categoryHeader = Utilities.createDiv('dressupCategoryHeader', itemContainer);
            categoryHeader.innerText = category.name;
            let categoryContainer = Utilities.createDiv('dressupCategoryContainer', itemContainer);
            let categoryItems = dressupCharacter.items[categoryId];
            for (let itemId in categoryItems) {
                if (!categoryItems.hasOwnProperty(itemId)) continue;
                let item = categoryItems[itemId];
                let itemLayer = Utilities.createDiv('dressupLayer', characterContainer);
                itemLayer.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/items/' + categoryId + '/' + itemId + '.png?version=' + _version +')';
                itemLayer.style.display = 'none';
                itemLayer.style.zIndex = (10 + item.layer).toString();
                itemLayer.style.aspectRatio = aspectRatio.toString();

                let itemThumbnail = Utilities.createDiv('dressupThumbnail', categoryContainer);
                itemThumbnail.style.backgroundImage = 'url(image/dressup/characters/' + characterId + '/thumbnails/' + categoryId + '/' + itemId + '.png?version=' + _version +')';
                itemThumbnail.title = item.title;

                this.#items[categoryId][itemId] = {
                    itemLayer: itemLayer,
                    itemThumbnail: itemThumbnail,
                    visible: false
                };

                itemThumbnail.addEventListener('click', e => {
                    controller.toggleItem(categoryId, itemId);
                });
            }
        }

        if (outfitId == null) {
            if (dressupCharacter.default_outfit != null) {
                this.showOutfit(JSON.parse(dressupCharacter.default_outfit));
            } else {
                this.randomize();
            }
        } else {
            this.loadOutfit(outfitId);
        }
    }

    hideItem(categoryId, itemId) {
        let item = this.#items[categoryId][itemId];
        Utilities.removeClass(item.itemThumbnail, 'selected');
        item.itemLayer.style.display = 'none';
        item.visible = false;
        this.#setOutfitId(null, null);
    }

    showItem(categoryId, itemId) {
        if (!this.#items.hasOwnProperty(categoryId)) return;
        if (!this.#items[categoryId].hasOwnProperty(itemId)) return;
        let item = this.#items[categoryId][itemId];
        Utilities.addClass(item.itemThumbnail, 'selected');
        item.itemLayer.style.display = 'block';
        item.visible = true;
        this.#setOutfitId(null, null);
    }

    toggleItem(categoryId, itemId) {
        if (this.#items[categoryId][itemId].visible) {
            this.hideItem(categoryId, itemId);
        } else {
            this.showItem(categoryId, itemId);
            this.showItemPopup(categoryId, itemId);
        }
    }

    showItemPopup(categoryId, itemId) {
        let dressupCharacter = this.#dressupCharacters[this.#characterId];
        let item = dressupCharacter.items[categoryId][itemId];
        if (item.title != null && item.title.length > 0) {
            let title = item.title;
            let category = this.#categories[categoryId];
            if (category.name != null && category.name.length > 0 && category.name != title) {
                title = category.name + ' : ' + title;
            }
            let popupLayer = Utilities.createDiv('dressupItemPopup', this.#characterContainer, title);
            setTimeout(function() {
               popupLayer.remove();
            }, 2000);
        }
    }

    clear() {
        for (let categoryId in this.#items) {
            if (!this.#items.hasOwnProperty(categoryId)) continue;
            for (let itemId in this.#items[categoryId]) {
                if (!this.#items[categoryId].hasOwnProperty(itemId)) continue;
                if (this.#items[categoryId][itemId].visible) {
                    this.hideItem(categoryId, itemId);
                }
            }
        }
    }

    #processShare(response) {
        if (response == null || !response.success) {
            let message = "Failed to save outfit, please try again!";
            if (response != null && response.hasOwnProperty("message")) {
                message += " (" + response.message + ")";
            }
            alert(message);
            return;
        }
        this.#setOutfitId(response.outfit.id, response.title);
        let title = 'Diviinity (Dressup';
        if (response.title != null) {
            title += ' | ' + response.title;
        }
        title += ')';
        try {
            navigator.share({
                title: title,
                text: 'Check out this cool character outfit I made!',
                url: window.location.href
            });
        } catch (e) {
            // Ignored, this may just be the user cancelling the share
        }
    }

    share() {
        let title = prompt("What do you want to call this outfit?")

        const request = new XMLHttpRequest();
        let controller = this;
        request.onload = function() {
            controller.#processShare(this.response);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to save outfit, sorry!"); };
        let items = [];

        for (let categoryId in this.#items) {
            if (!this.#items.hasOwnProperty(categoryId)) continue;
            for (let itemId in this.#items[categoryId]) {
                if (!this.#items[categoryId].hasOwnProperty(itemId)) continue;
                if (this.#items[categoryId][itemId].visible) {
                    let itemRecord = {
                        category_id: categoryId,
                        image_id: itemId
                    };
                    items.push(itemRecord);
                }
            }
        }
        let outfit = {items: items};
        let url = "data/love.php?action=save_outfit&character=" + this.#characterId + "&outfit=" + JSON.stringify(outfit);
        let user = this.getController().getProfile().getUser();
        if (user != null) {
            url += "&user_id=" + user.id + "&user_token=" + user.token;
        }
        if (title != null) {
            url += '&title=' + encodeURIComponent(title);
        }
        request.open("POST", url, true);
        request.send();
    }

    #processLoadOutfit(response) {
        if (response == null || !response.success) {
            let message = "Failed to load outfit, please try again!";
            if (response != null && response.hasOwnProperty("message")) {
                message += " (" + response.message + ")";
            }
            alert(message);
            return;
        }
        let outfit = JSON.parse(response.outfit.outfit);
        this.showOutfit(outfit);
        // Reset history but avoid reloading
        this.#outfitId = response.outfit.id;
        let title = response.outfit.hasOwnProperty('user') && outfit.user != null ? response.outfit.user.title : null;
        this.#setOutfitId(this.#outfitId, title);
    }

    showOutfit(outfit) {
        this.clear();
        for (let i = 0; i < outfit.items.length; i++) {
            this.showItem(outfit.items[i]['category_id'], outfit.items[i]['image_id']);
        }
    }

    loadOutfit(outfitId) {
        this.#outfitId = outfitId;
        const request = new XMLHttpRequest();
        let controller = this;
        request.onload = function() {
            controller.#processLoadOutfit(this.response);
        };
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to load outfit, sorry!"); };
        let url = "data/love.php?action=load_outfit&id=" + outfitId;
        let user = this.getController().getProfile().getUser();
        if (user != null) {
            url += "&user_id=" + user.id + "&user_token=" + user.token;
        }
        request.open("POST", url, true);
        request.send();
    }

    randomize() {
        this.clear();
        let linked = {};
        let dressupCharacter = this.#dressupCharacters[this.#characterId];
        for (let categoryId in dressupCharacter.items) {
            if (!this.#categories.hasOwnProperty(categoryId)) continue;
            if (!dressupCharacter.items.hasOwnProperty(categoryId)) continue;
            let category = this.getCategory(categoryId);
            let limit = category.max_items;
            let required = category.min_items;
            let items = 0;
            let probability = category.probability;
            let remaining = Object.keys(dressupCharacter.items[categoryId]);
            while (true) {
                if (remaining.length == 0) break;
                if (items >= limit) break;
                if (items >= required && Math.random() > probability) break;
                let itemId = null;
                if (linked.hasOwnProperty(categoryId) && linked[categoryId].length > 0) {
                    itemId = linked[categoryId].pop();
                } else {
                    let index = Math.floor(Math.random() * remaining.length);
                    itemId = remaining[index];
                    remaining.splice(index, 1);
                    if (category.linked_category_id != null) {
                        let item = dressupCharacter.items[categoryId][itemId];
                        if (item.linked_image_id != null) {
                            if (!linked.hasOwnProperty(category.linked_category_id)) {
                                linked[category.linked_category_id] = [];
                            }
                            linked[category.linked_category_id].push(item.linked_image_id);
                        }
                    }
                }

                this.showItem(categoryId, itemId);
                items++;
                probability *= category.probability_ratio;
            }
        }
    }

    loadHistory() {
        let history = this.getController().getHistory();
        this.#characterId = history.get('character');
        this.#outfitId = history.get('outfit');
    }

    onHistoryChange() {
        let oldCharacterId = this.#characterId;
        let oldOutfitId = this.#outfitId;
        this.loadHistory();;
        if (this.#characterId != oldCharacterId) {
            if (this.#characterId == null) {
                this.showCharacterSelect();
            } else {
                this.showCharacter(this.#characterId);
            }
        } else if (this.#outfitId != oldOutfitId) {
            this.loadOutfit(this.#outfitId);
        }
    }

    deactivate() {
        this.#setCharacterId(null);
    }

    getTitle() {
        let title = 'Dressup';
        if (this.#outfitTitle != null) {
            title += ' | ' + this.#outfitTitle;
        }
        return title;
    }

    hasCharacter(characterId) {
        return this.#dressupCharacters.hasOwnProperty(characterId);
    }
}
