class Mini extends Component {
    #container;
    #scene;
    #maxZoom = 5;
    #minZoom = 0.5;
    #zoom = 1;
    #zoomOutButton = null;
    #zoomInButton = null;

    constructor(controller, element) {
        super(controller, element)
    }

    show() {
        let element = this.getElement();
        Utilities.empty(element);
        this.#container = Utilities.createDiv('miniContainer', element);
        this.#scene = Utilities.createDiv('miniBackground midlands', this.#container);
        Utilities.createDiv('midlandsTree', this.#scene);

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
