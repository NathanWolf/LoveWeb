<?php
    require_once('data/version.inc.php');
?>
<html lang="en-us">
<head>
    <title>Divi!nity</title>
    <meta name="viewport" content="width=device-width,initial-scale=0.5,maximum-scale=0.5,user-scalable=no"/>
    <link rel="stylesheet" href="css/love.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/popup.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/characters.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/realms.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/chat.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/quizzes.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/flashcards.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/tiers.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/relationships.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/timeline.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/profile.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/editor.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/info.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/mobile.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/font.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/games.css?v=<?=VERSION?>">
    <script src="https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js"></script>
    <script type="text/javascript" src="js/utilities.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/history.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/component.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/characters.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/chat.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/character_quiz.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/quizzes.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/flashcards.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/tiers.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/relationships.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/timeline.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/profile.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/realms.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/love.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/character_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/timeline_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/relationship_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/info.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/games.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/slideshow.js?v=<?=VERSION?>"></script>
    <script type="text/javascript">
        // For debugging
        var _love;
        window.onload = function() {
            let love = new Love();
            love.register();
            love.load();
            love.getProfile().checkDisplayMode();
            _love = love;
        };
    </script>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-MZRB913E0C"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-MZRB913E0C');
    </script>
</head>
<body>

    <div id="mainContainer">

        <div class="toolbar">
            <div class="toolbarButton" id="mainMenuButton">
                <div id="mainMenuButton_top_bun"></div>
                <div id="mainMenuButton_lettuce"></div>
                <div id="mainMenuButton_sun"></div>
                <div id="mainMenuButton_tomato"></div>
                <div id="mainMenuButton_bottom_bun"></div>
            </div>
            <div class="toolbarLogo" title="Divi!nity"></div>
        </div>

        <div class="tabButtons" id="mainMenu">
            <div class="tabButton active toolbarButton" data-tab="info">Info</div>
            <div class="tabButton toolbarButton" data-tab="slideshow">Slideshow</div>
            <div class="tabButton toolbarButton" data-tab="characters">Characters</div>
            <div class="tabButton toolbarButton" data-tab="realms">Realms</div>
            <div class="tabButton toolbarButton user" data-tab="chat"  style="display: none">Chat</div>
            <div class="tabButton toolbarButton" data-tab="games">Games</div>
            <div class="tabButton toolbarButton" data-tab="relationships">Relationships</div>
            <div class="tabButton toolbarButton" data-tab="timeline">Timeline</div>
            <div class="tabButton toolbarButton admin" data-tab="characterEditor" style="display: none">Character Editor</div>
            <div class="tabButton toolbarButton admin" data-tab="timelineEditor" style="display: none">Timeline Editor</div>
            <div class="tabButton toolbarButton" data-tab="profile" id="profileTabButton"><div>Profile</div><div class="loggedout" id="profileIcon"></div></div>
        </div>

        <div class="popup" id="mainMenuMask">

        </div>

        <div class="tabContainer" id="mainTabContainer">

        <div class="tab" id="info">
            <div class="infoTooltip">
                <div>&larr;</div>
                <div>Click the Burger for More!</div>
            </div>
            <?php require('tabs/intro.inc.php'); ?>
        </div>

        <div class="tab" id="slideshow" style="display: none">
        </div>

        <div class="tab" id="characters" style="display: none">
        </div>

        <div class="tab" id="realms" style="display: none">
        </div>

        <div class="tab" id="chat" style="display: none">
        </div>

        <div class="tab" id="relationships" style="display: none">
        </div>

        <div class="tab" id="tierLists" style="display: none">
        </div>

        <div class="tab" id="flashCards" style="display: none">
        </div>

        <div class="tab" id="quizzes" style="display: none">
        </div>

        <div class="tab" id="games" style="display: none">
            <div class="buttonContainer">

                <div class="navigation gamesButtonAndLabel" data-tab="quizzes">
                    <div class="buttonQuizzes gamesButton"></div>
                    <div class="gamesButtonLabel">Quizzes</div>
                </div>


                <div class="navigation gamesButtonAndLabel" data-tab="flashCards">
                    <div class="buttonCards gamesButton"></div>
                    <div class="gamesButtonLabel">Flash Cards</div>
                </div>

                <div class="navigation gamesButtonAndLabel" data-tab="tierLists">
                    <div class="buttonTiers gamesButton"></div>
                    <div class="gamesButtonLabel">Tier Lists</div>
                </div>

                <div class="gamesButtonAndLabel">
                    <a href="https://games.elmakers.com/love" target="_blank">
                        <div class="buttonLove gamesButton"></div>
                        <div class="gamesButtonLabel">Love and Ciel Game (W.I.P.)</div>
                    </a>
                </div>

                <div class="gamesButtonAndLabel">
                    <a href="https://games.elmakers.com/corzaelia" target="_blank">
                        <div class="buttonCorzaelia gamesButton"></div>
                        <div class="gamesButtonLabel">Corzaelia Game (W.I.P.)</div>
                    </a>
                </div>
            </div>
        </div>

        <div class="tab" id="timeline" style="display: none">
        </div>

        <div class="tab" id="profile" style="display: none">

        </div>

        <div class="tab editor" id="characterEditor" style="display: none">

        </div>

        <div class="tab editor" id="timelineEditor" style="display: none">

        </div>

    </div>
    </div>

    <div id="loading">
        &nbsp;
    </div>
</body>
</html>
