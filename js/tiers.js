class Tiers {
    #characters = null;
    #element;
    #tiers = {};
    #currentTierList = null;
    #currentTierElements = [];
    #clicked = null;
    #dragging = false;

    constructor(element, characters) {
        this.#element = element;
        this.#characters = characters;
        if (this.#element == null) {
            throw new Error("Element not set");
        }

        let controller = this;
        this.#element.addEventListener('mousemove', function(event) {
            controller.onMouseMove(event.x, event.y);
        });
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
        this.release();
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

        // Start off randomized
        let controller = this;
        let characters = this.#characters.getCharacterList();
        for (let i = 0; i < characters.length; i++) {
            let character = characters[i];
            let tierIndex = Math.floor(Math.random() * this.#currentTierElements.length);
            let tierPortrait = document.createElement('div');
            tierPortrait.className = 'tierPortrait';
            tierPortrait.style.backgroundImage = 'url(' + this.#characters.getPortrait(character.id) + ')'
            this.#currentTierElements[tierIndex].appendChild(tierPortrait);

            tierPortrait.addEventListener('mousedown', function() {
                controller.onPortraitGrab(this);
            });

            tierPortrait.addEventListener('mouseup', function() {
                controller.onPortraitRelease(this);
            });
        }
    }

    onPortraitGrab(portrait) {
        this.#clicked = portrait;
    }

    release() {
        if (this.#clicked != null) {
            this.#clicked.style.left = '';
            this.#clicked.style.top = '';
            if (this.#dragging) {
                Utilities.removeClass(this.#clicked, 'dragging');
            }
        }
        this.#dragging = false;
        this.#clicked = null;
    }

    onPortraitRelease(portrait) {
        if (this.#clicked === portrait) {
            // Find the closest tier and insert them into the list
            let bounds = portrait.getBoundingClientRect();
            let center = [(bounds.left + bounds.right) / 2, (bounds.top + bounds.bottom) / 2];
            let draggingOver = document.elementsFromPoint(center[0], center[1]);
            for (let dragIndex = 0; dragIndex < draggingOver.length; dragIndex++) {
                let draggedOver = draggingOver[dragIndex];
                if (Utilities.hasClass(draggedOver, 'dragging')) continue;
                if (Utilities.hasClass(draggedOver, 'tier')) {
                    draggedOver.appendChild(portrait);
                    break;
                } else if (Utilities.hasClass(draggedOver, 'tierPortrait')) {
                    draggedOver.parentNode.insertBefore(portrait, draggedOver);
                    break;
                }
            }

            this.release();
        }
    }

    onMouseMove(x, y) {
        if (this.#clicked != null) {
            x -= 64;
            y -= 64;
            this.#clicked.style.left = x + 'px';
            this.#clicked.style.top = y + 'px';

            if (!this.#dragging) {
                this.#dragging = true;
                Utilities.addClass(this.#clicked, 'dragging');
            }
        }
    }
}
