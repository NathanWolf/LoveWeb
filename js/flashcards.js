class Flashcards {
    #characters;
    #element;
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;
    #currentFlashcards = [];

    constructor(element, characters) {
        this.#element = element;
        this.#characters = characters;
    }

    show() {
        let characters = this.#characters.getCharacterList();
        this.#wrongAnswers = 0;
        this.#correctAnswers = 0;
        this.#currentFlashcards = Utilities.shuffle(characters);
        this.#nextFlashCard();
    }

    #nextFlashCard() {
        let controller = this;
        Utilities.empty(this.#element);

        if (this.#currentFlashcards.length === 0) {
            let popup = Utilities.showPopup(this.#element.parentNode, 'flashCardsFinished');
            popup.innerText = 'DONE!';
            return;
        }

        let flashCardContainer = Utilities.createDiv('flashCard');
        let answerContainer = Utilities.createDiv('flashCardAnswers');
        this.#element.appendChild(flashCardContainer);
        this.#element.appendChild(answerContainer);

        let nextCharacter = this.#currentFlashcards.pop();
        flashCardContainer.style.backgroundImage = 'url(image/portraits/' + nextCharacter.id + '.png)';
        let list = document.createElement('ul');
        let answers = [nextCharacter];
        let characters = this.#characters.getCharacterList();
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
        if (answerIndex === this.#correctAnswer) {
            this.#correctAnswers++;
        } else {
            alert("Wrong :(");
            this.#wrongAnswers++;
        }
        this.#nextFlashCard();
    }
}