class RenameFlashcards extends Flashcards {
    constructor(controller, element) {
        super(controller, element);
    }


    filter(characters) {
        let renamedCharacters = [];
        for (let character of characters) {
            if (character.first_name_old != null && character.first_name_old != character.first_name) {
                renamedCharacters.push(character);
            }
        }
        return renamedCharacters;
    }

    getCaption(character) {
        return Utilities.createDiv('oldName', undefined, character.first_name_old);
    }
}
