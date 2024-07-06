class Quizzes extends Component {
    #quizzes = {};
    #currentQuiz = null;
    #currentQuizQuestions = [];
    #currentQuestion = null;
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;
    #characterQuiz = null;

    constructor(controller, element) {
        super(controller, element)
        this.#characterQuiz = new CharacterQuiz(controller, element);
    }

    addQuizzes(quizzes) {
        for (let id in quizzes) {
            if (quizzes.hasOwnProperty(id)) {
                this.#quizzes[id] = quizzes[id];
            }
        }
    }

    show() {
        // Populate quiz list
        let controller = this;
        let element = this.getElement();
        Utilities.empty(element);
        let listElement = Utilities.createDiv('quizList', element);
        let quizzes = [];
        this.#currentQuiz = null;
        // Add extra quizzes
        quizzes.push({
            id: 'character',
            name: 'Which character are you?'
        });
        for (let quizId in this.#quizzes) {
            if (this.#quizzes.hasOwnProperty(quizId)) {
                quizzes.push(this.#quizzes[quizId]);
            }
        }

        for (let i = 0; i < quizzes.length; i++) {
            let quiz = quizzes[i];
            let quizKey = quiz.id;
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
        this.#currentQuiz = quizKey;
        this.#correctAnswers = 0;
        this.#wrongAnswers = 0;
        this.getController().getHistory().set('quiz', quizKey);

        // Check for special-case quizzes
        switch (quizKey) {
            case 'character':
                this.#characterQuiz.show();
                break;
            default:
                let quiz = this.#quizzes[quizKey];
                let questions = [...quiz.questions];
                this.#currentQuizQuestions = Utilities.shuffle(questions);
                this.#nextQuestion();

        }
    }

    #nextQuestion() {
        let element = this.getElement();
        element.scrollTop = 0;
        Utilities.empty(element);
        if (this.#currentQuizQuestions.length === 0) {
            this.show();
            let popup = Utilities.showPopup(element.parentNode);
            Utilities.createDiv('quizFinishedTitle', popup).innerText = 'Finished!';
            Utilities.createDiv('quizCorrect', popup).innerText = 'Correct: ' + this.#correctAnswers;
            Utilities.createDiv('quizWrong', popup).innerText = 'Wrong: ' + this.#wrongAnswers;
            return;
        }

        let nextQuestion = this.#currentQuizQuestions.pop();
        this.#currentQuestion = nextQuestion;
        let questionContainer = Utilities.createDiv('quizQuestion', element);
        let questionElement = Utilities.createDiv('quizQuestionQuestion', questionContainer);
        let answerElement = Utilities.createDiv('quizQuestionAnswers', questionContainer);

        questionElement.innerText = nextQuestion.question;
        let controller = this;
        let list = document.createElement('ul');
        let answers = [...nextQuestion.answers];
        answers = Utilities.shuffle(answers);
        for (let i = 0; i < answers.length; i++) {
            let answer = document.createElement('li');
            answer.innerText = answers[i].answer;
            // TODO: Multiple choice?
            if (answers[i].correct) {
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
        let element = this.getElement();
        if (answerIndex === this.#correctAnswer) {
            Utilities.showStatusPopup(element.parentNode, 'quizCorrect').innerText = 'CORRECT!';
            this.#correctAnswers++;
        } else {
            let question = this.#currentQuestion;
            let popup = Utilities.showStatusPopup(element.parentNode, 'quizWrong', 5000);
            let wrong = Utilities.createDiv('incorrect', popup);
            wrong.innerText = 'Wrong :(';
            let correctAnswer = null;
            for (let i = 0; i < this.#currentQuestion.answers.length; i++) {
                if (this.#currentQuestion.answers[i].correct) {
                    correctAnswer = this.#currentQuestion.answers[i];
                    break;
                }
            }
            if (correctAnswer != null) {
                let answer = Utilities.createDiv('answer', popup);
                answer.innerText = 'The correct answer was: ' + correctAnswer.answer;
            }
            if (question.explanation != null && question.explanation.length > 0) {
                let answer = Utilities.createDiv('explanation', popup);
                answer.innerText = question.explanation;
            }
            this.#wrongAnswers++;
        }
        this.#nextQuestion();
    }

    getTitle() {
        return 'Quizzes';
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let quiz = history.get('quiz');
        if (this.#currentQuiz != quiz) {
            if (quiz == null) {
                this.show();
            } else {
                this.onSelectQuiz(quiz);
            }
        }
    }

    deactivate() {
        this.getController().getHistory().unset('quiz');
    }
}