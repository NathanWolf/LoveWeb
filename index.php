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
    <link rel="stylesheet" href="css/profile.css">
    <link rel="stylesheet" href="css/editor.css">
    <script src="https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js"></script>
    <script type="text/javascript" src="js/utilities.js"></script>
    <script type="text/javascript" src="js/characters.js"></script>
    <script type="text/javascript" src="js/chat.js"></script>
    <script type="text/javascript" src="js/quizzes.js"></script>
    <script type="text/javascript" src="js/flashcards.js"></script>
    <script type="text/javascript" src="js/tiers.js"></script>
    <script type="text/javascript" src="js/relationships.js"></script>
    <script type="text/javascript" src="js/profile.js"></script>
    <script type="text/javascript" src="js/love.js"></script>
    <script type="text/javascript" src="js/editor.js"></script>
    <script type="text/javascript" src="js/character_editor.js"></script>
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
        <div class="toolbar">
            <div class="tabButton active toolbarButton" data-tab="home">&#8962;</div>
            <div class="tabButtons">
                <div class="tabButton toolbarButton" data-tab="characters">Characters</div>
                <div class="tabButton toolbarButton" data-tab="chat">Chat</div>
                <div class="tabButton toolbarButton" data-tab="quizzes">Quizzes</div>
                <div class="tabButton toolbarButton" data-tab="flashCards">Flash Cards</div>
                <div class="tabButton toolbarButton" data-tab="relationships">Relationships</div>
                <div class="tabButton toolbarButton" data-tab="tierLists">Tier Lists</div>
                <div class="tabButton toolbarButton admin" data-tab="characterEditor" style="display: none">Character Editor</div>
                <div class="tabLink toolbarButton"><a href="https://games.elmakers.com/love" target="_blank">Play Game &#128279;</a></div>
            </div>
            <div id="profileButton" class="tabButton toolbarButton loggedout" data-tab="profile">&#128100;&#xfe0e;</div>
        </div>

        <div class="tab" id="home">
            <div class="tile navigation" data-tab="characters">Characters</div>
            <div class="tile navigation" data-tab="chat">Chat</div>
            <div class="tile navigation" data-tab="quizzes">Quizzes</div>
            <div class="tile navigation" data-tab="flashCards">Flash Cards</div>
            <div class="tile navigation" data-tab="relationships">Relationships</div>
            <div class="tile navigation" data-tab="tierLists">Tier Lists</div>
            <div class="tile navigation admin" data-tab="characterEditor">Character Editor</div>
            <div class="tile"><a href="https://games.elmakers.com/love" target="_blank">Play Game &#128279;</a></div>
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

        <div class="tab" id="profile" style="display: none">

        </div>

        <div class="tab editor" id="characterEditor" style="display: none">

        </div>
    </div>

    <div id="loading">
        &nbsp;
    </div>
</body>
</html>
