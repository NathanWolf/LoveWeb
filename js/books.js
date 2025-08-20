class Books extends Component {
    #diviine;
    #spliit;
    #siin;

    constructor(controller, element) {
        super(controller, element);
        this.#diviine = document.getElementById("bookDiviine");
        this.#spliit = document.getElementById("bookSpliit");
        this.#siin = document.getElementById("bookSiin");

        let books = this;
        this.#diviine.addEventListener("click", function() {
            books.showBookCover('Diviine');
        });
        this.#spliit.addEventListener("click", function() {
            books.showBookCover('Spliit');
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
