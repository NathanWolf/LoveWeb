class Editor extends Component {
    #saveButton = null;
    #confirmedElement = null;

    constructor(controller, element) {
        super(controller, element);
    }

    createInput(editorForm, property) {
        let propertySection = document.createElement('section');
        editorForm.appendChild(propertySection);
        let propertyLabel = document.createElement('label');
        propertyLabel.for = 'propertyInput-' + property.id;
        let label = property.question != null ? property.question : property.name;
        propertyLabel.innerText = label;
        let propertyInput = document.createElement('input');
        propertyInput.id = 'propertyInput-' + property.id;
        propertyInput.size = 50;
        propertySection.appendChild(propertyLabel);
        propertySection.appendChild(propertyInput);
        return propertyInput;
    }

    createLongInput(editorForm, property, value) {
        let section = document.createElement('section');
        editorForm.appendChild(section);
        let label = document.createElement('label');
        label.for = 'input-' + property.id;
        label.innerText = property.name;
        let input = document.createElement('textarea');
        input.id = 'input-' + property.id;
        input.rows = 10;
        input.cols = 80;
        section.appendChild(label);
        section.appendChild(input);
        if (value != null) {
            input.value = value;
        }
        return input;
    }

    beginSave() {
        if (this.#saveButton != null) {
            this.#saveButton.disabled = true;
        }
    }

    createSaveButton(parent) {
        let saveButton = document.createElement('button');
        saveButton.className = 'save';
        saveButton.innerText = 'Save';
        parent.appendChild(saveButton);
        this.#saveButton = saveButton;
        return saveButton;
    }

    createSaveConfirm(parent) {
        let confirmedDiv = Utilities.createDiv('confirmed', parent);
        confirmedDiv.innerHTML = '&#9989;'
        confirmedDiv.style.display = 'none';
        this.#confirmedElement = confirmedDiv;
        return confirmedDiv;
    }

    processSave(response) {
        if (!response.success) {
            alert("An error occurred saving, please try again: " + response.message)
        }

        this.#saveButton.disabled = false;
        this.#confirmedElement.style.display = 'block';
    }

    clearSaved() {
        if (this.#confirmedElement != null) {
            this.#confirmedElement.style.display = 'none';
        }
    }

    saveFailed() {
        alert("Failed to save, sorry!");
        if (this.#saveButton != null) {
            this.#saveButton.disabled = false;
        }
    }

    getTitle() {
        return 'Editor';
    }
}