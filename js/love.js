class Love {
    #characters = {};

    register() {
        // Click to close character sheet
        document.getElementById('characterSheet').addEventListener('click', function() {
            document.getElementById('characterSheetPopup').style.display = 'none';
        });
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
        let portraitList = document.getElementById('portraitList');
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
        document.getElementById('characterSheetPopup').style.display = 'flex';
        let sheet = document.getElementById('characterSheet');
        let character = portrait.dataset.character;
        sheet.style.backgroundImage = "url('image/sheets/" + character + ".png')";
    }
}
