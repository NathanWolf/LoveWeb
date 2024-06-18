class Flashcards extends Component {
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;
    #currentFlashcards = [];

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let characters = this.getController().getCharacters().getCharacterList();
        this.#wrongAnswers = 0;
        this.#correctAnswers = 0;
        this.#currentFlashcards = Utilities.shuffle(characters);
        this.#nextFlashCard();
    }

    #nextFlashCard() {
        let controller = this;
        let element = this.getElement();
        Utilities.empty(element);

        if (this.#currentFlashcards.length === 0) {
            let popup = Utilities.showPopup(element.parentNode);
            Utilities.createDiv('flashCardFinishedTitle', popup).innerText = 'Finished!';
            Utilities.createDiv('flashCardCorrect', popup).innerText = 'Correct: ' + this.#correctAnswers;
            Utilities.createDiv('flashCardWrong', popup).innerText = 'Wrong: ' + this.#wrongAnswers;
            return;
        }

        let flashCardOuterContainer = Utilities.createDiv('flashCardContainer');
        let flashCardContainer = Utilities.createDiv('flashCard', flashCardOuterContainer);
        let answerContainer = Utilities.createDiv('flashCardAnswers');
        element.appendChild(flashCardOuterContainer);
        element.appendChild(answerContainer);

        let nextCharacter = this.#currentFlashcards.pop();
        flashCardContainer.style.backgroundImage = 'url(' + this.getController().getCharacters().getPortrait(nextCharacter.id) + ')';
        let list = document.createElement('ul');
        let answers = [nextCharacter];
        let characters = this.getController().getCharacters().getCharacterList();
        characters = Utilities.shuffle(characters);
        while (answers.length < 5) {
            let answer = characters.pop();
            if (answer.id !== nextCharacter.id) {
                answers.push(answer);
            }
        }
        answers = Utilities.shuffle(answers);
        for (let i = 0; i < answers.length; i++) {
            let answer = document.createElement('li');
            answer.innerText = answers[i].name;
            if (answers[i].id === nextCharacter.id) {
                this.#correctAnswer = i;
            }
            answer.dataset.index = i;
            answer.addEventListener('click', function() {
                controller.onFlashCardClick(parseInt(this.dataset.index));
            });
            list.appendChild(answer);
        }
        answerContainer.appendChild(list);
        answerContainer.style.display = 'flex';
    }

    onFlashCardClick(answerIndex) {
        let element = this.getElement();
        if (answerIndex === this.#correctAnswer) {
            Utilities.showStatusPopup(element.parentNode, 'flashCardCorrect').innerText = 'CORRECT!';
            this.#correctAnswers++;
        } else {
            Utilities.showStatusPopup(element.parentNode, 'flashCardWrong').innerText = 'Wrong :(';
            this.#wrongAnswers++;
        }
        this.#nextFlashCard();
    }

    getTitle() {
        return 'Flash Cards';
    }
}