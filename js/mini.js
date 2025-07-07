class Mini extends Component {
    #container;
    #characters = {};
    #scene;
    #maxZoom = 5;
    #minZoom = 0.5;
    #zoom = 1;
    #zoomOutButton = null;
    #zoomInButton = null;

    constructor(controller, element) {
        super(controller, element)
    }

    addCharacters(characters) {
        for (let id in characters) {
            if (characters.hasOwnProperty(id)) {
                this.#characters[id] = characters[id];
            }
        }
    }

    show() {
        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground midlands', this.#container);
        Utilities.createDiv('midlandsTree', this.#scene);

        for (let characterId in this.#characters) {
            if (this.#characters.hasOwnProperty(characterId)) {
                this.#createCharacter(characterId, this.#scene);
            }
        }

        this.#zoomOutButton = Utilities.createDiv('miniZoomOutButton', this.#container);
        this.#zoomInButton = Utilities.createDiv('miniZoomInButton', this.#container);

        let mini = this;
        this.#zoomOutButton.addEventListener('click', e => {
            mini.zoomOut();
        });
        this.#zoomInButton.addEventListener('click', e => {
            mini.zoomIn();
        });
    }

    #createCharacter(characterId, container) {
        let character = Utilities.createDiv('miniCharacter', container);
        character.style.backgroundImage = 'url(image/mini/characters/' + characterId + '/front.png)';
        let x = Math.random() * container.offsetWidth * 0.8;
        let y = Math.random() * container.offsetHeight * 0.8;

        character.style.left = x + 'px';
        character.style.top = y + 'px';
        return character;
    }

    zoomOut() {
        Utilities.removeClass(this.#zoomInButton, 'disabled');
        if (this.#zoom <= this.#minZoom) {
            Utilities.addClass(this.#zoomOutButton, 'disabled');
            return;
        }
        this.#zoom /= 2;
        this.#scene.style.transform = 'scale(' + this.#zoom + ')';
        if (this.#zoom <= this.#minZoom) {
            Utilities.addClass(this.#zoomInButton, 'disabled');
        }
    }

    zoomIn() {
        Utilities.removeClass(this.#zoomOutButton, 'disabled');
        if (this.#zoom >= this.#maxZoom) {
            Utilities.addClass(this.#zoomInButton, 'disabled');
            return;
        }
        this.#zoom *= 2;
        this.#scene.style.transform = 'scale(' + this.#zoom + ')';
        if (this.#zoom >= this.#maxZoom) {
            Utilities.addClass(this.#zoomInButton, 'disabled');
            return;
        }
    }
}
