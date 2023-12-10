class Quizzes {
    #quizzes = {};
    #element;
    #currentQuizQuestions = [];
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;

    constructor(element) {
        this.#element = element;
    }

    addQuizzes(quizzes) {
        for (let id in quizzes) {
            if (quizzes.hasOwnProperty(id)) {
                this.#quizzes[id] = quizzes[id];
            }
        }
    }

    listQuizzes() {
        // Populate quiz list
        let controller = this;
        Utilities.empty(this.#element);
        let listElement = Utilities.createDiv('quizList', this.#element);
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
            listElement.appendChild(quizOption);
        }
    }

    onSelectQuiz(quizKey) {
        this.#correctAnswers = 0;
        this.#wrongAnswers = 0;
        let quiz = this.#quizzes[quizKey];
        let questions = [...quiz.questions];
        this.#currentQuizQuestions = Utilities.shuffle(questions);
        this.#nextQuestion();
    }

    #nextQuestion() {
        Utilities.empty(this.#element);
        if (this.#currentQuizQuestions.length === 0) {
            this.listQuizzes();
            let popup = Utilities.showPopup(this.#element.parentNode);
            Utilities.createDiv('quizFinishedTitle', popup).innerText = 'Finished!';
            Utilities.createDiv('quizCorrect', popup).innerText = 'Correct: ' + this.#correctAnswers;
            Utilities.createDiv('quizWrong', popup).innerText = 'Wrong: ' + this.#wrongAnswers;
            return;
        }

        let nextQuestion = this.#currentQuizQuestions.pop();
        let questionContainer = Utilities.createDiv('quizQuestion', this.#element);
        let questionElement = Utilities.createDiv('quizQuestionQuestion', questionContainer);
        let answerElement = Utilities.createDiv('quizQuestionAnswers', questionContainer);

        questionElement.innerText = nextQuestion.question;
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
        answerElement.appendChild(list);
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