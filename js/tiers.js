class Tiers {
    #characters = null;
    #element;
    #tiers = {};
    #currentTierList = null;
    #currentTierElements = [];

    constructor(element, characters) {
        this.#element = element;
        this.#characters = characters;
        if (this.#element == null) {
            throw new Error("Element not set");
        }
    }

    addTiers(tiers) {
        for (let id in tiers) {
            if (tiers.hasOwnProperty(id)) {
                this.#tiers[id] = tiers[id];
            }
        }
    }

    show() {
        Utilities.empty(this.#element);
        let controller = this;
        for (let tierId in this.#tiers) {
            if (!this.#tiers.hasOwnProperty(tierId)) continue;
            let tier = this.#tiers[tierId];
            let tierOption = document.createElement('div');
            tierOption.dataset.tier = tierId;
            tierOption.addEventListener('click', function() {
                controller.onSelectTierList(this.dataset.tier);
            });
            tierOption.className = 'option';
            tierOption.innerText = tier.name;
            this.#element.appendChild(tierOption);
        }
    }

    onSelectTierList(id) {
        this.#currentTierList = id;
        let tierList = this.#tiers[id];
        Utilities.empty(this.#element);
        let tierTitle = document.createElement('div');
        tierTitle.className = 'title';
        tierTitle.innerText = tierList.name;
        this.#element.appendChild(tierTitle);
        this.#currentTierElements = [];
        for (let i = 0; i < tierList.tiers.length; i++) {
            let tier = tierList.tiers[i];
            let tierDiv = document.createElement('div');
            tierDiv.className = 'tier';
            tierDiv.style.backgroundColor = tier.color;
            let tierLabel = document.createElement('div');
            tierLabel.className = 'label';
            tierLabel.innerText = tier.title;
            tierDiv.appendChild(tierLabel);
            this.#element.appendChild(tierDiv);
            this.#currentTierElements.push(tierDiv);
        }

        // Temporary!
        let characters = this.#characters.getCharacterList();
        for (let i = 0; i < characters.length; i++) {
            let character = characters[i];
            let tierIndex = Math.floor(Math.random() * this.#currentTierElements.length);
            let tierPortrait = document.createElement('div');
            tierPortrait.className = 'tierPortrait';
            tierPortrait.style.backgroundImage = 'url(image/portraits/' + character.id + '.png)'
            this.#currentTierElements[tierIndex].appendChild(tierPortrait);
        }
    }
}
