class Relationships extends Component {
    constructor(controller, element) {
        super(controller, element);
    }

    show() {
        const rowsPerRelationship = 3;

        let containerElement = this.getElement();
        let characters = this.getController().getCharacters();
        Utilities.empty(containerElement);
        let characterList = characters.getCharacterList();
        characterList.forEach(function(character) {
            if (!character.hasOwnProperty('relationships')) return;

            // Make a table spaced out to look like a family tree
            let characterTable = document.createElement('table');
            let characterBody =  document.createElement('tbody');
            characterTable.appendChild(characterBody);
            let relationships = characters.getRelationshipList(character.id);
            let relationshipCount = relationships.length;
            let rowCount = relationshipCount * rowsPerRelationship;
            for (let relationShipIndex = 0; relationShipIndex < relationshipCount; relationShipIndex++) {
                let relationship = relationships[relationShipIndex];
                let targetCharacter = characters.getCharacter(relationship.character);
                if (targetCharacter == null) continue;

                // Each relationship takes up multiple rows so the cells can be different sizes
                let centerRow = Math.floor(rowsPerRelationship / 3);
                for (let rowIndex = 0; rowIndex < rowsPerRelationship; rowIndex++) {
                    let row = document.createElement('tr');
                    // The first row will have the main character in it with a full-height rowspan
                    if (relationShipIndex === 0 && rowIndex === 0) {
                        let characterCell = document.createElement('td');
                        characterCell.style.backgroundImage = 'url(' + characters.getImage(character.id) + ')';
                        characterCell.className = 'relationshipMainCharacter';
                        characterCell.rowSpan = rowCount;
                        characterCell.title = character.name;
                        row.appendChild(characterCell);
                    }

                    // The center row will have the relationship label in it
                    // The other rows have a blank cell here
                    let relationShipCell = document.createElement('td');
                    if (rowIndex === centerRow) {
                        relationShipCell.className = 'relationshipType';
                        relationShipCell.innerText = relationship.name;
                    } else {
                        relationShipCell.className = 'relationshipFiller';
                    }
                    row.appendChild(relationShipCell);

                    // Add relationship portrait last, only on the first row of each relationship
                    if (rowIndex === 0) {
                        let characterCell = document.createElement('td');
                        characterCell.className = 'relationshipCharacter';
                        characterCell.rowSpan = 3;
                        characterCell.title = targetCharacter.name;
                        characterCell.style.backgroundImage = "url('" + characters.getPortrait(targetCharacter.id) + "')";
                        row.appendChild(characterCell);
                    }
                    characterBody.append(row);
                }
            }

            let characterDiv = Utilities.createDiv('relationship', containerElement);
            characterDiv.appendChild(characterTable);
        });
    }

    getTitle() {
        return 'Relationships';
    }
}
