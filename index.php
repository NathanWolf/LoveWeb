<?php ?>
<html lang="en-us">
<head>
    <title>Love</title>
    <link rel="stylesheet" href="css/love.css">
    <script type="text/javascript" src="js/love.js"></script>
    <script type="text/javascript">
        window.onload = function() {
            let love = new Love();
            love.register();
            love.load();
        };
    </script>
</head>
<body>

    <div class="tabContainer">
        <div class="tabButtons">
            <div class="tabButton active" data-tab="characters">Characters</div>
            <div class="tabButton" data-tab="relationships">Relationships</div>
            <div class="tabButton" data-tab="tierLists">Tier Lists</div>
            <div class="tabButton" data-tab="quizzes">Quizzes</div>
        </div>

        <div class="tab" id="characters">
        </div>

        <div class="tab" id="relationships" style="display: none">
            Relationships Coming Soon!
        </div>

        <div class="tab" id="tierLists" style="display: none">
            Tier Lists Coming Soon!
        </div>

        <div class="tab" id="quizzes" style="display: none">
            <div id="quizList">

            </div>
            <div id="quizQuestion" style="display: none">

            </div>
        </div>
    </div>

    <div class="popup" id="characterSheetPopup" style="display: none">
        <div class="popupContent">
            <div id="characterSheet">
                &nbsp;
            </div>
        </div>
    </div>
    <div class="popup" id="characterSheetMissingPopup" style="display: none">
        <div class="popupContent">
            <div id="characterSheetMissing">
                Information on <span id="characterSheetMissingName">???</span> coming soon!
            </div>
        </div>
    </div>
</body>
</html>
