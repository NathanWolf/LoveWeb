class Editor extends Component {
    #saveButton = null;
    #confirmedElement = null;

    constructor(controller, element) {
        super(controller, element);
    }

    createInput(editorForm, property, showOptions) {
        let propertySection = document.createElement('section');
        editorForm.appendChild(propertySection);
        let propertyLabel = document.createElement('label');
        propertyLabel.for = 'propertyInput-' + property.id;
        let label = property.question != null ? property.question : property.name;
        propertyLabel.innerText = label;
        let propertyInput = document.createElement('input');
        propertyInput.id = 'propertyInput-' + property.id;
        propertyInput.size = 50;
        propertyInput.autocomplete = 'off';
        propertySection.appendChild(propertyLabel);
        propertySection.appendChild(propertyInput);

        // Add value selector pop-up
        if (showOptions && showOptions.length > 0) {
            showOptions.sort();
            let propertySelectContainer = document.createElement('div');
            propertySelectContainer.className = 'propertySelectContainer';
            propertySelectContainer.style.display = 'none';
            let select = document.createElement('select');
            select.size = 8;
            for (let i = 0; i < showOptions.length; i++) {
                let option = document.createElement('option');
                option.innerText = showOptions[i];
                select.appendChild(option);
            }
            select.addEventListener('change', function() {
                propertySelectContainer.style.display = 'none';
                if (select.selectedIndex >= 0) {
                    propertyInput.value = select.value;
                }
            });
            propertySelectContainer.append(select);
            editorForm.appendChild(propertySelectContainer);

            // Set up event listeners for selector
            propertyInput.addEventListener('focus', function() {
                let value = propertyInput.value.trim().toLowerCase();
                Utilities.filterOptions(select, value);

                propertySelectContainer.style.display = 'block';
            });
            propertyInput.addEventListener('blur', function(event) {
                if (event.relatedTarget != select) {
                    propertySelectContainer.style.display = 'none';
                }
            });
            propertyInput.addEventListener('input', function(event) {
                let value = propertyInput.value.trim().toLowerCase();
                Utilities.filterOptions(select, value);
            });
            propertyInput.addEventListener('keydown', function(event) {
                switch (event.key) {
                    case 'Escape':
                        propertySelectContainer.style.display = 'none';
                        event.preventDefault();
                        break;
                    case 'Enter':
                        propertySelectContainer.style.display = 'none';
                        event.preventDefault();
                        break;
                    case 'ArrowUp':
                        Utilities.nextOption(select, -1);
                        event.preventDefault();
                        break;
                    case 'ArrowDown':
                        Utilities.nextOption(select, 1);
                        event.preventDefault();
                        break;
                    case 'Tab':
                        propertySelectContainer.style.display = 'none';
                        if (select.selectedIndex >= 0) {
                            propertyInput.value = select.value;
                        }
                        break;
                }
            });

        }

        return propertyInput;
    }

    createLongInput(editorForm, property, value) {
        let section = document.createElement('section');
        editorForm.appendChild(section);
        let label = document.createElement('label');
        label.for = 'input-' + property.id;
        label.innerText = property.name;
        let input = document.createElement('textarea');
        input.autocomplete = 'off';
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