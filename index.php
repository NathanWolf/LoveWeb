<?php
$characters = array(
    'love', 'ciel','thirteen', 'celeste',  'michael', 'angelica',
    'astella', 'vortex', 'cynth', 'cymbeline', 'ezra', 'aura',
    'neptune', 'clara', 'ace', 'beau', 'harper', 'kai',
);
$extras = array('jasmine', 'jamie', 'victoria', 'idris');
?>
<html lang="en-us">
<head>
    <title>Love</title>
    <link rel="stylesheet" href="css/love.css">
    <script type="text/javascript" src="js/love.js"></script>
    <script type="text/javascript">
        window.onload = function() {
            new Love();
        };
    </script>
</head>
<body>
    <div class="portraits">
        <?php
        foreach ($characters as $character) {
            $image = "$character.jpg";
            echo "<div class=\"portrait\" style=\"background-image: url(image/portraits/$image)\">&nbsp;</div>\n";
            echo "<div class=\"portraitName\" data-character=\"$character\">$character</div>\n";
        }
        ?>
    </div>
    <div class="popup" id="characterSheetPopup" style="display: none">
        <div class="popupContent">
            <div id="characterSheet">
                &nbsp;
            </div>
        </div>
    </div>
</body>
</html>