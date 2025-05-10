class Games extends Component {
    #quizzes;

    constructor(controller, element) {
        super(controller, element);
        this.#quizzes = new Quizzes(controller, document.getElementById('quizzes'));

        let games = this;
        Utilities.addHandlerToClass('game', function() {
            games.selectGame(this.dataset.game);
        });
    }
}
