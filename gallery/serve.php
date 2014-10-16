<?php
/**
 * This script serves a JSON object containing a 1-level deep
 * search of this script's directory. It will return all .jpg
 * images found, along with creating (if not created), a medium and small
 * cached copy of these images. It will return the cache postfixes along with
 * the original paths.
 */
header('Content-Type: application/json');

define('IMAGE_QUALITY', 100);
define('IMAGE_FILE_TYPE', '.jpg');

// Medium Cache information
define('IMAGE_MEDIUM_EXTENSION', 'cache_med');
define('IMAGE_MEDIUM_PERCENT', 0.50);
define('IMAGE_MEDIUM_POSTFIX', '_' . IMAGE_MEDIUM_EXTENSION . IMAGE_FILE_TYPE);

// Small Cache information
define('IMAGE_SMALL_EXTENSION', 'cache_sm');
define('IMAGE_SMALL_PERCENT', 0.15);
define('IMAGE_SMALL_POSTFIX', '_' . IMAGE_SMALL_EXTENSION . IMAGE_FILE_TYPE);

/**
 * Caches a given jpg file creating medium and small cached copies
 */
function cacheResized($fileName, $cacheExtension, $percent) {
	// Get new dimensions
	list($width, $height) = getimagesize($fileName);
	$newWidth = $width * $percent;
	$newHeight = $height * $percent;

	// Resample
	$generated = imagecreatetruecolor($newWidth, $newHeight);
	$image = imagecreatefromjpeg($fileName);
	imagecopyresampled($generated, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
	imagejpeg(
		$generated, $fileName . '_' . $cacheExtension . IMAGE_FILE_TYPE,
		IMAGE_QUALITY);
}

/**
 * Determines if a file name is a cached copy
 */
function isCache($fileName) {
	return substr($fileName, -strlen(IMAGE_MEDIUM_POSTFIX)) === IMAGE_MEDIUM_POSTFIX ||
	       substr($fileName, -strlen(IMAGE_SMALL_POSTFIX)) === IMAGE_SMALL_POSTFIX;
}

// Loop through each sibling directory.
$resultListing = array();
$directories = array_filter(glob('*'), 'is_dir');
foreach ($directories as $directory) {
	// Loop through each JPG image in this sibling directory
	$images = glob($directory . '/*' . IMAGE_FILE_TYPE);
	foreach ($images as $image) {
		if (!isCache($image)) {
			// Test for the existence of a cached copy of the images
			// If it is not cached, refresh it.
			
			// Medium
			if (!file_exists($image . IMAGE_MEDIUM_POSTFIX)) {
				cacheResized($image, IMAGE_MEDIUM_EXTENSION, IMAGE_MEDIUM_PERCENT);
			}

			// Small
			if (!file_exists($image . IMAGE_SMALL_POSTFIX)) {
				cacheResized($image, IMAGE_SMALL_EXTENSION, IMAGE_SMALL_PERCENT);
			}

			// Append the results to the final JSON object
			// Using the directory name as a category
			$resultListing[] = array(
				'path' => $image,
				'category' => $directory);
		}
	}
}

// Respond to the request with a JSON object containing:
// 1. All the image paths
// 2. The cache postfixes used
$data = array(
	'photos' => $resultListing, 
	'cache' => array(
		'medium' => IMAGE_MEDIUM_POSTFIX,
		'small' => IMAGE_SMALL_POSTFIX));
echo json_encode($data, JSON_UNESCAPED_SLASHES);