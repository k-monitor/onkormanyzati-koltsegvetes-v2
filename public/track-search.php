<?php

$data = $_GET;
if (!isset($data['t']) || !isset($data['r'])) die();

$term = $data['t'];
$results = $data['r'];

$f = "search.log";

file_put_contents($f, "1\t$term\t$results\n", FILE_APPEND);

$log = file_get_contents($f);
$dict = [];
$lines = explode("\n", $log);
foreach ($lines as $line) {
	$cells = explode("\t", $line);
	if (count($cells) >= 3) {
		$c = is_numeric($cells[0]) ? intval($cells[0]) : 1;
		$t = $cells[1];
		$r = $cells[2];
		$key = "$t\t$r";
		$c += isset($dict[$key]) ? $dict[$key] : 0;
		$dict[$key] = $c;
	}
}

$log = '';
foreach($dict as $key => $count) $log .= "$count\t$key\n";
file_put_contents($f, $log, LOCK_EX);

?>