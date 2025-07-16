class Books extends Component {
    #diviine;
    #diviinity;
    #siin;

    constructor(controller, element) {
        super(controller, element);
        this.#diviinity = document.getElementById("bookDiviinity");
        this.#diviine = document.getElementById("bookDiviine");
        this.#siin = document.getElementById("bookSiin");

        let books = this;
        this.#diviine.addEventListener("click", function() {
            books.showBookCover('Diviine');
        });
        this.#diviinity.addEventListener("click", function() {
            books.showBookCover('Diviinity');
        });
        this.#siin.addEventListener("click", function() {
            books.showBookCover('Siin');
        });
    }

    showBookCover(book) {
        let element = this.getElement();
        let popup = Utilities.showPopup(element.parentNode, 'bookImageContainer');
        Utilities.createDiv('bookCoverFull book' + book + 'Full', popup);
    }
}
