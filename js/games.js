class Games extends Component {
    #games = {};

    constructor(controller, element) {
        super(controller, element);
    }

    addGames(games) {
        for (let id in games) {
            if (games.hasOwnProperty(id)) {
                if (this.#games.hasOwnProperty(id)) {
                    for (let personaId in games[id]) {
                        if (games[id].hasOwnProperty(personaId)) {
                            this.#games[id][personaId] = games[id][personaId];
                        }
                    }
                } else {
                    this.#games[id] = games[id];
                }
            }
        }
    }

    getCharacterData(gameId) {
        if (!this.#games.hasOwnProperty(gameId)) {
            return {};
        }
        return this.#games[gameId];
    }

    getCharacters(gameId) {
        let gameCharacters = this.getCharacterData(gameId);
        let characters = this.getController().getCharacters().getCharacters();
        for (let id in gameCharacters) {
            if (gameCharacters.hasOwnProperty(id)) {
                let gameCharacter = gameCharacters[id];
                if (!gameCharacter.enabled) {
                    delete characters[id];
                } else {
                    gameCharacters[id].game = gameCharacter
                }
            } else {
                gameCharacters[id].game = null;
            }
        }
        return characters;
    }

    getCharacterList(gameId) {
        return Object.values(this.getCharacters(gameId));
    }
}
