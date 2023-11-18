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
    <div class="portraits" id="portraitList">
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
