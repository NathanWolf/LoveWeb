class Flashcards {
    #characters = null;
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;
    #currentFlashcards = [];

    setCharacters(characters) {
        this.#characters = characters;
    }

    #checkCharacters() {
        if (this.#characters == null) throw new Error("Characters not set");
    }

    show() {
        this.#checkCharacters();
        let characters = this.#characters.getCharacterList();
        document.getElementById('flashCardsFinished').style.display = 'none';
        document.getElementById('flashCard').style.display = 'flex';
        document.getElementById('flashCardAnswers').style.display = 'flex';
        this.#wrongAnswers = 0;
        this.#correctAnswers = 0;
        this.#currentFlashcards = Utilities.shuffle(characters);
        this.#nextFlashCard();
    }

    #nextFlashCard() {
        let controller = this;
        let flashCardContainer = document.getElementById('flashCard');
        let answerContainer = document.getElementById('flashCardAnswers');
        Utilities.empty(flashCardContainer);

        if (this.#currentFlashcards.length === 0) {
            flashCardContainer.style.display = 'none';
            answerContainer.style.display = 'none';
            document.getElementById('flashCardsFinished').style.display = 'flex';
            return;
        }

        let nextCharacter = this.#currentFlashcards.pop();
        document.getElementById('flashCard').style.backgroundImage = 'url(image/portraits/' + nextCharacter.id + '.png)';
        Utilities.empty(answerContainer);
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