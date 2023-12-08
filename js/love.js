class Love {
    #loaded = false;
    #tab = null;
    #characters = new Characters();
    #quizzes = new Quizzes();
    #flashcards = new Flashcards();
    #tiers = new Tiers(document.getElementById('tierLists'));

    register() {
        let love = this;
        Utilities.addHandlerToClass('popup', function() {
            this.style.display = 'none';
        });
        Utilities.addHandlerToClass('tabButton', function() {
            love.selectTab(this.dataset.tab);
        });
        this.#characters.setListElement(document.getElementById('characters'));
        this.#characters.setSheetElement(document.getElementById('characterSheet'));
        this.#characters.setSheetPopupElement(document.getElementById('characterSheetPopup'));
        this.#flashcards.setCharacters(this.#characters);
        this.#quizzes.setListElement(document.getElementById('quizList'));
        this.#quizzes.setQuizElement(document.getElementById('quizQuestion'));
        this.#quizzes.setQuestionElement(document.getElementById('quizQuestionQuestion'));
        this.#quizzes.setAnswerElement(document.getElementById('quizQuestionAnswers'));
        this.#quizzes.setFinishedElement(document.getElementById('quizFinished'));
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
                this.#showCharacters();
                break;
            case 'relationships':
                document.title = 'Love (Relationships)';
                break;
            case 'tierLists':
                document.title = 'Love (Tier Lists)';
                this.#showTierList();
                break;
        }

        this.#tab = tabId;
        this.updateHistory();
    }

    #showCharacters() {
        this.#characters.showPortraits();
    }

    #showFlashCards() {
        this.#flashcards.show();
    }

    #showQuizzes() {
        this.#quizzes.listQuizzes();
    }

    #showTierList() {
        this.#tiers.showList();
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
        this.#quizzes.addQuizzes(data.quizzes);
        this.#tiers.addTiers(data.tiers);

        this.#loaded = true;
        document.getElementById('loading').style.display = 'none';
        this.checkHistory();
    }

    checkHistory() {
        if (!this.#loaded) return;

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
        if (!this.#loaded) return;

        let hash = '';
        if (this.#tab !== 'characters') {
            hash = 'tab=' + this.#tab;
        }

        window.location.hash = hash;
    }
}