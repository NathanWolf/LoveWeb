class Mini extends Component {
    #container;
    #characters = {};
    #scene;
    #maxZoom = 5;
    #minZoom = 0.5;
    #zoom = 1;
    #panX = 0;
    #panY = 0;
    #dragStartX = 0;
    #dragStartY = 0;
    #dragStartPanX = 0;
    #dragStartPanY = 0;
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
        // Reset zoom + scale
        this.#panX = 0;
        this.#panY = 0;
        this.#zoom = 1;

        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground midlands', this.#container);
        this.#scene.draggable = true;

        Utilities.createDiv('midlandsTree', this.#scene);

        for (let characterId in this.#characters) {
            if (this.#characters.hasOwnProperty(characterId)) {
                this.#createCharacter(characterId, this.#scene);
            }
        }

        this.#zoomOutButton = Utilities.createDiv('miniZoomOutButton', this.#container);
        this.#zoomInButton = Utilities.createDiv('miniZoomInButton', this.#container);

        this.#scene.addEventListener('dragstart', e => {
            this.#dragStartX = e.clientX;
            this.#dragStartY = e.clientY;
            this.#dragStartPanX = this.#panX;
            this.#dragStartPanY = this.#panY;

            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        });
        this.#scene.addEventListener('drag', e => {
            if (e.clientX === 0 && e.clientY === 0) return; // Ignore ghost drag events

            const deltaX = e.clientX - this.#dragStartX;
            const deltaY = e.clientY - this.#dragStartY;
            this.#panX = this.#dragStartPanX + (deltaX / this.#zoom);
            this.#panY = this.#dragStartPanY + (deltaY / this.#zoom);

            this.#updateSceneTransform();

        });
        this.#zoomOutButton.addEventListener('click', e => {
            this.zoomOut();
        });
        this.#zoomInButton.addEventListener('click', e => {
            this.zoomIn();
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
        this.#updateSceneTransform();
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
        this.#updateSceneTransform();
        if (this.#zoom >= this.#maxZoom) {
            Utilities.addClass(this.#zoomInButton, 'disabled');
            return;
        }
    }

    #updateSceneTransform() {
        this.#scene.style.transform = 'scale(' + this.#zoom + ') translate(' + this.#panX + 'px,' + this.#panY + 'px)';
    }
}
