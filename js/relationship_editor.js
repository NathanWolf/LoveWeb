class RelationshipEditor extends Editor {

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let controller = this;
        let container = this.getElement();
        Utilities.empty(container);
    }
}
