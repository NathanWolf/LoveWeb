class Realms extends Component {
    #realms = {};
    #properties = {};
    #popupRealmId = null;
    #popupImageId = null;
    #popupImageElement = null;
    #realmImageElement = null;

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
            thumbnail.style.backgroundImage = 'url(' + this.getThumbnailImage(realm.id) + ')';
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

    getThumbnailImage(realmId) {
        return this.#getImage(realmId, 'thumbnail');
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
        this.#popupRealmId = realmId;
        this.getController().getHistory().set('realm', realmId);

        let element = this.getElement();
        let realmController = this;
        let buttons = {
            close: function() {
                realmController.#popupRealmId = null;
                realmController.getController().getHistory().unset('realm');
            },
            next: function() {
                realmController.onNextRealm();
                // Close the popup and make a new one
                return true;
            },
            previous: function() {
                realmController.onPreviousRealm();
                // Close the popup and make a new one
                return true;
            }
        };
        let popup = Utilities.showPopup(element.parentNode, 'characterSheet', buttons);
        if (realm.properties.hasOwnProperty('color')) {
            popup.style.borderColor = realm.properties.color.toLowerCase().replace(' ', '');
        }

        // Column 1:
        // Images, Title, Subtitle
        let column1 = Utilities.createDiv('column column_1', popup);

        let imageLabel = Utilities.createDiv('label section above clickable', column1, 'Click to View Images');
        imageLabel.addEventListener('click', function() {
            realmController.onShowImages();
        });
        let image = Utilities.createDiv('sheetImage section', column1);
        image.style.backgroundImage = 'url(' + this.getOverviewImage(realmId) + ')';
        image.addEventListener('click', function() {
            realmController.onShowImages();
        });

        // Titles
        Utilities.createDiv('backstory section', column1, realm.name);
        Utilities.createDiv('label section below', column1, 'Title');
        Utilities.createDiv('backstory section', column1, realm.description);
        Utilities.createDiv('label section below', column1, 'Subtitle');

        // Flag
        let flagsDiv = Utilities.createDiv('flags', column1);
        let flagDiv = Utilities.createDiv('section flag', flagsDiv);
        Utilities.createDiv('label flag', flagDiv, 'Flag');
        let imageDiv = Utilities.createDiv('flagImage', flagDiv);
        imageDiv.style.backgroundImage = 'url(image/flags/' + Utilities.translateToFlag(realm.id) + '.jpg)';

        /*

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
            let flagDiv = Utilities.createDiv('section flag', flagsDiv);
            Utilities.createDiv('label flag', flagDiv, 'Flag');
            let imageDiv = Utilities.createDiv('flagImage', flagDiv);
            imageDiv.style.backgroundImage = 'url(image/flags/' + translateToFlag.translateToFlag(realmId) + '.jpg)';
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

    onShowImages() {
        let element = this.getElement();
        let realmController = this;
        let buttons = {
            close: true,
            next: function() {
                realmController.onNextImage();
            },
            previous: function() {
                realmController.onPreviousImage();
            }
        };
        this.#popupImageId = 'overview';
        this.#popupImageElement = Utilities.showPopup(element.parentNode, 'characterImageContainer', buttons);
        this.#updatePopupImage();
    }

    #updatePopupImage() {
        if (this.#popupImageElement == null) return;
        Utilities.empty(this.#popupImageElement);
        let imageId = this.#popupImageId;
        let realm = this.getRealm(this.#popupRealmId);
        if (realm == null || !realm.images.hasOwnProperty(imageId)) return;
        let image = realm.images[imageId];
        let title = realm.name + ' ' + image.title;
        Utilities.createDiv('characterImageTitle', this.#popupImageElement, title);
        this.#realmImageElement = Utilities.createDiv('characterImage', this.#popupImageElement);
        Utilities.createDiv('characterImageDescription', this.#popupImageElement, image.description);
        this.#updatePopupFrame();
    }

    #updatePopupFrame() {
        if (this.#realmImageElement == null) return;
        let imageContainer = this.#realmImageElement;
        let imageId = this.#popupImageId;
        let realm = this.getRealm(this.#popupRealmId);
        if (realm == null || !realm.images.hasOwnProperty(imageId)) return;
        let image = realm.images[imageId];
        imageContainer.style.backgroundImage = 'url(' + this.#getImage(this.#popupRealmId, imageId) + ')';
        if (image.offset_x != 0) {
            imageContainer.style.marginLeft = image.offset_x;
        }
        if (image.offset_y != 0) {
            imageContainer.style.marginTop = image.offset_y;
        }
    }

    onNextImage() {
        this.#goImage(1);
    }

    onPreviousImage() {
        this.#goImage(-1);
    }

    #goImage(direction) {
        let realm = this.getRealm(this.#popupRealmId);
        let imageList = [];
        for (let imageKey in realm.images) {
            if (realm.images.hasOwnProperty(imageKey) && !realm.images[imageKey].hidden) {
                imageList.push(realm.images[imageKey]);
            }
        }
        if (imageList.length == 0) return;
        // Sort the list, but keep the first image as first
        let firstImage = imageList.shift();
        imageList = imageList.sort(function(a, b) {
            return a.priority - b.priority;
        });
        imageList.unshift(firstImage);
        let index = 0;
        for (let i = 0; i < imageList.length; i++) {
            if (imageList[i].image_id == this.#popupImageId) {
                index = i;
                break;
            }
        }
        index = (index + direction + imageList.length) % imageList.length;
        this.#popupImageId = imageList[index].image_id;
        this.#updatePopupImage();
    }
}
