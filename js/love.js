class Love {
    #characters = {};
    #quizzes = {};
    #currentQuizQuestions = [];
    #correctAnswer = 0;
    #correctAnswers = 0;
    #wrongAnswers = 0;

    register() {
        let love = this;
        Love.addHandlerToClass('popup', function() {
            this.style.display = 'none';
        });
        Love.addHandlerToClass('tabButton', function() {
            love.selectTab(this.dataset.tab);
        });
    }

    static addHandlerToClass(className, callback) {
        let elements = document.getElementsByClassName(className);
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', callback);
        }
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
                this.#showQuizzes();
                break;
        }
    }

    #showQuizzes() {
        let quizList = document.getElementById('quizList');

        // Populate quiz list
        let love = this;
        while (quizList.firstChild) {
            quizList.removeChild(quizList.lastChild);
        }
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
        this.#currentQuizQuestions = this.#shuffle(questions);
        this.#nextQuestion();
    }

    #shuffle = function(a) {
        return a.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
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

        while (answerContainer.firstChild) {
            answerContainer.removeChild(answerContainer.lastChild);
        }
        let love = this;
        let list = document.createElement('ul');
        let answers = [...nextQuestion.answers];
        let correct = answers[0];
        answers = this.#shuffle(answers);
        for (let i = 0; i < answers.length; i++) {
            let answer = document.createElement('li');
            answer.innerText = answers[i];
            if (answers[i] === correct) {
                this.#correctAnswer = i;
            }
            answer.dataset.index = i;
            answer.addEventListener('click', function() {
                love.onAnswerClick(this.dataset.index);
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

        this.#characters = data.characters;
        this.#quizzes = data.quizzes;

        this.#loadPortraits();
    }

    #loadPortraits() {
        let love = this;
        let portraitList = document.getElementById('characters');
        for (let characterKey in this.#characters) {
            if (!this.#characters.hasOwnProperty(characterKey)) continue;
            let image = characterKey + ".jpg";
            let character = this.#characters[characterKey];
            let portrait = document.createElement('div');
            portrait.className = 'portrait';
            portrait.style.backgroundImage = 'url(image/portraits/' + image + ')';
            portraitList.appendChild(portrait);
            let portraitName = document.createElement('div');
            portraitName.className = 'portraitName';
            portraitName.dataset.character = characterKey;
            portraitName.innerText = character.name;
            portraitName.addEventListener('click', function(event) {
                love.onPortraitClick(event.target);
            })
            portraitList.appendChild(portraitName);
        }
    }

    onPortraitClick(portrait) {
        let sheet = document.getElementById('characterSheet');
        let characterKey = portrait.dataset.character;
        if (!this.#characters.hasOwnProperty(characterKey)) {
            alert("Sorry, something went wrong!");
            return;
        }
        let character = this.#characters[characterKey];
        if (character.sheet) {
            document.getElementById('characterSheetPopup').style.display = 'flex';
            sheet.style.backgroundImage = "url('image/sheets/" + characterKey + ".png')";
        } else {
            document.getElementById('characterSheetMissingName').innerText = character.name;
            document.getElementById('characterSheetMissingPopup').style.display = 'flex';
        }
    }
}