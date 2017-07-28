<?php
header('Access-Control-Allow-Origin: *');
$target_path = "imagens/";
 $basename=basename( $_FILES['file']['name']);
$target_path = $target_path .$basename ;

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
 else if($ext=="image/png") $image = imagecreatefrompng($tmpfilename);
   
 $image_p=resizeimage($image,$new_width,$new_height);		
				
 if($ext=="image/jpg"||$ext=="image/jpeg")imagejpeg($image_p,$diretorio.$filename);
 else if($ext=="image/gif")imagegif($image_p,$diretorio.$filename);
 else if($ext=="image/png")imagepng($image_p,$diretorio.$filename);
	  
 imagedestroy($image);
 imagedestroy($image_p);
}
 
if (move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
    $hn 		= 'localhost';
    $un 		= 'athen394';
    $pwd		= 'ldae08';
    $db 		= 'athen394_bioatest';
    $cs 		= 'utf8';
    $dsn 	= "mysql:host=" . $hn . ";port=3306;dbname=" . $db . ";charset=" . $cs;
    $opt 	= array(PDO::ATTR_ERRMODE=> PDO::ERRMODE_EXCEPTION,
                  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                  PDO::ATTR_EMULATE_PREPARES   => false,
                 );
    $pdo 	= new PDO($dsn, $un, $pwd, $opt);
    $idprod	= filter_var($_REQUEST['idprod'], FILTER_SANITIZE_NUMBER_INT);
    $tabela=$_REQUEST['tabela'];
    $idusuario=$_REQUEST['idusuario'];
    $texto=$_REQUEST['texto'];
    $sql 	="";
    if($tabela=="produtos"||$tabela=="certificadoras"){
    $sql 	= "UPDATE $tabela SET imagem='$basename' WHERE id = $idprod";
    }
    else if($tabela=="userimages"){
     $sql = "INSERT INTO userimages(idusuario,imagem,texto) VALUES ($idusuario,'$basename','$texto')";
    }
    try {
     $qr = $pdo->query($sql);
     if($qr&&$qr->rowCount()>0){ 
      echo "Sucesso no envio e atualização do banco de dados";
     }
     else
      echo "Erro na atualização do banco de dados";
    }
    catch(PDOException $e){
      echo $e->getMessage();
    }
    
} else {
echo $target_path;
    echo "There was an error uploading the file, please try again!";
}
?>