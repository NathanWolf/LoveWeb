class Mini extends Component {
    #container;
    #characters = {};
    #faces = ['front', 'left', 'right', 'back'];
    #maxZoom = 8;
    #minZoom = 2;
    #scene;
    #zoom = 0;
    #panX = 0;
    #panY = 0;
    #dragging = false;
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
        this.#panX = 200;
        this.#panY = 100;
        this.#zoom = 4;

        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground miniLayer midlands', this.#container);
        // Utilities.createDiv('miniForeground midlands', element);

        Utilities.createDiv('midlandsTree miniLayer ', this.#scene);
        Utilities.createDiv('midlandsRocks miniLayer ', this.#scene);
        Utilities.createDiv('midlandsBushes miniLayer ', this.#scene);

        for (let characterId in this.#characters) {
            if (this.#characters.hasOwnProperty(characterId)) {
                this.#createCharacter(this.#characters[characterId], this.#scene);
            }
        }

        this.#zoomOutButton = Utilities.createDiv('miniZoomOutButton', this.#container);
        this.#zoomInButton = Utilities.createDiv('miniZoomInButton', this.#container);

        this.#scene.addEventListener('mousedown', e => { this.#startDrag(e); });
        this.#scene.addEventListener('mousemove', e => { this.#handleDrag(e); });
        this.#scene.addEventListener('mouseup', e => { this.#endDrag(); });
        this.#scene.addEventListener('touchstart', e => { this.#startDrag(e); });
        this.#scene.addEventListener('touchmove', e => { this.#handleDrag(e); });
        this.#scene.addEventListener('touchend', e => { this.#endDrag(); });
        this.#scene.addEventListener('touchcancel', e => { this.#endDrag(); });
        this.#zoomOutButton.addEventListener('click', e => { this.zoomOut(); });
        this.#zoomInButton.addEventListener('click', e => { this.zoomIn(); });
        this.#updateSceneTransform();
        this.#scheduleTick();
    }

    #startDrag(e) {
        let location = this.#getEventLocation(e);
        this.#dragStartX = location.clientX;
        this.#dragStartY = location.clientY;
        this.#dragStartPanX = this.#panX;
        this.#dragStartPanY = this.#panY;
        this.#dragging = true;
        e.preventDefault();
    }

    #endDrag() {
        this.#dragging = false;
    }

    #handleDrag(e) {
        if (!this.#dragging) return; // Ignore ghost drag events

        let location = this.#getEventLocation(e);
        const deltaX = location.clientX - this.#dragStartX;
        const deltaY = location.clientY - this.#dragStartY;
        this.#panX = this.#dragStartPanX + (deltaX / this.#zoom);
        this.#panY = this.#dragStartPanY + (deltaY / this.#zoom);

        this.#updateSceneTransform();
    }

    #getEventLocation(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
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
        character.y = Math.random() * (container.offsetHeight / 3) + border;
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
        } else if (character.x > this.#scene.offsetWidth - 5 - 24) {
            character.facing = 'left';
        } else if (character.y > this.#scene.offsetHeight - 5 - 24) {
            character.facing = 'back';
        } else if (character.y < 5) {
            character.facing = 'front';
        }

        // Stay out of the water!
        let distanceX = (this.#scene.offsetWidth - character.x);
        let distanceY = (this.#scene.offsetHeight - character.y);
        let distanceToBottomRight = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (distanceToBottomRight < 430) {
            character.facing = 'left';
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
            Utilities.addClass(this.#zoomOutButton, 'disabled');
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
