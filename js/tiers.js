class Tiers {
    #characters = null;
    #element;
    #defaultGroup = null;
    #tiers = {};
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
        this.#element.addEventListener('touchmove', function(event) {
            controller.onMouseMove(event.touches[0].clientX, event.touches[0].clientY);
            if (controller.#dragging) {
                event.preventDefault();
            }
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
        let tierList = this.#tiers[id];
        let tiers = Utilities.mapArray(tierList.tiers);
        Utilities.empty(this.#element);
        let tierTitle = document.createElement('div');
        tierTitle.className = 'title';
        tierTitle.innerText = tierList.name;
        this.#element.appendChild(tierTitle);
        let tierElements = {};
        tiers.unshift({
            'id': 'default',
            'title': '',
            'color': 'white'
        });
        for (let i = 0; i < tiers.length; i++) {
            let tier = tiers[i];
            let tierDiv = document.createElement('div');
            tierDiv.className = 'tier';
            tierDiv.style.backgroundColor = tier.color;
            let tierLabel = document.createElement('div');
            tierLabel.className = 'label';
            if (tier.hasOwnProperty('dark') && tier.dark) {
                tierLabel.className += ' dark';
            }
            tierLabel.innerText = tier.title;
            tierDiv.appendChild(tierLabel);
            this.#element.appendChild(tierDiv);
            tierElements[tier.id] = tierDiv;
        }
        this.#defaultGroup = tierElements['default'];

        let controller = this;
        let characters = this.#characters.getCharacterList();
        for (let i = 0; i < characters.length; i++) {
            let character = characters[i];
            let tier = this.#characters.getTier(character.id, id, 'default');
            let tierPortrait = document.createElement('div');
            tierPortrait.className = 'tierPortrait';
            tierPortrait.title = character.name;
            tierPortrait.style.backgroundImage = 'url(' + this.#characters.getPortrait(character.id) + ')'
            tierElements[tier].appendChild(tierPortrait);

            tierPortrait.addEventListener('mousedown', function() {
                controller.onPortraitGrab(this);
            });

            tierPortrait.addEventListener('mouseup', function() {
                controller.onPortraitRelease(this);
            });

            tierPortrait.addEventListener('touchstart', function() {
                controller.onPortraitGrab(this);
            });

            tierPortrait.addEventListener('touchend', function() {
                controller.onPortraitRelease(this);
            });

            tierPortrait.addEventListener('touchcancel', function() {
                controller.onCancelDrag();
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

    onCancelDrag() {
        this.release();
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
            // Check to see if the default group is empty
            // Hackily making room for the title div- would be better to look for any children of type tierPortrait
            if (this.#defaultGroup != null && this.#defaultGroup.childNodes.length <= 1) {
                this.#defaultGroup.style.display = 'none';
                this.#defaultGroup = null;
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
