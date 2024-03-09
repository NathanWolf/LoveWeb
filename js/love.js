class Love {
    #loaded = false;
    #tab = null;
    #characters = new Characters(this, document.getElementById('characters'));
    #chat = new Chat(this, document.getElementById('chat'));
    #quizzes = new Quizzes(this, document.getElementById('quizzes'));
    #flashcards = new Flashcards(this, document.getElementById('flashCards'));
    #tiers = new Tiers(this, document.getElementById('tierLists'));
    #relationships = new Relationships(this, document.getElementById('relationships'));
    #profile = new Profile(this, document.getElementById('profile'), document.getElementById('profileButton'));
    #characterEditor = new CharacterEditor(this, document.getElementById('characterEditor'));

    getCharacters() {
        return this.#characters;
    }

    getProfile() {
        return this.#profile;
    }

    register() {
        let love = this;
        Utilities.addHandlerToClass('tabButton', function() {
            love.selectTab(this.dataset.tab);
        });
        Utilities.addHandlerToClass('navigation', function() {
            love.selectTab(this.dataset.tab);
        });

        // Try to make the virtual keyboard on iOS not break the entire layout
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                love.forceViewport();
            });
        }

        this.#profile.check();
    }

    forceViewport() {
        let container = document.getElementById('mainContainer');
        container.style.height = window.visualViewport.height + 'px';
        container.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTop = 0;
    }

    selectTab(tabId) {
        let tabButtons = document.getElementsByClassName('tabButton');
        for (let i = 0; i < tabButtons.length; i++) {
            let tabButton = tabButtons[i];
            if (tabButton.dataset.tab === tabId) {
                Utilities.addClass(tabButton, 'active');
            } else {
                Utilities.removeClass(tabButton, 'active');
            }
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
                this.#quizzes.show();
                break;
            case 'chat':
                document.title = 'Love (Chat)';
                this.#chat.show();
                break;
            case 'flashCards':
                document.title = 'Love (Flash Cards)';
                this.#flashcards.show();
                break;
            case 'characters':
                document.title = 'Love (Characters)';
                this.#characters.show();
                break;
            case 'relationships':
                document.title = 'Love (Relationships)';
                this.#relationships.show();
                break;
            case 'tierLists':
                document.title = 'Love (Tier Lists)';
                this.#tiers.show();
                break;
            case 'profile':
                document.title = 'Love (User Profile)';
                this.#profile.show();
                break;
            case 'characterEditor':
                document.title = 'Love (Editor)';
                this.#characterEditor.show();
                break;
        }

        this.#tab = tabId;
        this.updateHistory();
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

        this.#characters.addProperties(data.properties);
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