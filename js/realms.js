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

        // Column 2
        // Properties, Characters
        let column2 = Utilities.createDiv('column column_2', popup);

        // Info
        let propertiesDiv = Utilities.createDiv('info section', column2);
        this.#addRealmPropertyInfo(realm, propertiesDiv, 'species');
        this.#addRealmPropertyInfo(realm, propertiesDiv, 'magic');
        this.#addRealmPropertyInfo(realm, propertiesDiv, 'politics');

        let technologyDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', technologyDiv, 'Technology');

        let creaturesDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', creaturesDiv, 'Creatures');

        let mapsDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', mapsDiv, 'Maps');

        let inhabitantsDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', inhabitantsDiv, 'Inhabitants');

        let historyDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', historyDiv, 'History');

        let residentsDiv = Utilities.createDiv('info section', column2);
        Utilities.createDiv('label', residentsDiv, 'Residents');
    }

    #addRealmPropertyInfo(realm, container, property, label) {
        if (typeof(label) === 'undefined') {
            let properties = this.getProperties();
            if (properties.hasOwnProperty(property)) {
                label = properties[property].name;
            } else {
                label = '?';
            }
        }
        Utilities.createDiv('label', container, label);
        Utilities.createDiv('value', container, realm.properties.hasOwnProperty(property) ? realm.properties[property] : null);
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
