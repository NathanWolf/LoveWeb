class Cards extends Component {

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
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
        let element = this.getElement();
        Utilities.empty(element);

        let tierController = this.getController().getTiers();
        let renownTiers = Object.values(tierController.getTierList('renown').tiers);
        let mediaTiers = Object.values(tierController.getTierList('media').tiers);

        if (renownTiers == null || mediaTiers == null) {
            alert("Could not find the right tier lists to choose");
            return;
        }

        let configureContainer = Utilities.createDiv('cardsConfigureContainer', element);
        Utilities.createDiv("cardsConfigureChoiceHeader", configureContainer, 'Which Media to Include?');
        let mediaChoiceContainer = Utilities.createDiv('cardsConfigureChoiceContainer', configureContainer);

        let mediaCheckboxes = {};
        mediaTiers.sort((a, b) => b.priority - a.priority);
        for (const tier of mediaTiers) {
            mediaCheckboxes[tier.id] = this.#addConfigureOption(mediaChoiceContainer, tier.name, true);
        }

        Utilities.createDiv("cardsConfigureChoiceHeader", configureContainer, 'Which Characters to Include?');
        let renownChoiceContainer = Utilities.createDiv('cardsConfigureChoiceContainer', configureContainer);
        renownTiers.sort((a, b) => b.priority - a.priority);
        let renownCheckboxes = {};
        for (const tier of renownTiers) {
            let checked = tier.id == 'major' || tier.id == 'primary' || tier.id == 'uncanon';
            renownCheckboxes[tier.id] = this.#addConfigureOption(renownChoiceContainer, tier.name, checked);
        }
    }
}
