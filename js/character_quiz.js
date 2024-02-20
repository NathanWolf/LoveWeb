class CharacterQuiz {
    #element;

    constructor(element) {
        this.#element = element;
    }

    show() {
        Utilities.empty(this.#element);
        let wip = document.createElement('div');
        wip.innerText = 'Coming soon!';
        this.#element.appendChild(wip);
    }
}
