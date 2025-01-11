class Realms extends Component {
    #realms = {};
    #properties = {};
    #popupRealmId = null;

    constructor(controller, element) {
        super(controller, element);
    }

    addRealms(realms) {
        for (let id in realms) {
            if (realms.hasOwnProperty(id)) {
                this.#realms[id] = realms[id];
            }
        }
    }

    addProperties(properties) {
        for (let id in properties) {
            if (properties.hasOwnProperty(id)) {
                this.#properties[id] = properties[id];
            }
        }
    }

    getRealm(id) {
        return this.#realms.hasOwnProperty(id) ? this.#realms[id] : null;
    }

    show() {
        let realmController = this;
        let container = this.getElement();
        Utilities.empty(container);

        // Create inner div to hold items
        let realmList = Utilities.createDiv('realmList', container);

        // Show all realms
        for (let realmId in this.#realms) {
            if (!this.#realms.hasOwnProperty(realmId)) continue;
            let realm = this.#realms[realmId];

            let thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'thumbnailContainer';
            thumbnailContainer.addEventListener('click', function() {
                realmController.#showRealmPopup(realm.id);
            });

            let thumbnailName = document.createElement('div');
            thumbnailName.className = 'thumbnailName';
            thumbnailName.innerText = realm.name;
            thumbnailContainer.appendChild(thumbnailName);

            let thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.style.backgroundImage = 'url(' + this.getOverviewImage(realm.id) + ')';
            thumbnailContainer.appendChild(thumbnail);

            realmList.appendChild(thumbnailContainer);

            realm.containers = {
                thumbnail: thumbnail,
                name: thumbnailName
            };
        }
    }

    #getImage(realmId, dataKey) {
        let image = 'image/ui/missing.png';
        let realm = this.getRealm(realmId);
        if (realm != null && realm.images.hasOwnProperty(dataKey)) {
            let version = realm.images[dataKey].version;
            image = 'image/dynamic/realms/' + realmId + '/' + dataKey + '.png?v=' + version;
        }
        return image;
    }

    getOverviewImage(realmId) {
        return this.#getImage(realmId, 'overview');
    }

    getImage(realmId) {
        return this.#getImage(realmId, 'full');
    }

    #showRealmPopup(realmId) {
        let realm = this.getRealm(realmId);
        if (realm == null) {
            alert("Sorry, something went wrong!");
            return;
        }
        alert("And here I would show you the " + realm.name);
        this.#popupRealmId = realmId;
        this.getController().getHistory().set('realm', realmId);
        /*
        let element = this.getElement();
        let characterController = this;
        let buttons = {
            close: function() {
                characterController.#popupCharacterId = null;
                characterController.getController().getHistory().unset('character');
            },
            next: function() {
                characterController.onNextCharacter();
                // Close the popup and make a new one
                return true;
            },
            previous: function() {
                characterController.onPreviousCharacter();
                // Close the popup and make a new one
                return true;
            }
        };
        let popup = Utilities.showPopup(element.parentNode, 'characterSheet', buttons);
        if (character.properties.hasOwnProperty('color')) {
            popup.style.borderColor = character.properties.color.toLowerCase().replace(' ', '');
        }

        // Column 1:
        // Images, Backstory
        let column1 = Utilities.createDiv('column column_1', popup);

        let imageLabel = Utilities.createDiv('label section above clickable', column1, 'Click to View Images');
        imageLabel.addEventListener('click', function() {
            characterController.onShowImages();
        });
        let image = Utilities.createDiv('sheetImage section', column1);
        image.style.backgroundImage = 'url(' + this.getImage(characterKey) + ')';
        image.addEventListener('click', function() {
            characterController.onShowImages();
        });

        Utilities.createDiv('backstory section', column1, character.backstory);
        Utilities.createDiv('label section below', column1, 'Backstory');

        // Column 2
        // Info
        // Personality
        // Favorites
        let column2 = Utilities.createDiv('column column_2', popup);

        // Info
        let infoDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', infoDiv, 'Name');
        Utilities.createDiv('value', infoDiv, character.full_name);
        Utilities.createDiv('label', infoDiv, 'Birth Name');
        Utilities.createDiv('value', infoDiv, character.birth_name);
        this.#addCharacterPropertyInfo(character, infoDiv, 'title');
        this.#addCharacterPropertyInfo(character, infoDiv, 'species');
        this.#addCharacterPropertyInfo(character, infoDiv, 'age');
        this.#addCharacterPropertyInfo(character, infoDiv, 'birthday');

        let personalityDiv = Utilities.createDiv('personality section', column2);
        this.#addCharacterPropertyList(personalityDiv, character, 'traits', 2);

        let favoritesDiv = Utilities.createDiv('favorites section', column2);
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'job');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'color');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'food');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'habits');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'activity');
        this.#addCharacterPropertyInfo(character, favoritesDiv, 'fears');

        // Column 3
        let properties = this.getProperties();
        let column3 = Utilities.createDiv('column column_3', popup);
        let flagsDiv = Utilities.createDiv('flags', column3);
        let flags = ['birth_realm', 'sexuality', 'home_realm', 'pronouns'];

        for (let i = 0; i < flags.length; i++) {
            let flagId = flags[i];
            let flagDiv = Utilities.createDiv('section flag', flagsDiv);
            let propertyLabel = properties.hasOwnProperty(flagId) ? properties[flagId].name : '?';
            Utilities.createDiv('label flag', flagDiv, propertyLabel);
            let value = character.properties.hasOwnProperty(flagId) ? character.properties[flagId] : 'none';
            let imageDiv = Utilities.createDiv('flagImage', flagDiv);
            imageDiv.title = value;
            imageDiv.style.backgroundImage = 'url(image/flags/' + this.#translateToFlag(value) + '.jpg)';
        }

        let preferencesDiv = Utilities.createDiv('preferences', column3);
        let likesDiv = Utilities.createDiv('section likes', preferencesDiv);
        this.#addCharacterPropertyList(likesDiv, character, 'likes', 6, 'Likes &#x1F496;');
        let dislikesDiv = Utilities.createDiv('section dislikes', preferencesDiv);
        this.#addCharacterPropertyList(dislikesDiv, character, 'dislikes', 6, '&#128148;Dislikes');

        let relationshipsDiv =  Utilities.createDiv('section relationships', column3);
        Utilities.createDiv('label section', relationshipsDiv, 'Relationships');
        Utilities.createElement('hr', '', relationshipsDiv);
        let relationships = this.getController().getRelationships().getRelationshipList(characterKey);
        for (let i = 0; i < relationships.length; i++) {
            let relationship = relationships[i];
            let related = this.getCharacter(relationship.character);
            Utilities.createDiv('label', relationshipsDiv, relationship.name);
            Utilities.createDiv('value', relationshipsDiv, related.name);
        }
        if (character.notes != null && character.notes.length > 0) {
            let notesDiv = Utilities.createDiv('section notes', column3);
            Utilities.createDiv('label', notesDiv, 'Fun Facts');
            Utilities.createElement('hr', '', notesDiv);
            Utilities.createDiv('value', notesDiv, character.notes);
        }

        // Column 4
        let column4 = Utilities.createDiv('column column_4', popup);

        // Row 1
        let c4r1 = Utilities.createDiv('row row1', column4);

        // Health
        let healthDiv = Utilities.createDiv('section health', c4r1);
        Utilities.createDiv('label', healthDiv, 'Health');
        Utilities.createElement('hr', '', healthDiv);
        Utilities.createDiv('label above', healthDiv, 'Physical');
        let physicalHealthValue = character.properties.hasOwnProperty('physical_health') ? character.properties.physical_health : '?';
        Utilities.createDiv('value', healthDiv, physicalHealthValue + ' / 10');
        Utilities.createDiv('label above', healthDiv, 'Mental');
        let mentalHealthValue = character.properties.hasOwnProperty('mental_health') ? character.properties.mental_health : '?';
        Utilities.createDiv('value', healthDiv, mentalHealthValue + ' / 10');
        this.#addCharacterPropertyList(healthDiv, character, 'disorders', 2);
        this.#addCharacterPropertyList(healthDiv, character, 'illnesses', 2);

        // Guilt
        let guiltDiv = Utilities.createDiv('section guilt', c4r1);
        this.#addCharacterPropertyList(guiltDiv, character, 'guilt', 2);
        this.#addCharacterPropertyList(guiltDiv, character, 'secret', 2);

        let c4r2 = Utilities.createDiv('row row2', column4);

        // Skills
        let skillsDiv = Utilities.createDiv('section skills', c4r2);
        this.#addCharacterPropertyList(skillsDiv, character, 'skills', 2, undefined, 'hr');
        let aliveDiv = Utilities.createDiv('section alive', c4r2);
        Utilities.createSpan('', aliveDiv, character.properties.hasOwnProperty('living_status') ? character.properties['living_status'] : '');
        let religionDiv = Utilities.createDiv('section religion', c4r2);
        Utilities.createDiv('label', religionDiv, 'Religion');
        Utilities.createElement('hr', '', religionDiv);
        let religionList = character.properties.hasOwnProperty('religion') ? character.properties.religion : '';
        religionList = religionList.split(',');
        let religionMap = {};
        for (let i = 0; i < religionList.length; i++) {
            let item = religionList[i];
            if (item != '') religionMap[item] = true;
        }
        let religions = ['Love', 'Life', 'Death', 'Chaos', 'None'];
        for (let i = 0; i < religions.length; i++) {
            let religion = religions[i];
            let checkbox = Utilities.createElement('input');
            checkbox.type = 'checkbox';
            if (religionMap.hasOwnProperty(religion)) {
                checkbox.checked = true;
            }
            checkbox.disabled = true;
            let religionRow = Utilities.createDiv('', religionDiv);
            religionRow.appendChild(checkbox);
            Utilities.createSpan('', religionRow, religion);
        }

        let c4r3 = Utilities.createDiv('row row3', column4);
        let behaviorDiv = Utilities.createDiv('section behavior', c4r3);
        Utilities.createDiv('label', behaviorDiv, 'Behavior');
        Utilities.createElement('hr', '', behaviorDiv);
        this.#addCharacterPropertyInfo(character, behaviorDiv, 'perception');
        this.#addCharacterPropertyInfo(character, behaviorDiv, 'coping');

        let miscDic = Utilities.createDiv('section misc', c4r3);
        this.#addCharacterPropertyInfo(character, miscDic, 'comfort_item');
        this.#addCharacterPropertyInfo(character, miscDic, 'weapon');
        this.#addCharacterPropertyInfo(character, miscDic, 'carries');
        this.#addCharacterPropertyInfo(character, miscDic, 'accessories');

        let followingDiv = Utilities.createDiv('section following', c4r2);
        Utilities.createDiv('label', followingDiv, 'Following');
        Utilities.createElement('hr', '', followingDiv);

        let followingList = character.properties.hasOwnProperty('following') ? character.properties.following : '';
        followingList = followingList.split(',');
        let followingMap = {};
        for (let i = 0; i < followingList.length; i++) {
            let item = followingList[i];
            if (item != '') followingMap[item] = true;
        }
        let followings = ['Wrath', 'Lust', 'Gluttony', 'Sloth', 'Envy', 'Pride', 'Greed'];
        for (let i = 0; i < followings.length; i++) {
            let following = followings[i];
            let checkbox = Utilities.createElement('input');
            checkbox.type = 'checkbox';
            if (followingMap.hasOwnProperty(following)) {
                checkbox.checked = true;
            }
            checkbox.disabled = true;
            let followingRow = Utilities.createDiv('', followingDiv);
            followingRow.appendChild(checkbox);
            Utilities.createSpan('', followingRow, following);
        }

        let c4r4 = Utilities.createDiv('row row4', column4);
        let renownDiv = Utilities.createDiv('section reknown', c4r4);
        let renownTier = this.getTier(character.id, 'renown');
        renownTier = renownTier != null ? this.getController().getTiers().getTier('renown', renownTier.tier_id) : null;
        if (renownTier != null) {
            if (renownTier.name_singular != null) {
                renownDiv.innerText = renownTier.name_singular;
            }
            if (renownTier.color != null) {
                renownDiv.style.color = renownTier.color;
            }
        }

         */
    }

    getProperties() {
        return this.#properties;
    }

    getTitle() {
        return 'Realms';
    }

    onHistoryChange() {
        let history = this.getController().getHistory();
        let realmId = history.get('realm');
        if (this.#popupRealmId != realmId) {
            if (realmId == null) {
                Utilities.closePopups();
            } else {
                this.#showRealmPopup(realmId);
            }
        }
    }

    deactivate() {
        this.getController().getHistory().unset('realm');
    }
}
