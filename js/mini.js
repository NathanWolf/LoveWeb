class Mini extends Component {
    #container;
    #characters = {};
    #faces = ['front', 'left', 'right', 'back'];
    #maxZoom = 5;
    #minZoom = 0.5;
    #scene;
    #zoom = 0;
    #panX = 0;
    #panY = 0;
    #dragStartX = 0;
    #dragStartY = 0;
    #dragStartPanX = 0;
    #dragStartPanY = 0;
    #zoomOutButton = null;
    #zoomInButton = null;
    #tickTimer = null;

    constructor(controller, element) {
        super(controller, element)
    }

    addCharacters(characters) {
        for (let id in characters) {
            if (characters.hasOwnProperty(id)) {
                this.#characters[id] = {
                    id: id,
                    facing: this.#getRandomFacing(),
                    x: 0,
                    y: 0,
                    container: null,
                    moving: false
                };
            }
        }
    }

    #getRandomFacing() {
        let facing = Math.floor(Math.random() * 4);
        return this.#faces[facing];
    }

    show() {
        // Reset zoom + scale
        this.#panX = 0;
        this.#panY = 0;
        this.#zoom = 4;

        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground midlands', this.#container);
        this.#scene.draggable = true;

        Utilities.createDiv('midlandsTree', this.#scene);

        for (let characterId in this.#characters) {
            if (this.#characters.hasOwnProperty(characterId)) {
                this.#createCharacter(this.#characters[characterId], this.#scene);
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
        this.#updateSceneTransform();
        this.#scheduleTick();
    }

    hide() {
        if (this.#tickTimer != null) {
            clearTimeout(this.#tickTimer);
            this.#tickTimer = null;
        }
    }

    #scheduleTick() {
        this.#tickTimer = setTimeout(()=>{
            this.#tick();
            this.#scheduleTick();
        }, 100);
    }

    #createCharacter(character, container) {
        character.container = Utilities.createDiv('miniCharacter', container);
        let border = container.offsetWidth * 0.1;
        character.x = Math.random() * (container.offsetWidth - border * 2) + border;
        character.y = Math.random() * (container.offsetHeight - border * 2) + border;
        this.#updateCharacterImage(character);
    }

    #updateCharacterImage(character) {
        character.container.style.backgroundImage = 'url(image/mini/characters/' + character.id + '/' + character.facing + '.png)';
        character.container.style.left = character.x + 'px';
        character.container.style.top = character.y + 'px';
    }

    #tick() {
        for (let characterId in this.#characters) {
            if (this.#characters.hasOwnProperty(characterId)) {
                this.#tickCharacter(this.#characters[characterId]);
            }
        }
    }

    #tickCharacter(character) {
        // Start moving
        if (!character.moving) {
            if (Math.random() > 0.99) {
                character.facing = this.#getRandomFacing();
                character.moving = true;
            }
            return;
        }

        // Stop moving
        if (Math.random() > 0.9) {
            character.moving = false;
            return;
        }

        // Hit edge
        if (character.x < 5) {
            character.facing = 'right';
        } else if (character.x > this.#scene.offsetWidth - 5) {
            character.facing = 'left';
        } else if (character.y > this.#scene.offsetHeight - 5) {
            character.facing = 'back';
        } else if (character.y < 5) {
            character.facing = 'front';
        }

        // Move
        if (character.facing == 'front') {
            character.y += 1;
        } else if (character.facing == 'back') {
            character.y -= 1;
        } else if (character.facing == 'left') {
            character.x -= 1;
        } else if (character.facing == 'right') {
            character.x += 1;
        }
        this.#updateCharacterImage(character);
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
