class CharacterQuiz extends Component {
    #maxQuestions = 100;
    #maxAnswers = 50;

    #characterScores = {};
    #remainingQuestions = [];
    #currentQuestion = null;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        this.#characterScores = {};

        let usedProperties = {};
        let characters = this.getController().getCharacters();
        let allProperties = characters.getProperties();
        let allCharacters = characters.getCharacterList();
        for (let i = 0; i < allCharacters.length; i++) {
            let character = allCharacters[i];
            for (let propertyKey in character.properties) {
                if (character.properties.hasOwnProperty(propertyKey)) {
                    usedProperties[propertyKey] = true;
                }
            }
        }
        this.#remainingQuestions = [];
        for (let propertyKey in usedProperties) {
            if (usedProperties.hasOwnProperty(propertyKey)) {
                this.#remainingQuestions.push(allProperties[propertyKey]);
            }
        }

        this.#remainingQuestions = Utilities.shuffle(this.#remainingQuestions);
        this.#remainingQuestions = this.#remainingQuestions.slice(0, this.#maxQuestions);
        this.#nextQuestion();
    }

    #getSortedScores() {
        let characters = Object.values(this.#characterScores);
        characters.sort(function (a, b) {
            return b.score - a.score;
        });
        return characters;
    }

    #nextQuestion() {
        let element = this.getElement();
        let characters = this.getController().getCharacters();
        Utilities.empty(element);
        if (this.#remainingQuestions.length === 0) {
            let container = Utilities.createDiv('chosenCharacter', element);
            let scores = this.#getSortedScores();
            let chosen = scores[0].character;
            let portraitContainer = Utilities.createDiv('portrait', container);
            portraitContainer.style.backgroundImage = 'url(' + characters.getPortrait(chosen.id) + ')';
            let chosenContainer = Utilities.createDiv('chosenContainer', container);
            let youAre = Utilities.createSpan('chosenPrefix', chosenContainer);
            youAre.innerText = 'You are';
            let nameLabel = Utilities.createSpan('chosenName', chosenContainer);
            nameLabel.innerText = chosen.full_name;
            if (chosen.description != null) {
                Utilities.createDiv('chosenDescription', container).innerText = chosen.description;
            }
            return;
        }

        let nextQuestion = this.#remainingQuestions.pop();
        this.#currentQuestion = nextQuestion;
        let questionContainer = Utilities.createDiv('quizQuestion', element);
        let questionElement = Utilities.createDiv('quizQuestionQuestion', questionContainer);
        let answerElement = Utilities.createDiv('quizQuestionAnswers', questionContainer);

        let question = nextQuestion.question;
        if (question == null) {
            if (nextQuestion.plural) {
                question = "What are your " + nextQuestion.name.toLowerCase() + "?";
            } else {
                question = "What is your " + nextQuestion.name.toLowerCase() + "?";
            }
        }
        questionElement.innerText = question;

        let scored = this.#getSortedScores();
        let used = {};
        let answers = {};
        let maxTop = this.#maxAnswers / 2;
        for (let i = 0; i < scored.length; i++) {
            if (Object.values(answers).length > maxTop) break;
            let character = scored[i].character;
            if (character.properties.hasOwnProperty(nextQuestion.id)) {
                let value = character.properties[nextQuestion.id];
                if (!answers.hasOwnProperty(value)) {
                    used[character.id] = true;
                    answers[value] = true;
                }
            }
        }
        let allCharacters = characters.getCharacterList();
        for (let i = 0; i < allCharacters.length; i++) {
            if (Object.values(answers).length >= this.#maxAnswers) break;
            let character = allCharacters[i];
            if (used.hasOwnProperty(character.id)) continue;
            if (character.properties.hasOwnProperty(nextQuestion.id)) {
                let value = character.properties[nextQuestion.id];
                if (!answers.hasOwnProperty(value)) {
                    used[character.id] = true;
                    answers[value] = true;
                }
            }
        }

        let controller = this;
        let list = document.createElement('ul');
        answers = Object.keys(answers);
        answers = Utilities.shuffle(answers);
        for (let i = 0; i < answers.length; i++) {
            let answer = document.createElement('li');
            let option = answers[i];
            answer.innerText = option;
            answer.dataset.property = option;
            answer.addEventListener('click', function() {
                controller.onAnswerClick(this.dataset.property);
            });
            list.appendChild(answer);
        }
        answerElement.appendChild(list);
    }

    onAnswerClick(propertyValue) {
        let propertyId = this.#currentQuestion.id;
        let characters = this.getController().getCharacters();
        let allCharacters = characters.getCharacterList();
        for (let i = 0; i < allCharacters.length; i++) {
            let character = allCharacters[i];
            if (character.properties.hasOwnProperty(propertyId) && character.properties[propertyId] == propertyValue) {
                if (this.#characterScores.hasOwnProperty(character.id)) {
                    this.#characterScores[character.id].score++;
                } else {
                    this.#characterScores[character.id] = {
                        score: 1,
                        character: character
                    }
                }
            }
        }
        this.#nextQuestion();
    }
}
