class Love {
    #tab = 'characters';
    #characters = new Characters();
    #quizzes = {};
    #currentQuizQuestions = [];
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;
    #currentFlashcards = [];

    register() {
        let love = this;
        Utilities.addHandlerToClass('popup', function() {
            this.style.display = 'none';
        });
        Utilities.addHandlerToClass('tabButton', function() {
            love.selectTab(this.dataset.tab);
        });
        this.#characters.setCharacterSheet(document.getElementById('characterSheet'));
        this.checkHistory();
    }

    selectTab(tabId) {
        let tabButtons = document.getElementsByClassName('tabButton');
        for (let i = 0; i < tabButtons.length; i++) {
            let className = 'tabButton';
            let tabButton = tabButtons[i];
            if (tabButton.dataset.tab === tabId) {
                className += ' active';
            }
            tabButton.className = className;
        }
        let tabs = document.getElementsByClassName('tab');
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i];
            if (tab.id === tabId) {
                tab.style.display = 'flex';
            } else {
                tab.style.display = 'none';
            }
        }

        switch (tabId) {
            case 'quizzes':
                document.title = 'Love (Quizzes)';
                this.#showQuizzes();
                break;
            case 'flashCards':
                document.title = 'Love (Flash Cards)';
                this.#showFlashCards();
                break;
            case 'characters':
                document.title = 'Love (Characters)';
                break;
            case 'relationships':
                document.title = 'Love (Relationships)';
                break;
            case 'tierLists':
                document.title = 'Love (Tier Lists)';
                break;
        }

        this.#tab = tabId;
        this.updateHistory();
    }

    #showFlashCards() {
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
        let love = this;
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
        document.getElementById('flashCard').style.backgroundImage = 'url(image/portraits/' + nextCharacter.id + '.jpg)';
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
                love.onFlashCardClick(parseInt(this.dataset.index));
            });
            list.appendChild(answer);
        }
        answerContainer.appendChild(list);
        answerContainer.style.display = 'flex';
    }

    onFlashCardClick(answerIndex) {
        if (answerIndex === this.#correctAnswer) {
            alert("CORRECT!");
            this.#correctAnswers++;
        } else {
            alert("Wrong :(");
            this.#wrongAnswers++;
        }
        this.#nextFlashCard();
    }

    #showQuizzes() {
        let quizList = document.getElementById('quizList');

        // Populate quiz list
        let love = this;
        Utilities.empty(quizList);
        for (let quizKey in this.#quizzes) {
            if (!this.#quizzes.hasOwnProperty(quizKey)) continue;
            let quiz = this.#quizzes[quizKey];
            let quizOption = document.createElement('div');
            quizOption.dataset.quiz = quizKey;
            quizOption.addEventListener('click', function() {
                love.onSelectQuiz(this.dataset.quiz);
            });
            quizOption.className = 'quizOption';
            quizOption.innerText = quiz.name;
            quizList.appendChild(quizOption);
        }

        // Reset to showing quiz list, not questions
        document.getElementById('quizQuestion').style.display = 'none';
        document.getElementById('quizFinished').style.display = 'none';
        quizList.style.display = 'flex';
    }

    onSelectQuiz(quizKey) {
        document.getElementById('quizList').style.display = 'none';
        this.#correctAnswers = 0;
        this.#wrongAnswers = 0;
        let quiz = this.#quizzes[quizKey];
        let questions = [...quiz.questions];
        this.#currentQuizQuestions = Utilities.shuffle(questions);
        this.#nextQuestion();
    }

    #nextQuestion() {
        let quizQuestion = document.getElementById('quizQuestion');

        if (this.#currentQuizQuestions.length === 0) {
            quizQuestion.style.display = 'none';
            document.getElementById('quizFinished').style.display = 'flex';
            return;
        }

        let nextQuestion = this.#currentQuizQuestions.pop();
        document.getElementById('quizQuestionQuestion').innerText = nextQuestion.question;
        let answerContainer = document.getElementById('quizQuestionAnswers');

        Utilities.empty(answerContainer);
        let love = this;
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
                love.onAnswerClick(parseInt(this.dataset.index));
            });
            list.appendChild(answer);
        }
        answerContainer.appendChild(list);
        quizQuestion.style.display = 'flex';
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

    #request(url, callback) {
        const request = new XMLHttpRequest();
        request.onload = callback;
        request.responseType = 'json';
        request.onerror = function() { alert("Failed to load data, sorry!"); };
        request.open("GET", url, true);
        request.send();
    }

    load() {
        const love = this;
        this.#request('data/love.php', function() {
            love.#processData(this.response);
        });
    }

    #processData(data) {
        if (!data.success) {
            alert("Failed to load data: " + data.message);
            return;
        }

        this.#characters.addCharacters(data.characters);
        this.#quizzes = data.quizzes;

        this.#characters.loadPortraits();
    }

    checkHistory() {
        let hash = window.location.hash;
        if (hash.startsWith('#')) {
            hash = hash.substring(1);
        }
        let pairs = hash.split('&');
        let tab = 'characters';
        for (let i = 0; i < pairs.length; i++) {
            let kv = pairs[i].split('=');
            if (kv[0] === 'tab') {
                tab = kv[1];
            }
        }
        if (tab !== this.#tab) {
            this.selectTab(tab);
        }

        let love = this;
        setTimeout(function() {
            love.checkHistory();
        }, 500);
    }

    updateHistory() {
        let hash = '';
        if (this.#tab !== 'characters') {
            hash = 'tab=' + this.#tab;
        }

        window.location.hash = hash;
    }
}