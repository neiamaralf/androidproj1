<?php 
function resizeimage($orig, $dest_width=null, $dest_height=null){
  $orig_width = imagesx($orig);
  $orig_height = imagesy($orig);
  $vertical_offset = 0;
  $horizontal_offset = 0;
  if($dest_width == null){
   if($dest_height == null){die('$dest_width and $dest_height cant both be null!');}
   $dest_width = $dest_height * $orig_width / $orig_height;
  } 
  else{
   if($dest_height == null)$dest_height = $dest_width * $orig_height / $orig_width;
   else{// both dimensions are locked    
    $vertical_offset = $dest_height - ($orig_height * $dest_width) / $orig_width;
    $horizontal_offset = $dest_width - ($dest_height * $orig_width) / $orig_height;
    if($vertical_offset < 0) $vertical_offset = 0;
    if($horizontal_offset < 0) $horizontal_offset = 0;
   }
  }
  $img = imagecreatetruecolor($dest_width, $dest_height);
  imagesavealpha($img, true);
  imagealphablending($img, false);
  $transparent = imagecolorallocatealpha($img, 255, 255, 255, 127);
  imagefill($img, 0, 0, $transparent);
  imagecopyresampled($img,$orig,round($horizontal_offset/2),round($vertical_offset/2),0,0,round($dest_width-$horizontal_offset),round($dest_height-$vertical_offset),$orig_width,$orig_height);
  return $img;
}

function uploadimage($new_width,$new_height,$diretorio,$filename,$ext,$tmpfilename){
 $image=NULL;
 //$ext = $_FILES["foto1"]["type"];
 $imagefs=NULL;
 if($ext=="image/jpg"||$ext=="image/jpeg") $image = imagecreatefromjpeg($tmpfilename);
 else if ($ext=="image/gif") $image = imagecreatefromgif($tmpfilename);
 else if($ext=="image/png")$image = imagecreatefrompng($tmpfilename);
   
 $image_p=resizeimage($image,$new_width,$new_height);		 
				
 if($ext=="image/jpg"||$ext=="image/jpeg")imagejpeg($image_p,$diretorio.$filename);
 else if($ext=="image/gif")imagegif($image_p,$diretorio.$filename);
 else if($ext=="image/png")imagepng($image_p,$diretorio.$filename);
	  $ret=$image_p!=null;
 imagedestroy($image);
 imagedestroy($image_p);
 return $ret;
}

function getBytesFromHexString($hexdata)
{
  for($count = 0; $count < strlen($hexdata); $count+=2)
    $bytes[] = chr(hexdec(substr($hexdata, $count, 2)));

  return implode($bytes);
}

function getImageMimeType($imagedata)
{
  $imagemimetypes = array( 
    "jpeg" => "FFD8", 
    "png" => "89504E470D0A1A0A", 
    "gif" => "474946",
    "bmp" => "424D", 
    "tiff" => "4949",
    "tiff" => "4D4D"
  );

  foreach ($imagemimetypes as $mime => $hexbytes)
  {
    $bytes = getBytesFromHexString($hexbytes);
    if (substr($imagedata, 0, strlen($bytes)) == $bytes)
      return $mime;
  }

  return NULL;
}
?>