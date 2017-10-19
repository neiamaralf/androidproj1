<?php
header('Access-Control-Allow-Origin: *');
include 'resizeimg.php';
$tmpfname=$_FILES['file']['tmp_name'];
$tabela=$_REQUEST['tabela'];
$imgfnome=basename( $_FILES['file']['name']);
$idusuario=$_REQUEST['idusuario'];
$texto=$_REQUEST['texto'];
$id	= $_REQUEST['id'];  
$usrdir="imagens";
    
   
    if (!file_exists('./'.$usrdir))
     mkdir('./'.$usrdir, 0777, true);
    $tudook=false;
     $usrdir=$usrdir.'/'.$tabela;
     if (!file_exists('./'.$usrdir))
      mkdir('./'.$usrdir, 0777, true);
    if($tabela=="userimages"){    
     $usrdir=$usrdir.'/'.$idusuario;
     if (!file_exists('./'.$usrdir))
      mkdir('./'.$usrdir, 0777, true);
     $usrdir=$usrdir.'/' ;
     if (!file_exists('./'.$usrdir.'thumbs'))
      mkdir('./'.$usrdir.'thumbs', 0777, true);
     if (!file_exists('./'.$usrdir.'full'))
      mkdir('./'.$usrdir.'full', 0777, true);
      $tudook=uploadimage(180,120,'./'.$usrdir.'thumbs/',$imgfnome,"image/jpg",$tmpfname)&&uploadimage(700,525,'./'.$usrdir.'full/',$imgfnome,"image/jpg",$tmpfname);
    }
    else if($tabela=="produtos"||$tabela=="certificadoras"){    
     $usrdir=$usrdir.'/'.$id;
     if (!file_exists('./'.$usrdir))
      mkdir('./'.$usrdir, 0777, true);
     $usrdir=$usrdir.'/' ;    
     $tudook=uploadimage(180,120,'./'.$usrdir,$imgfnome,"image/jpg",$tmpfname);
    }      
    
    if($tudook){
        if(file_exists($tmpfname))
      unlink($tmpfname);
    $hn 		= 'localhost';
    $un 		= 'athen394';
    $pwd		= 'ldae08';
    $db 		= 'athen394_bioatest';
    $cs 		= 'utf8';
    $dsn 	= "mysql:host=" . $hn . ";port=3306;dbname=" . $db . ";charset=" . $cs;
    $opt 	= array(PDO::ATTR_ERRMODE=> PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,PDO::ATTR_EMULATE_PREPARES   => false,);
    $pdo 	= new PDO($dsn, $un, $pwd, $opt);    
    $sql 	="";
    if($tabela=="produtos"||$tabela=="certificadoras"){
     $sql 	= "UPDATE $tabela SET imagem='$usrdir.$imgfnome' WHERE id = $id";
    }
    else if($tabela=="userimages"){
     $sql = 'INSERT INTO userimages(idusuario,imagem,imagemfull,texto) VALUES ('.$idusuario.',"'.$usrdir.'thumbs/'.$imgfnome.'","'.$usrdir.'full/'.$imgfnome.'","'.$texto.'")';
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
    echo "Ocorreu um erro ao subir a imagem, por favor tente novamente!";
}
?>