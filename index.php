<?php
    require_once('data/version.inc.php');
?>
<html lang="en-us">
<head>
    <title>Diviinity</title>
    <meta name="viewport" content="width=device-width,initial-scale=0.5,maximum-scale=0.5,user-scalable=no"/>
    <link rel="stylesheet" href="css/love.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/popup.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/characters.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/chat.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/quizzes.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/flashcards.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/tiers.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/relationships.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/timeline.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/profile.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/editor.css?v=<?=VERSION?>">
    <link rel="stylesheet" href="css/info.css?v=<?=VERSION?>">
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
    <script type="text/javascript" src="js/love.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/character_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/timeline_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/relationship_editor.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/home.js?v=<?=VERSION?>"></script>
    <script type="text/javascript" src="js/info.js?v=<?=VERSION?>"></script>
    <script type="text/javascript">
        // For debugging
        var _love;
        window.onload = function() {
            let love = new Love();
            love.register();
            love.load();
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

    <div class="tabContainer" id="mainContainer">
        <div class="toolbar">
            <div class="tabButton active toolbarButton" data-tab="home">&#8962;</div>
            <div class="tabButtons">
                <div class="tabButton toolbarButton" data-tab="info">Info</div>
                <div class="tabButton toolbarButton" data-tab="characters">Characters</div>
                <div class="tabButton toolbarButton" data-tab="chat">Chat</div>
                <div class="tabButton toolbarButton" data-tab="quizzes">Quizzes</div>
                <div class="tabButton toolbarButton" data-tab="flashCards">Flash Cards</div>
                <div class="tabButton toolbarButton" data-tab="relationships">Relationships</div>
                <div class="tabButton toolbarButton" data-tab="timeline">Timeline</div>
                <div class="tabButton toolbarButton" data-tab="tierLists">Tier Lists</div>
                <div class="tabButton toolbarButton admin" data-tab="characterEditor" style="display: none">Character Editor</div>
                <div class="tabButton toolbarButton admin" data-tab="timelineEditor" style="display: none">Timeline Editor</div>
            </div>
            <div id="profileButton" class="tabButton toolbarButton loggedout" data-tab="profile"></div>
        </div>

        <div class="tab" id="home">
            <div class="infoButton">
                <div class="tile navigation" data-tab="info" title="My Information!"></div>
            </div>
            <div class="buttonContainer">
                <div class="tile navigation" data-tab="characters"><div>Characters</div></div>
                <div class="tile navigation" data-tab="chat"><div>Chat</div></div>
                <div class="tile navigation" data-tab="quizzes"><div>Quizzes</div></div>
                <div class="tile navigation" data-tab="flashCards"><div>Flash Cards</div></div>
                <div class="tile navigation" data-tab="relationships"><div>Relationships</div></div>
                <div class="tile navigation" data-tab="timeline"><div>Timeline</div></div>
                <div class="tile navigation" data-tab="tierLists"><div>Tier Lists</div></div>
                <div class="tile navigation admin" data-tab="characterEditor" style="display: none"><div>Character Editor</div></div>
                <div class="tile navigation admin" data-tab="timelineEditor" style="display: none"><div>Timeline Editor</div></div>
                <div class="tile"><a href="https://games.elmakers.com/love" target="_blank"><div>Play Game &#128279;</a></div></div>
            </div>
        </div>

        <div class="tab" id="info" style="display: none">
            <div class="horizontal">
                <div>
                    Hello, I’m Cupcakeebug, or Bug for short! I’m an artist,
                    I digitally draw and animate in my free time, and I do writing as well.
                    <br/>
                    I’ve been working on Diviinity since August 3rd, 2023.
                    <br/>
                    I use Krita for my drawing, and Flipaclip for my animation.
                    I use Google docs and Pages for my writing!
                </div>
            </div>
            <div class="horizontal">
                <div>
                Diviinity is the book I’m writing! This is the official website, about its plot and its characters. Thank you for checking it out!
                </div>
                <div>
                Diviinity is about the Overlord of the four realms, Thirteen Diviine, the most powerful being ever. Thirteen was imprisoned in the clouds for eternity, on an accusation she destroyed the Shadowrealms. Thirteen’s daughter, the Goddess of Death, Celeste Diviine, goes on a mission to free her mother.
                </div>
                <div>
                Each chapter is a different perspective from a characters point of view, starting off with Cymbeline, the Queen of the Shadowrealms. Each character has their own story in their chapters, whether that be them learning a lesson, making up with a family member or friend, or just goofing off. The chapters may not make sense at first, like a book of short stories, but it all comes together in the end.
                </div>
            </div>
            <div class="horizontal contact">
                <div>
                    <a href="https://www.instagram.com/cupcakeebug?igsh=ajNyMWdpNjZsZWk1&utm_source=qr" target="_blank" class="contact">
                    <span class="icon" style="background-image: url('image/logos/instagram.png')"></span>@cupcakeebug
                    </a>
                </div>
                <div>
                    <a href="https://youtube.com/@cupcakeebug?feature=shared" target="_blank" class="contact">
                    <span class="icon" style="background-image: url('image/logos/youtube.png')"></span>@cupcakeebug
                    </a>
                </div>
                <div>
                    <a href="https://cara.app/cupcakeebug" target="_blank" class="contact">
                        <span class="icon" style="background-image: url('image/logos/cara.png')"></span>@cupcakeebug
                    </a>
                </div>
                <div>
                    <a href="https://discordapp.com/users/691020896588136529" target="_blank" class="contact">
                        <span class="icon" style="background-image: url('image/logos/discord.png')"></span>@cupcakeebug
                    </a>
                </div>
                <div>
                    <a href="mailto:cupcakeebug@gmail.com" target="_blank" class="contact">
                        <span class="icon" style="background-image: url('image/logos/email.png')"></span>cupcakeebug@gmail.com
                    </a>
                </div>
            </div>
            <div class="horizontal large">
                <div>
                    <a href="https://docs.google.com/presentation/d/1jsL8S7O4h97xAPOIn6EuA04muXjWPZw66I7bLUQlNTc" target="_blank" class="contact slideshow">
                        <span class="icon large" style="background-image: url('image/logos/slideshow.png')"></span>
                    </a>
                </div>
                <div>
                    <a href="https://games.elmakers.com/love" target="_blank" class="game">
                        <span class="icon large game">Play Game</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="tab" id="characters" style="display: none">
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

        <div class="tab" id="timeline" style="display: none">
        </div>

        <div class="tab" id="profile" style="display: none">

        </div>

        <div class="tab editor" id="characterEditor" style="display: none">

        </div>

        <div class="tab editor" id="timelineEditor" style="display: none">

        </div>
    </div>

    <div id="loading">
        &nbsp;
    </div>
</body>
</html>
