class Quizzes {
    #quizzes = {};
    #listElement = null;
    #quizElement = null;
    #questionElement = null;
    #answerElement = null;
    #finishedElement = null;
    #currentQuizQuestions = [];
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;

    addQuizzes(quizzes) {
        for (let id in quizzes) {
            if (quizzes.hasOwnProperty(id)) {
                this.#quizzes[id] = quizzes[id];
            }
        }
    }

    setListElement(container) {
        this.#listElement = container;
    }

    setQuizElement(container) {
        this.#quizElement = container;
    }

    setQuestionElement(container) {
        this.#questionElement = container;
    }

    setAnswerElement(container) {
        this.#answerElement = container;
    }

    setFinishedElement(container) {
        this.#finishedElement = container;
    }

    #checkElements() {
        if (this.#listElement == null) throw new Error("List element not set");
        if (this.#quizElement == null) throw new Error("Quiz element not set");
        if (this.#finishedElement == null) throw new Error("Finished element not set");
        if (this.#questionElement == null) throw new Error("Question element not set");
        if (this.#answerElement == null) throw new Error("Answer element not set");
    }

    listQuizzes() {
        this.#checkElements();
        // Populate quiz list
        let controller = this;
        Utilities.empty(this.#listElement);
        for (let quizKey in this.#quizzes) {
            if (!this.#quizzes.hasOwnProperty(quizKey)) continue;
            let quiz = this.#quizzes[quizKey];
            let quizOption = document.createElement('div');
            quizOption.dataset.quiz = quizKey;
            quizOption.addEventListener('click', function() {
                controller.onSelectQuiz(this.dataset.quiz);
            });
            quizOption.className = 'quizOption';
            quizOption.innerText = quiz.name;
            this.#listElement.appendChild(quizOption);
        }

        // Reset to showing quiz list, not questions
        this.#quizElement.style.display = 'none';
        this.#finishedElement.style.display = 'none';
        this.#listElement.style.display = 'flex';
    }

    onSelectQuiz(quizKey) {
        this.#checkElements();
        this.#listElement.style.display = 'none';
        this.#correctAnswers = 0;
        this.#wrongAnswers = 0;
        let quiz = this.#quizzes[quizKey];
        let questions = [...quiz.questions];
        this.#currentQuizQuestions = Utilities.shuffle(questions);
        this.#nextQuestion();
    }

    #nextQuestion() {
        this.#checkElements();
        if (this.#currentQuizQuestions.length === 0) {
            this.#quizElement.style.display = 'none';
            this.#finishedElement.style.display = 'flex';
            return;
        }

        let nextQuestion = this.#currentQuizQuestions.pop();
        this.#questionElement.innerText = nextQuestion.question;

        Utilities.empty(this.#answerElement);
        let controller = this;
        let list = document.createElement('ul');
        let answers = [...nextQuestion.answers];
        let correct = answers[0];
        answers = Utilities.shuffle(answers);
        for (let i = 0; i < answers.length; i++) {
            let answer = document.createElement('li');
            answer.innerText = answers[i];
            if (answers[i] === correct) {
                this.#correctAnswer = i;
            }
            answer.dataset.index = i;
            answer.addEventListener('click', function() {
                controller.onAnswerClick(parseInt(this.dataset.index));
            });
            list.appendChild(answer);
        }
        this.#answerElement.appendChild(list);
        this.#quizElement.style.display = 'flex';
    }

    onAnswerClick(answerIndex) {
        if (answerIndex === this.#correctAnswer) {
            alert("CORRECT!");
            this.#correctAnswers++;
        } else {
            alert("Wrong :(");
            this.#wrongAnswers++;
        }
        this.#nextQuestion();
    }
}