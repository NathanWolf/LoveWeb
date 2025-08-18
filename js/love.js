class Love {
    #loaded = false;
    #mainMenuOpen = false;
    #tab = 'info';
    #history = new History();
    #characters = new Characters(this, document.getElementById('characters'));
    #chat = new Chat(this, document.getElementById('chat'));
    #quizzes = new Quizzes(this, document.getElementById('quizzes'));
    #mini = new Mini(this, document.getElementById('minii'));
    #dressup = new Dressup(this, document.getElementById('dressup'));
    #games = new Games(this, document.getElementById('games'));
    #flashcards = new Flashcards(this, document.getElementById('flashCards'));
    #tiers = new Tiers(this, document.getElementById('tierLists'));
    #relationships = new Relationships(this, document.getElementById('relationships'));
    #timeline = new Timeline(this, document.getElementById('timeline'));
    #realms = new Realms(this, document.getElementById('realms'));
    #profile = new Profile(this, document.getElementById('profile'), document.getElementById('profileIcon'));
    #characterEditor = new CharacterEditor(this, document.getElementById('characterEditor'));
    #timelineEditor = new TimelineEditor(this, document.getElementById('timelineEditor'));
    #info = new Info(this, document.getElementById('info'));
    #books = new Books(this, document.getElementById('books'));
    #slideshow = new Slideshow(this, document.getElementById('slideshow'));
    #mainMenu = document.getElementById('mainMenu');
    #mainTabContainer = document.getElementById('mainTabContainer');
    #mainMenuButton = document.getElementById('mainMenuButton');
    #mainMenuMask = document.getElementById('mainMenuMask');

    #tabs = {
        characters: this.#characters,
        chat: this.#chat,
        games: this.#games,
        quizzes: this.#quizzes,
        minii: this.#mini,
        dressup: this.#dressup,
        flashCards: this.#flashcards,
        tierLists: this.#tiers,
        relationships: this.#relationships,
        timeline: this.#timeline,
        realms: this.#realms,
        characterEditor: this.#characterEditor,
        timelineEditor: this.#timelineEditor,
        profile: this.#profile,
        info: this.#info,
        books: this.#books,
        slideshow: this.#slideshow
    };

    constructor() {
        let controller = this;
        this.#history.setDefault('tab', 'books');
        this.#history.onChange(function() {
            controller.onHistoryChange();
        });
        this.#history.autoUpdate();
    }

    onInternalError(msg, url, line, col, error) {
        alert("An internal error occurred. Press OK to reload.\n\nDetails: " + msg + "\n\n" + url + ":" + line + ":" + col);
        location.reload();
    }

    getCharacters() {
        return this.#characters;
    }

    getRealms() {
        return this.#realms;
    }

    getChat() {
        return this.#chat;
    }

    getProfile() {
        return this.#profile;
    }

    getTiers() {
        return this.#tiers;
    }

    getRelationships() {
        return this.#relationships;
    }

    getTimeline() {
        return this.#timeline;
    }

    getHistory() {
        return this.#history;
    }

    register() {
        let love = this;
        Utilities.addHandlerToClass('tabButton', function() {
            love.selectTab(this.dataset.tab);
        });
        Utilities.addHandlerToClass('navigation', function() {
            love.selectTab(this.dataset.tab);
        });
        this.#mainMenuButton.addEventListener('click', function() { love.toggleMainMenu(); });
        this.#mainMenuMask.addEventListener('click', function() { love.closeMainMenu(); });

        // Try to make the virtual keyboard on iOS not break the entire layout
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                love.forceViewport();
            });
        }

        this.#profile.check();
    }

    toggleMainMenu() {
        if (this.#mainMenuOpen) {
            this.closeMainMenu();
        } else {
            this.#mainMenuOpen = true;
            Utilities.addClass(this.#mainMenuMask, 'menuExpanded');
            Utilities.addClass(this.#mainMenuButton, 'menuExpanded');
            Utilities.addClass(this.#mainMenu, 'menuExpanded');
        }
    }

    closeMainMenu() {
        this.#mainMenuOpen = false;
        Utilities.removeClass(this.#mainMenuMask, 'menuExpanded');
        Utilities.removeClass(this.#mainMenuButton, 'menuExpanded');
        Utilities.removeClass(this.#mainMenu, 'menuExpanded');
    }

    forceViewport() {
        let container = document.getElementById('mainContainer');
        container.style.height = window.visualViewport.height + 'px';
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        let tab = this.#tabs[this.#tab];
        tab.onResize();
    }

    selectTab(tabId) {
        if (!this.#tabs.hasOwnProperty(tabId)) {
            throw new Error("Selecting unknown tab: " + tabId);
        }
        this.closeMainMenu();
        this.#mainTabContainer.scrollTop = 0;
        let tabButtons = document.getElementsByClassName('tabButton');
        let tabButtonId = tabId;
        let tab = this.#tabs[tabId];
        let parentTab = tab.getParent();
        if (parentTab != null) {
            tabButtonId = parentTab;
        }

        for (let i = 0; i < tabButtons.length; i++) {
            let tabButton = tabButtons[i];
            if (tabButton.dataset.tab === tabButtonId) {
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

        this.#tab = tabId;
        this.#history.set('tab', this.#tab);
        this.updateTitle();

        // Don't activate the tab until data is loaded
        if (!this.#loaded) {
            return;
        }

        let previousTab = this.#tabs.hasOwnProperty(this.#tab) ? this.#tabs[this.#tab] : null;
        if (previousTab != null) {
            previousTab.deactivate();
        }
        tab.activate();
    }

    updateTitle() {
        let tab = this.#tabs[this.#tab];

        let title = 'Diviinity';
        let tabTitle = tab.getTitle();
        if (tabTitle != null) {
            title += ' (' + tabTitle + ')';
        }
        document.title = title;
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
        this.#request('data/love.php?action=load', function() {
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
        this.#mini.addCharacters(data.mini);
        this.#dressup.addData(data.dressup);
        this.#timeline.addTimelineEvents(data.events);
        this.#timeline.addMonths(data.months);
        this.#relationships.addRelationships(data.relationships);
        this.#quizzes.addQuizzes(data.quizzes);
        this.#tiers.addTiers(data.tiers);
        this.#realms.addRealms(data.realms);
        this.#realms.addProperties(data.realm_properties);

        this.#loaded = true;
        document.getElementById('loading').style.display = 'none';
        this.#profile.loaded();

        // Activate current tab
        let tab = this.#tabs[this.#tab];
        tab.activate();
        // We also skip having tabs process history until data is loaded
        tab.onHistoryChange();
    }

    onHistoryChange() {
        let tab = this.#history.get('tab');
        if (tab !== this.#tab) {
            this.selectTab(tab);
        }
        if (this.#loaded) {
            this.#tabs[tab].onHistoryChange();
        }
    }
}