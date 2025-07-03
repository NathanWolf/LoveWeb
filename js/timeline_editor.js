class TimelineEditor extends Editor {

    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        let container = this.getElement();
        Utilities.empty(container);

        let tableContainer = Utilities.createDiv('timelineEditorContainer', container);
        let editorTable = Utilities.createElement('table', 'timelineEditorTable', tableContainer);
        let editorBody = Utilities.createElement('tbody', '', editorTable);

        // Create "new" row first
        this.#createEventRow(editorBody, null);

        // Create other rows
        let timeline = this.getController().getTimeline();
        let eventIdList = timeline.getTimeline();
        let events = timeline.getEvents();

        for (let i = 0; i < eventIdList.length; i++) {
            let event = events[eventIdList[i]];
            this.#createEventRow(editorBody, event);
        }
    }

    #createEventRow(editorBody, data) {
        let isNewRow = data == null;
        if (data == null) {
            data = {
                id: null,
                year: null,
                month: null,
                day: null,
                end_year: null,
                end_month: null,
                end_day: null,
                name: '',
                description: ''
            };
        }
        let newRow = Utilities.createElement('tr', '', editorBody);
        let addCell = Utilities.createElement('td', '', newRow);
        let buttonText = isNewRow ? 'Add' : 'Save';
        let saveButton = Utilities.createElement('button', 'timelineSaveButton', addCell, buttonText);
        if (!isNewRow) {
            Utilities.setVisible(saveButton, false);
        } else {
            saveButton.disabled = true;
        }

        let yearCell = Utilities.createElement('td', '', newRow);
        let yearInput = this.#createSimpleInput(yearCell, 8, Math.abs(data.year));
        yearInput.placeholder = 'Year';
        let yearCheckbox = this.#createEraSelect(yearCell, data.year);
        let monthCell = Utilities.createElement('td', '', newRow);
        let monthInput = this.#createMonthSelect(monthCell, data.month);
        let dayCell = Utilities.createElement('td', '', newRow);
        let dayInput = this.#createDaySelect(dayCell, data.day);

        let nameCell = Utilities.createElement('td', '', newRow);
        let nameInput = this.#createSimpleInput(nameCell, 30, data.name);
        nameInput.placeholder = 'Name of Event';

        let endTimeRow = Utilities.createElement('tr', '', editorBody);
        Utilities.createElement('td', '', endTimeRow);
        let endYearCell = Utilities.createElement('td', '', endTimeRow);
        let endYearInput = this.#createSimpleInput(endYearCell, 8, Math.abs(data.end_year));
        endYearInput.placeholder = 'Year';
        let endYearCheckbox = this.#createEraSelect(endYearCell, data.end_year);
        let endMonthCell = Utilities.createElement('td', '', endTimeRow);
        let endMonthInput = this.#createMonthSelect(endMonthCell, data.end_month);
        let endDayCell = Utilities.createElement('td', '', endTimeRow);
        let endDayInput = this.#createDaySelect(endDayCell, data.end_day);

        let endDayLabel = Utilities.createElement('td', '', endTimeRow);
        endDayLabel.innerText = '<- End Time';

        let descriptionRow = Utilities.createElement('tr', 'rowSeparator', editorBody);
        Utilities.createElement('td', '', descriptionRow);
        let descriptionCell = Utilities.createElement('td', '', descriptionRow);
        descriptionCell.colSpan = 4;
        let descriptionInput = this.#createSimpleLongInput(descriptionCell, 77, data.description);
        descriptionInput.placeholder = 'Optional Description';

        // Set up event listeners
        let modifiedFunction = function() {
            if (yearInput.value == null) return;
            if (monthInput.value == null) return;
            if (dayInput.value == null) return;
            if (nameInput.value == '') return;

            Utilities.setVisible(saveButton, true);
            saveButton.disabled = false;
        };
        yearInput.addEventListener('keyup', modifiedFunction);
        monthInput.addEventListener('change', modifiedFunction);
        dayInput.addEventListener('change', modifiedFunction);

        endYearInput.addEventListener('keyup', modifiedFunction);
        endMonthInput.addEventListener('change', modifiedFunction);
        endDayInput.addEventListener('change', modifiedFunction);

        nameInput.addEventListener('keyup', modifiedFunction);
        descriptionInput.addEventListener('keyup', modifiedFunction);
        yearCheckbox.addEventListener('click', function() {
            if (yearCheckbox.dataset.yearType == 'at') {
                yearCheckbox.dataset.yearType = 'bt';
                yearCheckbox.innerText = 'BT';
            } else {
                yearCheckbox.dataset.yearType = 'at';
                yearCheckbox.innerText = 'AT';
            }
            modifiedFunction();
        });
        endYearCheckbox.addEventListener('click', function() {
            if (endYearCheckbox.dataset.yearType == 'at') {
                endYearCheckbox.dataset.yearType = 'bt';
                endYearCheckbox.innerText = 'BT';
            } else {
                endYearCheckbox.dataset.yearType = 'at';
                endYearCheckbox.innerText = 'AT';
            }
            modifiedFunction();
        });
        let editor = this;
        let successFunction = function(event) {
            if (data.id == null) {
                saveButton.disabled = true;
                nameInput.value = '';
                descriptionInput.value = '';
                editor.#createEventRow(event);
            } else {
                Utilities.setVisible(saveButton, false);
            }
        }
        saveButton.addEventListener('click', function() {
            data.year = Math.abs(parseInt(yearInput.value));
            if (yearCheckbox.dataset.yearType == 'bt') {
                data.year = -data.year;
            }
            data.month = parseInt(monthInput.value);
            data.day = parseInt(dayInput.value);
            data.end_year = Math.abs(parseInt(endYearInput.value));
            if (endYearCheckbox.dataset.yearType == 'bt') {
                data.end_year = -data.end_year;
            }
            data.end_month = parseInt(endMonthInput.value);
            data.end_day = parseInt(endDayInput.value);
            data.name = nameInput.value;
            data.description = descriptionInput.value;
            editor.#updateEvent(data, saveButton, successFunction);
        });
    }

    #updateEvent(data, saveButton, onSuccess) {
        let profile = this.getController().getProfile();
        let user = profile.getUser();
        if (user == null || !user.admin) {
            alert("Hey, you're not supposed to be doing this!");
            return;
        }
        this.beginSave();
        let editor = this;
        const request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function() {
            if (!this.response.success) {
                editor.saveFailed(this.response.message);
                saveButton.disabled = false;
            } else {
                onSuccess();
            }
        };
        request.onerror = function() {
            editor.saveFailed();
            saveButton.disabled = false;
        };

        request.open("POST", 'data/editor.php?action=save_event' +
            '&event=' + encodeURIComponent(JSON.stringify(data))
            + '&user=' + user.id
            + '&token=' + user.token
            , true);
        request.send();
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

    #createSimpleLongInput(editorForm, cols, value) {
        let input = document.createElement('textarea');
        input.autocomplete = 'off';
        input.rows = 2;
        input.cols = cols;
        if (value != null) {
            input.value = value;
        }
        editorForm.appendChild(input);
        return input;
    }

    #createEraSelect(container, year) {
        let yearCheckbox = Utilities.createElement('button', 'yearToggleButton', container, year >= 0 ? 'AT' : 'BT');
        yearCheckbox.type = 'button';
        yearCheckbox.dataset.yearType = year >= 0 ? 'at' : 'bt';
        return yearCheckbox;
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