<?php

function formatBytes($bytes, $precision = 2) { 
    $units = array('B', 'KB', 'MB', 'GB', 'TB'); 

    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 

    // Uncomment one of the following alternatives
    $bytes /= pow(1024, $pow);
    // $bytes /= (1 << (10 * $pow)); 

    return round($bytes, $precision) . ' ' . $units[$pow]; 
} 

$it = new RecursiveDirectoryIterator('.');
$res = array();

echo '<table>';

function printPreview($file, $origSize = 0)
{
	echo '<td><div style="color: ' . ($origSize ? 'green' : 'red') . ';">' . formatBytes(filesize($file)) . '</div>' .
		 '<img src="' . $file . '"></td>';
}

foreach(new RecursiveIteratorIterator($it) as $file)
{
    $parts = explode('.', $file);
    $ext = strtolower(array_pop($parts));
	$file = ((string)$file);

	if (strpos($file, 'temp-preview'))
	{
		continue;
	}

	if ('svg' != $ext)
	{
		continue;
	}

	echo '<tr><td colspan="2"><h3>' . $file . '</h3></td></tr>';
	
	echo '<tr>';
	
	printPreview('./temp-preview/' . $file);
	printPreview($file, filesize('./temp-preview/' . $file));

	echo '</tr>';
}

echo '</table>';

ksort($res);

$parts = [];

foreach ($res as $key => $code)
{
	$len = strlen($code);

	$ns = $argv[1] . count($parts) . '_';
	for ($k = 0; $k <= 99; $k++)
	{
		$code = str_replace('.st' . $k . '{', '.st' . $ns . $k . '{', $code);
		$code = str_replace('class="st' . $k . '"', 'class="st' . $ns . $k . '"', $code);
	}
	 
	$code = str_replace('id="', 'id="' . $ns, $code);
	$code = str_replace('xlink:href="#', 'xlink:href="#' . $ns, $code);
	$code = str_replace('filter="url(#', 'filter="url(#' . $ns, $code);
	
	$parts[] = '<div><h3>' . substr($key, 2) . ' - <span style="color: red;">' . formatBytes($len) . '</span></h3></div>' .
			   '<div class="img">' . $code . '</div>';
}

