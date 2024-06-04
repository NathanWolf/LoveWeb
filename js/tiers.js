class Tiers extends Component {
    #defaultGroup = null;
    #currentList = null;
    #tiers = {};
    #clicked = null;
    #dragging = false;
    #scrollThreshold = 0.20;
    #scrollSpeed = 100;
    #scrolling = 0;
    #scrollTimer = null;

    constructor(controller, element) {
        super(controller, element);
        let component = this;
        element.addEventListener('mousemove', function(event) {
            component.onMouseMove(event.clientX, event.clientY);
        });
        element.addEventListener('touchmove', function(event) {
            component.onMouseMove(event.touches[0].clientX, event.touches[0].clientY);
            if (component.#dragging) {
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
        let element = this.getElement();
        Utilities.empty(element);
        this.release();
        this.#currentList = null;
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
            element.appendChild(tierOption);
        }
    }

    getTierList(id) {
        return this.#tiers.hasOwnProperty(id) ? this.#tiers[id] : null;
    }

    onSelectTierList(id) {
        let element = this.getElement();
        let tierList = this.#tiers[id];
        let tiers = Utilities.mapArray(tierList.tiers);
        this.#currentList = id;
        Utilities.empty(element);
        let tierTitle = document.createElement('div');
        tierTitle.className = 'title';
        tierTitle.innerText = tierList.name;
        element.appendChild(tierTitle);
        this.getController().getHistory().set('list', id);
        let tierElements = {};
        tiers.unshift({
            'id': 'default',
            'name': '',
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
            tierLabel.innerText = tier.name;
            tierDiv.appendChild(tierLabel);
            element.appendChild(tierDiv);
            tierElements[tier.id] = tierDiv;
        }
        this.#defaultGroup = tierElements['default'];

        let controller = this;
        let characters = this.getController().getCharacters().getCharacterList();
        let characterTiers = [];
        for (let i = 0; i < characters.length; i++) {
            let character = characters[i];
            let tier = this.getController().getCharacters().getTier(character.id, id, 'default');
            characterTiers.push({character: character, tier: tier});
        }
        characterTiers.sort(function(a, b) {
            return b.tier.priority - a.tier.priority;
        });
        for (let i = 0; i < characterTiers.length; i++) {
            let character = characterTiers[i].character;
            let tier = characterTiers[i].tier.tier_id;
            let tierPortrait = document.createElement('div');
            tierPortrait.className = 'tierPortrait';
            tierPortrait.title = character.name;
            tierPortrait.style.backgroundImage = 'url(' + this.getController().getCharacters().getPortrait(character.id) + ')'
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
            this.#clicked.style.left = (x - 64) + 'px';
            this.#clicked.style.top = (y - 64) + 'px';

            // Auto-scroll
            let percentage = y / window.innerHeight;
            let topThreshold = this.#scrollThreshold;
            let bottomThreshold = 1 - this.#scrollThreshold;

            if (percentage < topThreshold) {
                this.#scrolling = -this.#scrollSpeed * (topThreshold - percentage) / topThreshold;
            } else if (percentage > bottomThreshold) {
                this.#scrolling = this.#scrollSpeed * (percentage - bottomThreshold) / this.#scrollThreshold;
            } else {
                this.#scrolling = 0;
            }

            if (!this.#dragging) {
                this.#dragging = true;
                Utilities.addClass(this.#clicked, 'dragging');
            }
        } else {
            this.#scrolling = 0;
        }
    }

    getTitle() {
        return 'Tier Lists';
    }

    activate() {
        super.activate();
        this.#startScrollTimer();
    }

    deactivate() {
        super.deactivate();
        clearTimeout(this.#scrollTimer);
        this.#scrolling = 0;
        this.#clicked = null;
        this.#dragging = false;
    }

    #checkScroll() {
        let element = this.getElement();
        let maxScroll = element.scrollHeight - element.offsetHeight;

        if (this.#scrolling != 0) {
            element.scrollTop = Math.max(Math.min(element.scrollTop + this.#scrolling, maxScroll), 0);
        }
        this.#startScrollTimer();
    }

    #startScrollTimer() {
        let component = this;
        this.#scrollTimer = setTimeout(function() {
            component.#checkScroll();
        }, 50);
    }

    getGroupedCharacters(tierListId) {
        let characterController = this.getController().getCharacters();
        let tierList = this.getTierList(tierListId);
        if (tierList == null) {
            tierList = {};
        }

        // Group characters by the grouping tier
        let characterGroups = {};
        let characters = characterController.getCharacterList();
        for (let tierId in tierList.tiers) {
            if (tierList.tiers.hasOwnProperty(tierId)) {
                let tier = tierList.tiers[tierId];
                characterGroups[tier.id] = {
                    name: tier.name,
                    color: tier.color,
                    dark: tier.dark,
                    characters: []
                };
            }
        }
        characterGroups['unknown'] = {name: 'Unknown', characters: [], color: 'grey', dark: 0};
        let defaultTier = {tier_id: 'unknown', priority: 0};
        for (let characterId in characters) {
            if (characters.hasOwnProperty(characterId) && !characters[characterId].hidden) {
                let character = characters[characterId];
                let tier = defaultTier;
                if (character.tiers.hasOwnProperty(tierListId)) {
                    tier = character.tiers[tierListId];
                } else {
                    tier = {...tier};
                    tier.persona_id = character.id;
                }
                characterGroups[tier.tier_id].characters.push(tier);
            }
        }

        // Sort by priority, then by name
        for (let tierId in characterGroups) {
            if (characterGroups.hasOwnProperty(tierId)) {
                characterGroups[tierId].characters.sort(function(a, b) {
                    if (b.priority == a.priority) {
                        return a.persona_id.localeCompare(b.persona_id);
                    }
                    return b.priority - a.priority;
                });
            }
        }

        return characterGroups;
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let list = history.get('list');
        if (this.#currentList != list) {
            if (list == null) {
                this.show();
            } else {
                this.onSelectTierList(list);
            }
        }
    }

    deactivate() {
        this.getController().getHistory().unset('list');
    }
}
