class Cards extends Component {
    #gameContainer = null;
    #configureContainer = null;
    #mediaTiers = {};
    #renownTiers = {};
    #deck = [];

    constructor(controller, element) {
        super(controller, element);

        this.#gameContainer = document.getElementById('cardsGameContainer');
        this.#configureContainer = document.getElementById('cardsConfigureContainer');
    }

    show() {
        if (this.#gameContainer == null || this.#configureContainer == null) {
            alert("Something went wrong, game is missing some elements");
            return;
        }
        this.#configureNewGame();
    }

    #addConfigureOption(container, title, checked) {
        let option = Utilities.createDiv('configureChoiceContainer', container);
        let checkboxContainer = Utilities.createDiv('configureChoiceInput', option);
        let checkbox = Utilities.createElement('input', '', checkboxContainer);
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        Utilities.createDiv('configureChoiceLabel', option, title);
        return checkbox;
    }

    #configureNewGame() {
        let controller = this;

        let tierController = this.getController().getTiers();
        let renownTiers = Object.values(tierController.getTierList('renown').tiers);
        let mediaTiers = Object.values(tierController.getTierList('media').tiers);

        if (renownTiers == null || mediaTiers == null) {
            alert("Could not find the right tier lists to choose");
            return;
        }

        let configureContainer = this.#configureContainer;
        Utilities.empty(configureContainer);

        // Start game button
        let buttonContainer = Utilities.createDiv('cardsConfigureContainer', configureContainer);
        let startGameButton = Utilities.createElement('button', 'cardsStartGameButton', buttonContainer, 'Start Game');

        // Importance choices
        Utilities.createDiv("cardsConfigureChoiceHeader", configureContainer, 'Which Characters to Include?');
        let renownChoiceContainer = Utilities.createDiv('cardsConfigureChoiceContainer', configureContainer);
        renownTiers.sort((a, b) => b.priority - a.priority);
        let renownCheckboxes = {};
        for (const tier of renownTiers) {
            let checked = tier.id == 'main' || tier.id == 'primary' || tier.id == 'uncanon';
            renownCheckboxes[tier.id] = this.#addConfigureOption(renownChoiceContainer, tier.name, checked);
        }

        // Media choices
        Utilities.createDiv("cardsConfigureChoiceHeader", configureContainer, 'Which Media to Include?');
        let mediaChoiceContainer = Utilities.createDiv('cardsConfigureChoiceContainer', configureContainer);
        let mediaCheckboxes = {};
        mediaTiers.sort((a, b) => b.priority - a.priority);
        for (const tier of mediaTiers) {
            let checked = tier.id == 'diviine' || tier.id == 'spliit' || tier.id == 'siin' || tier.id == 'ruiin';
            mediaCheckboxes[tier.id] = this.#addConfigureOption(mediaChoiceContainer, tier.name, checked);
        }
        mediaCheckboxes['none'] = this.#addConfigureOption(mediaChoiceContainer, 'None', true);

        startGameButton.addEventListener('click', function() {
            controller.#mediaTiers = {};
            for (let checkboxKey in mediaCheckboxes) {
                if (mediaCheckboxes.hasOwnProperty(checkboxKey) && mediaCheckboxes[checkboxKey].checked) {
                    controller.#mediaTiers[checkboxKey] = true;
                }
            }
            for (let checkboxKey in renownCheckboxes) {
                if (renownCheckboxes.hasOwnProperty(checkboxKey) && renownCheckboxes[checkboxKey].checked) {
                    controller.#renownTiers[checkboxKey] = true;
                }
            }
            controller.startGame();
        });

        Utilities.setVisible(this.#gameContainer, false);
        Utilities.setVisible(configureContainer, true);
    }

    buildDeck() {
        this.#deck = [];
        let characterList = this.getController().getCharacters().getCharacterList();
        for (const character of characterList) {
            let characterRenown = character.tiers.hasOwnProperty('renown') ? character.tiers['renown']['tier_id'] : 'none';
            let characterMedia = character.tiers.hasOwnProperty('media') ? character.tiers['media']['tier_id'] : 'none';
            if (this.#mediaTiers.hasOwnProperty(characterMedia) && this.#renownTiers.hasOwnProperty(characterRenown)) {
                this.#deck.push(character.id);
            }
        }

        Utilities.shuffle(this.#deck);
        this.updateCardInfo();
    }

    startGame() {
        if (Object.values(this.#mediaTiers).length == 0) {
            alert("Please select one or more media to use");
            this.#configureNewGame();
            return;
        }
        if (Object.values(this.#renownTiers).length == 0) {
            alert("Please select one or more character types to use");
            this.#configureNewGame();
            return;
        }

        let controller = this;
        this.buildDeck();

        let cardContainer = document.getElementById('cardsCardContainer');
        if (cardContainer != null) {
            let cardBack = Utilities.createDiv('cardsCharacterCardBack', cardContainer);
            cardBack.addEventListener('click', function() { controller.drawCard(); });
        }

        // Just testing!
        let buttonContainer = document.getElementById('cardsGameButtonContainer');
        Utilities.empty(buttonContainer);
        let drawCardButton = Utilities.createElement('button', 'cardsDrawCardButton', buttonContainer, 'Draw Card');
        drawCardButton.addEventListener('click', function() { controller.drawCard(); });

        Utilities.setVisible(this.#configureContainer, false);
        Utilities.setVisible(this.#gameContainer, true);
    }

    updateCardInfo() {
        let infoContainer = document.getElementById('cardsInfoContainer');
        if (infoContainer != null) {
            infoContainer.innerText = 'Cards Remaining: ' + this.#deck.length;
        }
    }

    drawCard() {
        let cardContainer = document.getElementById('cardsCardContainer');
        if (cardContainer == null) {
            alert("Missing card container");
            return;
        }

        Utilities.empty(cardContainer);
        if (this.#deck.length == 0) {
            if (confirm("All out of cards! Start new game?")) {
                this.startGame();
            }
            return;
        }

        let controller = this;
        let characters = this.getController().getCharacters();
        let characterId = this.#deck.pop();
        let character = characters.getCharacter(characterId);
        let newCard = Utilities.createDiv('cardsCharacterCard', cardContainer);
        Utilities.createDiv('cardsCharacterCardTitle', newCard, character.name);
        let newCardPortrait = Utilities.createDiv('cardsCharacterCardPortrait', newCard);
        newCardPortrait.style.backgroundImage = 'url(' + characters.getImage(characterId) + ')';
        this.updateCardInfo();

        newCard.addEventListener('click', function() { controller.drawCard(); });
    }
}
