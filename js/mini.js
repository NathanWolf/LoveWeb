class Mini extends Component {
    #container;
    miniCharacters = {};
    #faces = ['front', 'left', 'right', 'back'];
    #maxZoom = 4;
    #minZoom = 0;
    #maxScale = 8;
    #scene;
    #zoom = 0;
    #panX = 0;
    #panY = 0;
    #dragging = false;
    #dragStartX = 0;
    #dragStartY = 0;
    #dragStartSubjectX = 0;
    #dragStartSubjectY = 0;
    #zoomOutButton = null;
    #zoomInButton = null;
    #tickTimer = null;
    #popupTimer = null;
    #popupDiv = null;
    #loadingMessage = false;

    constructor(controller, element) {
        super(controller, element)
    }

    addCharacters(characters) {
        for (let id in characters) {
            if (characters.hasOwnProperty(id)) {
                this.miniCharacters[id] = {
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
        this.#zoom = 1;

        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground miniLayer midlands', this.#container);
        // Utilities.createDiv('miniForeground midlands', element);

        Utilities.createDiv('midlandsTree miniObject', this.#scene);

        Utilities.createDiv('midlandsRock1 miniObject', this.#scene);
        Utilities.createDiv('midlandsRock2 miniObject', this.#scene);
        Utilities.createDiv('midlandsRock3 miniObject', this.#scene);

        Utilities.createDiv('midlandsBush1 miniObject', this.#scene);
        Utilities.createDiv('midlandsBush2 miniObject', this.#scene);
        Utilities.createDiv('midlandsBush3 miniObject', this.#scene);
        Utilities.createDiv('midlandsBush4 miniObject', this.#scene);
        Utilities.createDiv('midlandsBush5 miniObject', this.#scene);
        Utilities.createDiv('midlandsBush5 miniObject', this.#scene);

        let bug = Utilities.createDiv('midlandsBug', this.#scene);
        let location = this.#getRandomLocation(this.#scene);
        bug.style.left = location.x + 'px';
        bug.style.top = location.y + 'px';
        bug.style.zIndex = (location.y + 7).toString();
        bug.addEventListener('click', e => {
            this.showPopup(location.x, location.y, "You found Bug!");
            e.stopPropagation();
        });
        bug.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });

        for (let characterId in this.miniCharacters) {
            if (this.miniCharacters.hasOwnProperty(characterId)) {
                this.#createCharacter(this.miniCharacters[characterId], this.#scene);
            }
        }

        this.#zoomOutButton = Utilities.createDiv('miniZoomOutButton', this.#container);
        this.#zoomInButton = Utilities.createDiv('miniZoomInButton', this.#container);

        this.#scene.addEventListener('mousedown', e => { this.#startDrag(e); });
        this.#scene.addEventListener('mousemove', e => { this.#handleDrag(e); });
        this.#scene.addEventListener('mouseup', e => { this.#endDrag(e); });

        this.#scene.addEventListener('touchstart', e => { this.#startDrag(e); });
        this.#scene.addEventListener('touchmove', e => { this.#handleDrag(e); });
        this.#scene.addEventListener('touchend', e => { this.#endDrag(e); });
        this.#scene.addEventListener('touchcancel', e => { this.#endDrag(e); });

        this.#zoomOutButton.addEventListener('click', e => { this.zoomOut(); });
        this.#zoomInButton.addEventListener('click', e => { this.zoomIn(); });
        this.#updateSceneTransform();
        this.#scheduleTick();
    }

    #startDrag(e) {
        let location = this.#getEventLocation(e);
        this.#dragStartX = location.clientX;
        this.#dragStartY = location.clientY;
        this.#dragStartSubjectX = this.#panX;
        this.#dragStartSubjectY = this.#panY;
        this.#dragging = true;
        e.preventDefault();
    }

    #endDrag(e) {
        this.#dragging = false;
    }

    #handleDrag(e) {
        if (!this.#dragging) return; // Ignore ghost drag events

        let location = this.#getEventLocation(e);
        const deltaX = location.clientX - this.#dragStartX;
        const deltaY = location.clientY - this.#dragStartY;
        this.#panX = this.#dragStartSubjectX + deltaX;
        this.#panY = this.#dragStartSubjectY + deltaY;

        this.#updateSceneTransform();
    }

    #startCharacterDrag(character, e) {
        let location = this.#getEventLocation(e);
        this.#dragStartX = location.clientX;
        this.#dragStartY = location.clientY;
        this.#dragStartSubjectX = character.x;
        this.#dragStartSubjectY = character.y;
        this.#dragging = true;
        e.stopPropagation();
    }

    #handleCharacterDrag(character, e) {
        if (!this.#dragging) return; // Ignore ghost drag events

        let location = this.#getEventLocation(e);
        const deltaX = location.clientX - this.#dragStartX;
        const deltaY = location.clientY - this.#dragStartY;
        let transform = this.#scene.style.transform;
        let scale = parseFloat(transform.substring(transform.indexOf('scale(') + 6, transform.length - 1));
        character.x = this.#dragStartSubjectX + deltaX / scale;
        character.y = this.#dragStartSubjectY + deltaY / scale;
        character.facing = 'front';

        this.#updateCharacterImage(character);
        e.stopPropagation();
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

    #getRandomLocation(container) {
        let border = container.offsetWidth * 0.1;
        let location = {};
        location.x = Math.floor(Math.random() * (container.offsetWidth - border * 2) + border);
        location.y = Math.floor(Math.random() * (container.offsetHeight / 3) + border);
        return location;
    }

    #createCharacter(miniCharacter, container) {
        let location = this.#getRandomLocation(container);
        miniCharacter.container = Utilities.createDiv('miniCharacter', container);
        miniCharacter.x = location.x;
        miniCharacter.y = location.y;
        miniCharacter.container.addEventListener('click', e => {
            // If we were dragging the character, don't chat
            let distanceX = (this.#dragStartSubjectX - miniCharacter.x);
            let distanceY = (this.#dragStartSubjectY - miniCharacter.y);
            let distanceMoved = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (distanceMoved < 4) {
                this.#characterChat(miniCharacter);
            }
            e.stopPropagation();
        });

        miniCharacter.container.addEventListener('mousedown', e => { this.#startCharacterDrag(miniCharacter, e); });
        miniCharacter.container.addEventListener('mousemove', e => { this.#handleCharacterDrag(miniCharacter, e); });
        miniCharacter.container.addEventListener('mouseup', e => { this.#endDrag(e); });

        miniCharacter.container.addEventListener('touchstart', e => { this.#startCharacterDrag(miniCharacter, e); });
        miniCharacter.container.addEventListener('touchmove', e => { this.#handleCharacterDrag(miniCharacter, e); });
        miniCharacter.container.addEventListener('touchend', e => { this.#endDrag(e); });
        miniCharacter.container.addEventListener('touchcancel', e => { this.#endDrag(e); });

        this.#updateCharacterImage(miniCharacter);
    }

    async #characterChat(miniCharacter) {
        let profile = this.getController().getProfile();
        let user = profile.getUser();
        let character = this.getController().getCharacters().getCharacter(miniCharacter.id);
        // Temporarily allowing chat while not logged in
        // if (user == null || this.#loadingMessage) {
        if (this.#loadingMessage) {
            this.showPopup(miniCharacter.x + 20, miniCharacter.y, "Hi, I'm " + character.name + "!");
        } else {
            this.#loadingMessage = true;
            this.showPopup(miniCharacter.x + 20, miniCharacter.y, "...");
            Utilities.addClass(this.#scene, 'miniLoading');
            let data = new FormData();
            data.append('action', 'mini');
            data.append('message', 'Hello!');
            if (user != null) {
                data.append('user_id', user.id);
                data.append('user_token', user.token);
            }
            data.append("persona_id", miniCharacter.id);
            let messageResponse = await fetch( "data/chat.php", {
                method: "POST",
                body: data
            } ).then((response) => {
                return response.json();
            });
            this.#loadingMessage = false;
            Utilities.removeClass(this.#scene, 'miniLoading');
            if (messageResponse == null || !messageResponse.hasOwnProperty('message') || !messageResponse.success) {
                console.log("Error from chat API: " + messageResponse.message);
                this.showPopup(miniCharacter.x + 20, miniCharacter.y, "Hi, I'm " + character.name + "!");
                return;
            }

            let message = Utilities.convertMarkdown(messageResponse.message);
            let popupMessage = '<div class="miniCharacterName">' + character.name + '</div><div class="miniCharacterMessage">' + message + '</div>';
            this.showPopup(miniCharacter.x + 20, miniCharacter.y, popupMessage);
        }
    }

    showPopup(x, y, message) {
        if (this.#popupTimer != null) {
            clearTimeout(this.#popupTimer);
        }
        if (this.#popupDiv != null) {
            this.#popupDiv.remove();
        }
        this.#popupDiv = Utilities.createDiv('miniPopup', this.#scene);
        this.#popupDiv.innerHTML = message;
        this.#popupDiv.style.left = x + 'px';
        this.#popupDiv.style.top = y + 'px';
        this.#popupTimer = setTimeout(()=>{
            this.#popupTimer = null;
            this.#popupDiv.remove();
        }, 10000);
    }

    #updateCharacterImage(character) {
        character.container.style.backgroundImage = 'url(image/mini/characters/' + character.id + '/' + character.facing + '.png)';
        character.container.style.left = character.x + 'px';
        character.container.style.top = character.y + 'px';
        character.container.style.position = 'absolute';
        character.container.style.zIndex = Math.floor(character.y + 24).toString();
    }

    #tick() {
        for (let characterId in this.miniCharacters) {
            if (this.miniCharacters.hasOwnProperty(characterId)) {
                this.#tickCharacter(this.miniCharacters[characterId]);
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
        this.#zoom--;
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
        this.#zoom++;
        this.#updateSceneTransform();
        if (this.#zoom >= this.#maxZoom) {
            Utilities.addClass(this.#zoomInButton, 'disabled');
            return;
        }
    }

    #updateSceneTransform() {
        let containerWidth = this.getElement().offsetWidth;
        let containerHeight = this.getElement().offsetHeight;
        let width = this.#scene.offsetWidth;
        let height = this.#scene.offsetHeight;
        let centerX = width / 2;
        let centerY = height / 2;
        let containerCenterX = containerWidth / 2;
        let containerCenterY = containerHeight / 2;

        let minScaleX = containerWidth / width;
        let minScaleY = containerHeight / height;

        let minScale = Math.max(minScaleX, minScaleY);
        let scale = minScale + this.#maxScale * (this.#zoom / this.#maxZoom);

        let maxPanX = centerX * (scale - minScale);
        let maxPanY = centerY * (scale - minScale);

        if (this.#panX < -maxPanX) this.#panX = -maxPanX;
        if (this.#panX > maxPanX) this.#panX = maxPanX;
        if (this.#panY < -maxPanY) this.#panY = -maxPanY;
        if (this.#panY > maxPanY) this.#panY = maxPanY;

        centerX -= this.#panX / scale;
        centerY -= this.#panY / scale;

        let translateX = containerCenterX - centerX;
        let translateY = containerCenterY - centerY;

        translateX = Math.floor(translateX);
        translateY = Math.floor(translateY);

        this.#scene.style.transformOrigin = centerX + 'px ' + centerY + 'px';
        this.#scene.style.transform = 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')';
    }

    onResize() {
        this.#updateSceneTransform();
    }
}
