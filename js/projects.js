class Projects extends Component {

    constructor(controller, element) {
        super(controller, element);
    }

    showBookCover(book) {
        let element = this.getElement();
        let popup = Utilities.showPopup(element.parentNode, 'bookImageContainer');
        Utilities.createDiv('bookCoverFull book' + book + 'Full', popup);
    }
}
