class CharacterQuiz extends Component {
    #maxQuestions = 30;
    #maxAnswers = 20;
    // How far below a match can be (in percentage) from the winner to show in details
    #extraCutoff = 25;
    #extraCount = 5;

    #characterScores = {};
    #questionCount = 0;
    #remainingQuestions = [];
    #currentQuestion = null;

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        this.#characterScores = {};
        this.#questionCount = 0;

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
                let property = allProperties[propertyKey];
                if (property.hidden) continue;
                this.#remainingQuestions.push(property);
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

    #showResults() {
        let element = this.getElement();
        Utilities.empty(element);
        let characters = this.getController().getCharacters();
        let scores = this.#getSortedScores();
        let chosen = scores.length == 0 ? null : scores[0];
        if (chosen == null || chosen.score == 0) {
            let oops = Utilities.createDiv('noMatch', container);
            oops.innerText = "Sorry, you didn't match with anyone!";
            return;
        }
        if (scores.length > 1 && scores[1].score == chosen.score) {
            this.#showTiebreaker(scores);
            return
        }

        let container = Utilities.createDiv('chosenCharacter', element);
        let chosenCharacter = chosen.character;
        let portraitContainer = Utilities.createDiv('portrait', container);
        portraitContainer.style.backgroundImage = 'url(' + characters.getPortrait(chosenCharacter.id) + ')';
        let chosenContainer = Utilities.createDiv('chosenContainer', container);
        let youAre = Utilities.createSpan('chosenPrefix', chosenContainer);
        youAre.innerText = 'You are';
        let nameLabel = Utilities.createSpan('chosenName', chosenContainer);
        nameLabel.innerText = chosenCharacter.full_name;
        if (chosenCharacter.description != null) {
            Utilities.createDiv('chosenDescription', container).innerText = chosenCharacter.description;
        }
        let showDetailsButton = Utilities.createDiv('detailsButton', container);
        showDetailsButton.innerText = 'Show Details...';
        let detailsContainer = Utilities.createDiv('details', container);
        detailsContainer.style.display = 'none';

        showDetailsButton.addEventListener('click', function() {
            showDetailsButton.style.display = 'none';
            detailsContainer.style.display = 'inherit';
        });

        let percentage = 100 * (chosen.score / this.#questionCount);
        let match = Utilities.createDiv('primaryMatch', detailsContainer);
        match.innerText = "Match: " + percentage.toFixed(0) + "%";
        let secondaryMatches = Utilities.createDiv('secondaryMatches', detailsContainer);

        for (let i = 1; i < scores.length && i <= this.#extraCount; i++) {
            let extra = scores[i];
            let extraPercentage = 100 * (extra.score / this.#questionCount);
            let extraCharacter = extra.character;
            if (percentage - extraPercentage > this.#extraCutoff) break;

            let match = Utilities.createDiv('secondaryMatch', secondaryMatches);
            let portraitContainer = Utilities.createDiv('portrait small', match);
            portraitContainer.style.backgroundImage = 'url(' + characters.getPortrait(extraCharacter.id) + ')';
            portraitContainer.title = extraCharacter.full_name;
            let matchLabel = Utilities.createDiv('matchLabel', match);
            matchLabel.innerText = "Matched with " + extraCharacter.full_name + ": " + extraPercentage.toFixed(0) + "%";
        }

        let profile = this.getController().getProfile();
        let user = profile.getUser();
        if (user != null && chosenCharacter != null) {
            let currentId = user.properties.hasOwnProperty('persona_id') ? user.properties['persona_id'].value : null;
            if (currentId != chosenCharacter.id) {
                if (currentId == null) {
                    profile.saveProperty('persona_id', chosenCharacter.id);
                } else {
                    let currentCharacter = characters.getCharacter(currentId);
                    if (confirm("Do you want to change your character from " + currentCharacter.name + " to " + chosenCharacter.name + "?")) {
                        profile.saveProperty('persona_id', chosenCharacter.id);
                    }
                }
            }
        }
    }

    #showTiebreaker(scores) {
        let tied = [];
        let score = scores[0].score;
        for (let i = 0; i < scores.length; i++) {
            if (scores[i].score == score) {
                tied.push(scores[i]);
            } else {
                break;
            }
        }

        this.#questionCount++;
        this.#currentQuestion = null;
        let element = this.getElement();
        let questionContainer = Utilities.createDiv('quizQuestion', element);
        let questionElement = Utilities.createDiv('quizQuestionQuestion', questionContainer);
        let answerElement = Utilities.createDiv('quizQuestionAnswers', questionContainer);
        let list = document.createElement('ul');
        questionElement.innerText = 'Which name speaks to you more?';

        let controller = this;
        for (let i = 0; i < tied.length; i++) {
            let tiedCharacter = tied[i].character;
            let answer = document.createElement('li');
            answer.innerText = tiedCharacter.first_name;
            answer.dataset.character = tiedCharacter.id;
            answer.addEventListener('click', function() {
                controller.#onTiebreakerClick(this.dataset.character);
            });
            list.appendChild(answer);
        }
        answerElement.appendChild(list);
    }

    #onTiebreakerClick(characterId) {
        let character = this.getController().getCharacters().getCharacter(characterId);
        this.#addCharacterScore(character);
        this.#showResults();
    }

    #nextQuestion() {
        let element = this.getElement();
        element.scrollTop = 0;
        let characters = this.getController().getCharacters();
        Utilities.empty(element);
        if (this.#remainingQuestions.length === 0) {
            this.#showResults();
            return;
        }

        let nextQuestion = this.#remainingQuestions.pop();
        this.#questionCount++;
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
            let value = character.properties.hasOwnProperty(nextQuestion.id) ? character.properties[nextQuestion.id] : 'None';
            if (!answers.hasOwnProperty(value)) {
                used[character.id] = true;
                answers[value] = true;
            }
        }
        let allCharacters = characters.getCharacterList();
        for (let i = 0; i < allCharacters.length; i++) {
            if (Object.values(answers).length >= this.#maxAnswers) break;
            let character = allCharacters[i];
            if (used.hasOwnProperty(character.id)) continue;
            let value = character.properties.hasOwnProperty(nextQuestion.id) ? character.properties[nextQuestion.id] : 'None';
            if (!answers.hasOwnProperty(value)) {
                used[character.id] = true;
                answers[value] = true;
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

    #addCharacterScore(character) {
        if (this.#characterScores.hasOwnProperty(character.id)) {
            this.#characterScores[character.id].score++;
        } else {
            this.#characterScores[character.id] = {
                score: 1,
                character: character
            }
        }
    }

    onAnswerClick(propertyValue) {
        let propertyId = this.#currentQuestion.id;
        let characters = this.getController().getCharacters();
        let allCharacters = characters.getCharacterList();
        for (let i = 0; i < allCharacters.length; i++) {
            let character = allCharacters[i];
            let characterValue = character.properties.hasOwnProperty(propertyId) ? character.properties[propertyId] : 'None';
            if (characterValue == propertyValue) {
                this.#addCharacterScore(character);
            }
        }
        this.#nextQuestion();
    }
}
