class Love {
    constructor() {
        let love = this;
        // Register events for portrait clicks
        let portraits = document.getElementsByClassName('portraitName');
        for (let index = 0; index < portraits.length; index++) {
            let portrait = portraits[index];
            portrait.addEventListener('click', function(event) {
                love.onPortraitClick(event.target);
            })
        }

        // Click to close character sheet
        document.getElementById('characterSheet').addEventListener('click', function() {
            document.getElementById('characterSheetPopup').style.display = 'none';
        });
    }

    onPortraitClick(portrait) {
        document.getElementById('characterSheetPopup').style.display = 'flex';
        let sheet = document.getElementById('characterSheet');
        let character = portrait.dataset.character;
        sheet.style.backgroundImage = "url('image/sheets/" + character + ".png')";
    }
}