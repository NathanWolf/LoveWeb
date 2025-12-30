class RenameFlashcards extends Flashcards {
    constructor(controller, element) {
        super(controller, element);
    }


    filter(characters) {
        let renamedCharacters = [];
        for (let character of characters) {
            if (character.name_old != null && character.name_old != character.name) {
                renamedCharacters.push(character);
            }
        }
        return renamedCharacters;
    }

    getCaption(character) {
        return Utilities.createDiv('oldName', undefined, character.first_name_old);
    }

    getTitle() {
        return 'Learn the New Character Names!';
    }
}
