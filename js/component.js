class Component {
    #controller;
    #element;

    constructor(controller, element) {
        if (element == null) {
            throw new Error("Element not set");
        }
        if (controller == null) {
            throw new Error("Controller not set");
        }
        this.#controller = controller;
        this.#element = element;
    }

    getController() {
        return this.#controller;
    }

    getElement() {
        return this.#element;
    }

    getTitle() {
        return null;
    }

    show() {
    }

    activate() {
        this.show();
    }

    hide() {
    }

    deactivate() {
        this.hide();
    }

    onHistoryChange() {
    }
}