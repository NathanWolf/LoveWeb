<?php ?>
<html lang="en-us">
<head>
    <title>Love</title>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
    <link rel="stylesheet" href="css/love.css">
    <link rel="stylesheet" href="css/characters.css">
    <link rel="stylesheet" href="css/chat.css">
    <link rel="stylesheet" href="css/quizzes.css">
    <link rel="stylesheet" href="css/flashcards.css">
    <link rel="stylesheet" href="css/tiers.css">
    <link rel="stylesheet" href="css/relationships.css">
    <script src="https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js"></script>
    <script type="text/javascript" src="js/utilities.js"></script>
    <script type="text/javascript" src="js/characters.js"></script>
    <script type="text/javascript" src="js/chat.js"></script>
    <script type="text/javascript" src="js/quizzes.js"></script>
    <script type="text/javascript" src="js/flashcards.js"></script>
    <script type="text/javascript" src="js/tiers.js"></script>
    <script type="text/javascript" src="js/relationships.js"></script>
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

    <div class="tabContainer" id="mainContainer">
        <div class="tabButtons">
            <div class="tabButton active" data-tab="characters">Characters</div>
            <div class="tabButton" data-tab="chat">Chat</div>
            <div class="tabButton" data-tab="quizzes">Quizzes</div>
            <div class="tabButton" data-tab="flashCards">Flash Cards</div>
            <div class="tabButton" data-tab="relationships">Relationships</div>
            <div class="tabButton" data-tab="tierLists">Tier Lists</div>
            <div class="tabLink"><a href="https://games.elmakers.com/love" target="_blank">Play Game &#128279;</a></div>
        </div>

        <div class="tab" id="characters">
        </div>

        <div class="tab" id="chat">
        </div>

        <div class="tab" id="relationships" style="display: none">
        </div>

        <div class="tab" id="tierLists" style="display: none">
        </div>

        <div class="tab" id="flashCards" style="display: none">
        </div>

        <div class="tab" id="quizzes" style="display: none">
        </div>
    </div>

    <div id="loading">
        &nbsp;
    </div>
</body>
</html>
