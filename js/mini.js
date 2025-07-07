class Mini extends Component {
    #background;

    constructor(controller, element) {
        super(controller, element)
    }

    show() {
        let element = this.getElement();
        Utilities.empty(element);
        this.#background = Utilities.createDiv('miniBackground midlands', element);
        Utilities.createDiv('miniBackground midlandsTree', element);
    }
}
