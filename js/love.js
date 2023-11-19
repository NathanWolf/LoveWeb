class Love {
    #characters = {};

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
            if (tabButton.dataset.tab == tabId) {
                className += ' active';
            }
            tabButton.className = className;
        }
        let tabs = document.getElementsByClassName('tab');
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i];
            if (tab.id == tabId) {
                tab.style.display = 'flex';
            } else {
                tab.style.display = 'none';
            }
        }
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

        let love = this;
        this.#characters = data.characters;
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