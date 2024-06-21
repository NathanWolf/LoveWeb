class RelationshipEditor extends Editor {

    constructor(controller, element) {
        super(controller, element);
    }

    #createRelationshipSelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, '(Choose)');
        }
        let relationships = this.getController().getRelationships().getRelationships();
        let ids = Object.keys(relationships);
        ids.sort();
        for (let idIndex = 0; idIndex < ids.length; idIndex++) {
            let id = ids[idIndex];
            let option = Utilities.createElement('option', '', select, relationships[id].name);
            option.value = id;
            if (selectedId == id) {
                option.selected = true;
            }
        }
        return select;
    }

    #createCharacterSelect(container, selectedId) {
        let select = Utilities.createElement('select', '', container);
        if (!selectedId) {
            Utilities.createElement('option', '', select, '(Choose)');
        }
        Utilities.createElement('option', '', select, '(Choose)');
        let characterList = this.getController().getCharacters().getCharacterList();
        characterList.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        for (let characterIndex = 0; characterIndex < characterList.length; characterIndex++) {
            let character = characterList[characterIndex];
            let option = Utilities.createElement('option', '', select, character.name);
            option.value = character.id;
            if (selectedId == character.id) {
                option.selected = true;
            }
        }
        return select;
    }

    show() {
        let controller = this;
        let container = this.getElement();
        Utilities.empty(container);
        let characters = this.getController().getCharacters();
        let charactersList = characters.getCharacterList(true);
        charactersList.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        let relationshipTable = Utilities.createElement('table', 'relationshipTable', container);
        let relationshipBody = Utilities.createElement('tbody', '', relationshipTable);

        let newRow = Utilities.createElement('tr', '', relationshipBody);
        let addCell = Utilities.createElement('td', '', newRow);
        let addButton = Utilities.createElement('button', 'relationshipSaveButton', addCell, 'Add');
        addButton.disabled = true;
        let fromCell = Utilities.createElement('td', '', newRow);
        this.#createCharacterSelect(fromCell);
        let relationshipCell = Utilities.createElement('td', '', newRow);
        Utilities.createSpan('', relationshipCell, 'has a');
        this.#createRelationshipSelect(relationshipCell)
        Utilities.createSpan('', relationshipCell, 'named');
        let toCell = Utilities.createElement('td', '', newRow);
        this.#createCharacterSelect(toCell);

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
                }
            }

        }
    }
}
