class TimelineEditor extends Editor {

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let controller = this;
        let container = this.getElement();
        Utilities.empty(container);

        let tableContainer = Utilities.createDiv('timelineEditorContainer', container);
        let editorTable = Utilities.createElement('table', 'timelineEditorTable', tableContainer);
        let editorBody = Utilities.createElement('tbody', '', editorTable);

        this.#createEventRow(editorBody, true);

        /*

        for (let characterIndex = 0; characterIndex < charactersList.length; characterIndex++) {
            let character = charactersList[characterIndex];
            let relationships = character.relationships;
            for (let relationshipType in relationships) {
                if (!character.relationships.hasOwnProperty(relationshipType)) continue;
                let related = relationships[relationshipType];
                for (let relatedIndex = 0; relatedIndex < related.length; relatedIndex++) {
                    let relatedCharacter = characters.getCharacter(related[relatedIndex]);
                    if (relatedCharacter == null) continue;
                    let relationshipRow = Utilities.createElement('tr', '', relationshipBody);
                    let saveCell = Utilities.createElement('td', '', relationshipRow);
                    let saveButton = Utilities.createElement('button', 'relationshipSaveButton', saveCell, 'Save');
                    saveButton.disabled = true;
                    let fromCell = Utilities.createElement('td', '', relationshipRow);
                    this.#createCharacterSelect(fromCell, character.id);
                    let relationshipCell = Utilities.createElement('td', '', relationshipRow);
                    Utilities.createSpan('', relationshipCell, 'has a');
                    this.#createRelationshipSelect(relationshipCell, relationshipType)
                    Utilities.createSpan('', relationshipCell, 'named');
                    let toCell = Utilities.createElement('td', '', relationshipRow);
                    this.#createCharacterSelect(toCell, relatedCharacter.id);



        let newDescriptionRow = Utilities.createElement('tr', '', editorBody);
        let descriptionInput = this.createLongInput(nameCell, 'description');
        descriptionInput.placeholder = '(Optional Long Description of Event)';
                }
            }

        }

         */
    }

    #createEventRow(editorBody, isNew) {
        let newRow = Utilities.createElement('tr', '', editorBody);
        let addCell = Utilities.createElement('td', '', newRow);
        let buttonText = isNew ? 'Add' : 'Save';
        let addButton = Utilities.createElement('button', 'timelineSaveButton', addCell, buttonText);
        if (!isNew) {
            Utilities.setVisible(addButton, false);
        } else {
            addButton.disabled = true;
        }
        let yearCell = Utilities.createElement('td', '', newRow);
        let yearInput = this.#createSimpleInput(yearCell, 8);
        yearInput.placeholder = 'Year';
        let yearCheckbox = Utilities.createElement('button', 'toggleButton', yearCell, 'AT');
        yearCheckbox.type = 'button';
        let monthCell = Utilities.createElement('td', '', newRow);
        this.#createMonthSelect(monthCell);
        let dayCell = Utilities.createElement('td', '', newRow);
        this.#createDaySelect(dayCell);
        let nameCell = Utilities.createElement('td', '', newRow);
        let nameInput = this.#createSimpleInput(nameCell, 20);
        nameInput.placeholder = 'Name of Event';
    }

    #createSimpleInput(editorForm, size, value) {
        let input = document.createElement('input');
        input.autocomplete = 'off';
        input.size = size;
        input.type = 'text';
        if (value != null) {
            input.value = value;
        }
        editorForm.appendChild(input);
        return input;
    }

    #createMonthSelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, 'Month');
        }
        let months = this.getController().getTimeline().getMonths();
        let ids = Object.keys(months);
        ids.sort((a, b) => (a - b));
        for (let idIndex = 0; idIndex < ids.length; idIndex++) {
            let id = ids[idIndex];
            let option = Utilities.createElement('option', '', select, months[id].name);
            option.value = id;
            if (selectedId == id) {
                option.selected = true;
            }
        }
        return select;
    }

    #createDaySelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, 'Day');
        }
        for (let day = 1; day <= 28; day++) {
            let option = Utilities.createElement('option', '', select, day);
            option.value = day;
            if (selectedId == day) {
                option.selected = true;
            }
        }
        return select;
    }

    processSave(response) {
        super.processSave(response);

        if (response.success) {
            // TODO
        }
    }

    #save(properties) {
        let profile = this.getController().getProfile();
        let user = profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        let editor = this;
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function() {
            editor.processSave(this.response);
        };
        request.onerror = function() {
            editor.saveFailed();
        };

        request.open("POST", "data/editor.php?action=save_event"
            + '&user=' + user.id
            + '&token=' + user.token
            + '&properties=' + encodeURIComponent(JSON.stringify(properties)), true);
        request.send();
    }
}