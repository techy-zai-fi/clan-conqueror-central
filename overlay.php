<?php
// overlay.php: Simple overlay page for clan-conqueror-central
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Clan Conqueror Central Overlay</title>
	<style>
		html, body {
			height: 100%;
			margin: 0;
			padding: 0;
			overflow: hidden;
		}
		iframe {
			border: none;
			width: 100vw;
			height: 100vh;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 9999;
		}
	</style>
</head>
<body>
	<iframe src="https://clan-conqueror-central.vercel.app/" allowfullscreen></iframe>
</body>
</html>