<?php
 header('Access-Control-Allow-Origin: *');
  include 'resizeimg.php';
 $hn='localhost';
 $un='athen394';
 $pwd='ldae08';
 $db='athen394_bioatest';
 $cs='utf8';
 $dsn="mysql:host=".$hn.";port=3306;dbname=".$db.";charset=".$cs;
 $opt=array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_OBJ,PDO::ATTR_EMULATE_PREPARES=>false,);
 $pdo=new PDO($dsn,$un,$pwd,$opt);
 $key=strip_tags($_REQUEST['key']);
 $data=array();
 switch($key){
 case 'deleteimg':
  $tabela=$_REQUEST['tabela'];
  $path='imagens/'.$_REQUEST['imagem'];
  if(file_exists($path))
   unlink($path);
  $idprod=filter_var($_REQUEST['prodid'],FILTER_SANITIZE_NUMBER_INT);
  if($tabela=="produtos"||$tabela=="certificadoras")
   $sql="UPDATE $tabela SET imagem=NULL WHERE id = $idprod";
  else if($tabela=="userimages")
   $sql="DELETE FROM userimages WHERE id = $idprod";
  try {
   $qr=$pdo->query($sql);
   if($qr&&$qr->rowCount()>0){
    echo json_encode(array('delete'=>'ok'));
   }
   else
    echo json_encode(array('delete'=>'erro'));
  }
  catch(PDOException $e){
   echo json_encode(array('delete'=>'erro','msg'=>$e->getMessage()));

  }
  break;
 case "salvaimagem":
  $tabela=$_REQUEST['tabela'];
  $imgfnome=$_REQUEST['fnome'];
  $idusuario=$_REQUEST['idusuario'];
  $texto=$_REQUEST['texto'];
  $id=$_REQUEST['id'];
  $usrdir="imagens";

  $data=base64_decode($_REQUEST['imgdata']);
  $mime_type =getImageMimeType($data);
  if ($mime_type=="jpeg"){
    $imgfnome=$imgfnome.'jpg'; $ext="image/jpg";
  }
  else if ($mime_type=="png"){
     $imgfnome=$imgfnome.'png'; $ext="image/png";
  }
  
  $myfile=fopen($imgfnome,"wb") or die("Erro ao abrir arquivo!"); 
  fwrite($myfile,$data);
  fclose($myfile);

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
      $tudook=uploadimage(180,120,'./'.$usrdir.'thumbs/',$imgfnome,"image/jpg",$imgfnome)&&uploadimage(700,525,'./'.$usrdir.'full/',$imgfnome,"image/jpg",$imgfnome);
    }
    else if($tabela=="produtos"||$tabela=="certificadoras"){    
     $usrdir=$usrdir.'/'.$id;
     if (!file_exists('./'.$usrdir))
      mkdir('./'.$usrdir, 0777, true);
     $usrdir=$usrdir.'/' ;    
     $tudook=uploadimage(180,120,'./'.$usrdir,$imgfnome,"image/jpg",$imgfnome);
    }      
 

   if($tudook){
     if(file_exists($imgfnome))
      unlink($imgfnome);
  $tabela=$_REQUEST['tabela'];
  try {
   if($tabela=="produtos"||$tabela=="certificadoras")
    $sql="UPDATE $tabela SET imagem='$usrdir.$imgfnome' WHERE id = $id";
   else if($tabela=="userimages")
    $sql = 'INSERT INTO userimages(idusuario,imagem,imagemfull,texto) VALUES ('.$idusuario.',"'.$usrdir.'thumbs/'.$imgfnome.'","'.$usrdir.'full/'.$imgfnome.'","'.$texto.'")';
   $qr=$pdo->query($sql);
   if($qr&&$qr->rowCount()>0){
    echo json_encode(array('insert'=>"ok"));
   }
   else
    echo json_encode(array('insert'=>'erro desconhecido'));
  }
  catch(PDOException $e){
   echo json_encode(array('insert'=>$e->getCode(),'msg'=>$e->getMessage()));
  }
   }
  break;
 case "buscacep":
  $cep=$_REQUEST['cep'];
  $sql="SELECT e.cep,e.uf,e.logracompl,c.nome AS cidade,b.nome AS bairro FROM enderecos AS e,cidades AS c,bairros AS b WHERE c.id=e.cidade_id AND e.bairro_id=b.id AND e.cep='".$cep."'";
  $stmt=$pdo->query($sql);
  if($row=$stmt->fetch(PDO::FETCH_OBJ)){
   echo '[{"cepok":"true","estado":"'.utf8_encode($row->uf).'","endereco":"'.utf8_encode($row->logracompl).'","cidade":"'.utf8_encode($row->cidade).'","bairro":"'.utf8_encode($row->bairro).'"}]';
  }
  else{
   echo '[{"cepok":"false","estado":"","endereco":"","cidade":"","bairro":""}]';
  }
  break;
 case "asserttoken":
  $token=$_REQUEST['token'];
  $userid=$_REQUEST['userid'];
  $stmt=$pdo->query("SELECT t.token,u.nome,u.email FROM tokens AS t,usuarios AS u WHERE t.token='$token' AND t.userid=$userid AND u.id=$userid");
  if($row=$stmt->fetch(PDO::FETCH_OBJ)){
   echo '[{"goodtoken":"true","nome":"'.$row->nome.'","email":"'.$row->email.'"}]';
  }
  else{
   echo '[{"goodtoken":"false","nome":"","email":""}]';
  }
  break;
 case "logout":
  $token=$_REQUEST['token'];
  $userid=$_REQUEST['userid'];
  $stmt=$pdo->query("DELETE FROM tokens WHERE token='$token' AND userid=$userid");
  if($stmt){
   echo '[{"logout":"ok"}]';
  }
  else{
   echo '[{"logout":"fail"}]';
  }
  break;
 case "insertum":
  $valor=filter_var($_REQUEST['valor'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $tabela=$_REQUEST['tabela'];
  try {
   $sql="INSERT INTO  $tabela(nome) VALUES('$valor')";
   $qr=$pdo->query($sql);
   if($qr&&$qr->rowCount()>0){
    echo json_encode(array('update'=>"ok"));
   }
   else
    echo json_encode(array('update'=>'erro desconhecido'));
  }
  catch(PDOException $e){
   echo json_encode(array('update'=>$e->getCode(),'msg'=>$e->getMessage()));
  }

  break;
 case 'novacurtida':
  $idusuario=$_REQUEST['idusuario'];
  $idusralvo=$_REQUEST['idusralvo'];
  $idusuario=$idusuario|($idusralvo<<32);
  $sql="INSERT INTO curtidas(idusuario,idusralvo) VALUES ($idusuario,$idusralvo)";
  try {
   $qr=$pdo->query($sql);
   if($qr){    
    echo json_encode(array('result'=>"ok"));
   }
   else
    echo json_encode(array('result'=>'null'));
  }
  catch(PDOException $e){
   echo json_encode(array('result'=>$e->getCode(),'msg'=>$e->getMessage()));
  }
  break;

 case 'apagacurtida':
  $idusuario=$_REQUEST['idusuario'];
  $idusralvo=$_REQUEST['idusralvo'];
  $idusuario=$idusuario|($idusralvo<<32);
  $sql="DELETE FROM curtidas WHERE idusuario=$idusuario AND idusralvo=$idusralvo";
  try {
   $qr=$pdo->query($sql);
   if($qr){    
    echo json_encode(array('result'=>"ok"));
   }
   else
    echo json_encode(array('result'=>'null'));
  }
  catch(PDOException $e){
   echo json_encode(array('result'=>$e->getCode(),'msg'=>$e->getMessage()));
  }
  break;
 case 'insprodlist':
  $idusuario=$_REQUEST['idusuario'];
  $prodlist=json_decode($_REQUEST['json'],true);
  $values="";
  foreach($prodlist as $prod){
   $values=$values.'('.$idusuario.','.$prod['idproduto'].','.floatval(str_replace(',','.',$prod['preco'])).',"'.$prod['descricao'].'"'.'),';
  }
  $values=rtrim($values,',');
  $sql="INSERT INTO listaprodutos(idusuario,idproduto,preco,nomeprod) VALUES $values";
  $qr=$pdo->query($sql);
  if($qr){
   echo json_encode(array('insert'=>"ok"));
  }
  else
   echo json_encode(array('insert'=>'erro desconhecido'));
  break;
 case 'insparceirolist':
  $idusuario=$_REQUEST['idusuario'];
  $parceiroslist=json_decode($_REQUEST['json'],true);
  $values="";
  foreach($parceiroslist as $parceiro){
   $values=$values.'('.$idusuario.','.$parceiro['idparceiro'].'),';
  }
  $values=rtrim($values,',');
  $sql="INSERT INTO parceiros(idusuario,idparceiro) VALUES $values";
  $qr=$pdo->query($sql);
  if($qr){
   echo json_encode(array('insert'=>"ok"));
  }
  else
   echo json_encode(array('insert'=>'erro desconhecido'));
  break;
case 'insusrcertlist':
  $idusuario=$_REQUEST['idusuario'];
  $certlist=json_decode($_REQUEST['json'],true);
  $values="";
  foreach($certlist as $cert){
   $values=$values.'('.$idusuario.','.$cert['idcert'].'),';
  }
  $values=rtrim($values,',');
  $sql="INSERT INTO certusr(idusuario,idcert) VALUES $values";
  $qr=$pdo->query($sql);
  if($qr){
   echo json_encode(array('insert'=>"ok"));
  }
  else
   echo json_encode(array('insert'=>'erro desconhecido'));
  break;
 case "create":
  $name=filter_var($_REQUEST['name'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $password=filter_var($_REQUEST['password'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $email=filter_var($_REQUEST['email'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $endereco=filter_var($_REQUEST['endereco'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $estado=filter_var($_REQUEST['estado'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $cidade=filter_var($_REQUEST['cidade'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $bairro=filter_var($_REQUEST['bairro'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $numero=filter_var($_REQUEST['numero'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $complemento=filter_var($_REQUEST['complemento'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $fone=filter_var($_REQUEST['fone'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $cep=filter_var($_REQUEST['cep'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $tipo=filter_var($_REQUEST['tipo'],FILTER_SANITIZE_NUMBER_INT);
  $site=filter_var($_REQUEST['site'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $idmarca=filter_var($_REQUEST['idmarca'],FILTER_SANITIZE_NUMBER_INT);
  $idcategoria=filter_var($_REQUEST['idcategoria'],FILTER_SANITIZE_NUMBER_INT);
  $tabela=$_REQUEST['tabela'];
  if($tabela=="usuarios")
   $update="INSERT INTO $tabela(nome,senha,email,endereco,estado,cidade,bairro,numero,complemento,fone,cep,tipo) VALUES('$name','$password','$email','$endereco','$estado','$cidade','$bairro','$numero','$complemento','$fone','$cep',$tipo)";
  else if($tabela=="certificadoras")
   $update="INSERT INTO $tabela(nome,senha,email,endereco,estado,cidade,bairro,numero,site,complemento,fone,cep,tipo) VALUES('$name','$password','$email','$endereco','$estado','$cidade','$bairro','$numero','$site','$complemento','$fone','$cep',$tipo)";
  else if($tabela=="produtos")
   $update="INSERT INTO $tabela(nome,idmarca,idcategoria) VALUES('$name',$idmarca,$idcategoria)";
  try {
   $qr=$pdo->query($update);
   if($qr){
    if($tabela!="produtos"){
     $stmt=$pdo->query("SELECT * FROM $tabela WHERE email='$email' ");
     if($row=$stmt->fetch(PDO::FETCH_OBJ)){
      echo json_encode(array(
                        'insert'=>'ok',
                        'recordid'=>$row->id,
                        'nome'=>$row->nome,
                        'email'=>$row->email
                        ));
     }
    }
    else{
     echo json_encode(array(
                       'insert'=>'ok'
                       ));
    }
   }
   else
    echo json_encode(array('insert'=>'erro desconhecido','recordid'=>'',
                           'nome'=>'',
                           'email'=>''));
  }
  catch(PDOException $e){
   echo json_encode(array('insert'=>$e->getCode(),'recordid'=>$e->getMessage(),
                          'nome'=>'',
                          'email'=>''));
  }
  break;
 case "updateum":
  $campo=filter_var($_REQUEST['campo'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $valor=filter_var($_REQUEST['valor'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $recordid=filter_var($_REQUEST['recordid'],FILTER_SANITIZE_NUMBER_INT);
  $tabela=$_REQUEST['tabela'];
  try {
   $sql="UPDATE $tabela SET $campo='$valor' WHERE id = $recordid";
   $qr=$pdo->query($sql);
   if($qr&&$qr->rowCount()>0){
    echo json_encode(array('update'=>"ok"));
   }
   else
    echo json_encode(array('update'=>'erro desconhecido'));
  }
  catch(PDOException $e){
   echo json_encode(array('update'=>$e->getCode(),'msg'=>$e->getMessage()));
  }

  break;
 case 'updateinfousuario':
  $userid=filter_var($_REQUEST['userid'],FILTER_SANITIZE_NUMBER_INT);
  $campo=$_REQUEST['campo'];
  $texto=$_REQUEST['texto'];
  $sql="SELECT * FROM infousuario WHERE idusuario=$userid";
  $stmt=$pdo->query($sql);
  if($stmt->rowCount()==0){
   $sql="INSERT INTO infousuario(idusuario,$campo) VALUES($userid,'$texto')";
   $stmt=$pdo->query($sql);
   if($stmt)
    echo json_encode(array('update'=>"ok"));
   else
    echo json_encode(array('update'=>"erro"));
  }
  else{
   if($row=$stmt->fetch(PDO::FETCH_OBJ)){
    $sql="UPDATE infousuario SET $campo='$texto' WHERE id = $row->id ";
    $stmt=$pdo->query($sql);
    if($stmt)
     echo json_encode(array('update'=>"ok"));
    else
     echo json_encode(array('update'=>"erro"));
   }
  }
  break;
 case "update":
  $name=filter_var($_REQUEST['name'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $password=filter_var($_REQUEST['password'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $email=filter_var($_REQUEST['email'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $recordID=filter_var($_REQUEST['recordID'],FILTER_SANITIZE_NUMBER_INT);
  $endereco=filter_var($_REQUEST['endereco'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $estado=filter_var($_REQUEST['estado'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $cidade=filter_var($_REQUEST['cidade'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $bairro=filter_var($_REQUEST['bairro'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $numero=filter_var($_REQUEST['numero'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $complemento=filter_var($_REQUEST['complemento'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $fone=filter_var($_REQUEST['fone'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $cep=filter_var($_REQUEST['cep'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $tipo=filter_var($_REQUEST['tipo'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $site=filter_var($_REQUEST['site'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $idmarca=filter_var($_REQUEST['idmarca'],FILTER_SANITIZE_NUMBER_INT);
  $idcategoria=filter_var($_REQUEST['idcategoria'],FILTER_SANITIZE_NUMBER_INT);
  $tabela=$_REQUEST['tabela'];
  try {
   if($tabela=="usuarios")
    $sql="UPDATE $tabela SET nome='$name',email='$email',senha='$password',endereco='$endereco',estado='$estado',cidade='$cidade',bairro='$bairro',numero='$numero',complemento='$complemento',fone='$fone',cep='$cep' ,tipo=$tipo WHERE id = $recordID";
   else if($tabela=="produtos"){

    $sql="UPDATE $tabela SET nome='$name',idmarca=$idmarca,idcategoria=$idcategoria WHERE id = $recordID";
   }
   else
    $sql="UPDATE $tabela SET nome='$name',email='$email',site='$site',endereco='$endereco',estado='$estado',cidade='$cidade',bairro='$bairro',numero='$numero',complemento='$complemento',fone='$fone',cep='$cep' WHERE id = $recordID";
   $qr=$pdo->query($sql);
   if($qr&&$qr->rowCount()>0){
    if($tabela=="usuarios"){
     $st="SELECT u.id,u.nome,u.email,u.admin,u.senha, t.token,u.endereco,u.estado,u.cidade,u.bairro,u.numero,u.complemento,u.fone,u.cep,u.tipo FROM usuarios AS u, tokens AS t WHERE u.id=$recordID AND t.userid='$recordID' LIMIT 1";
     $query=$pdo->query($st);
     if($row=$query->fetch(PDO::FETCH_OBJ)){
      $row->admin="null";
      $row->token="null";
      $row->id="null";
      $data[]=$row;
      echo json_encode($data);
     }
     else echo json_encode(array('update'=>'erro desconhecido'));
    }
    else if($tabela=="produtos"){
     $st="SELECT c.nome AS categoria,m.nome AS marca FROM categorias AS c, marcas AS m,produtos AS p WHERE p.idcategoria=c.id AND p.idmarca=m.id AND p.id = $recordID LIMIT 1";
     $query=$pdo->query($st);
     if($row=$query->fetch(PDO::FETCH_OBJ)){
      echo json_encode(array('update'=>'ok','categoria'=>$row->categoria,'marca'=>$row->marca));
     }
     else echo json_encode(array('update'=>'erro desconhecido'));
    }
    else echo json_encode(array('update'=>"ok"));
   }
   else
    echo json_encode(array('update'=>'erro desconhecido'));
  }
  catch(PDOException $e){
   echo json_encode(array('update'=>$e->getCode(),'msg'=>$e->getMessage()));
  }

  break;
 case "login":
  $email=filter_var($_REQUEST['email'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $password=filter_var($_REQUEST['password'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  $device=filter_var($_REQUEST['device'],FILTER_SANITIZE_STRING,FILTER_FLAG_ENCODE_LOW);
  if($password!=""&&$email!=""){
   try {
    $stmt=$pdo->query("SELECT id FROM usuarios WHERE email='$email' AND senha='$password'");
    if($row=$stmt->fetch(PDO::FETCH_OBJ)){
     include 'tokengenerate.php';
     $token=generateRandomString();
     $update="INSERT INTO tokens(token,device, userid) VALUES('$token','$device', $row->id)";
     $qr=$pdo->query($update);
     if($qr){
      $st="SELECT u.id,u.nome,u.email,u.admin,u.senha, t.token,u.endereco,u.estado,u.cidade,u.bairro,u.numero,u.complemento,u.fone,u.cep,u.tipo FROM usuarios AS u, tokens AS t WHERE u.id=$row->id AND t.token='$token'";
      $query=$pdo->query($st);
      if($row=$query->fetch(PDO::FETCH_OBJ)){
       $data[]=$row;
       echo json_encode($data);
      }
      else echo '[{"id":"","nome":"","token":"","email":"","admin":0,"senha":""}]';
     }
     else echo '[{"id":"","nome":"","token":"","email":"","admin":0,"senha":""}]';
    }
    else echo '[{"id":"","nome":"Email ou senha errados!","token":"","email":"","admin":0,"senha":""}]';

   }
   catch(PDOException $e){
    echo '[{"id":"","nome":"'.$e->getMessage().'","token":"","email":"","admin":0,"senha":""}]';;
   }
  }
  else echo '[{"id":"","nome":"senha e/ou email inválidos","token":"","email":"","admin":0,"senha":""}]';
  break;
 case "delete":
  $recordID=filter_var($_REQUEST['recordID'],FILTER_SANITIZE_NUMBER_INT);
  $tabela=$_REQUEST['tabela'];
  try {
   $sql="DELETE FROM tokens WHERE userid = $recordID";
   $qr=$tabela=="usuarios"?$pdo->query($sql) : true;
   if($qr){
    $sql="DELETE FROM $tabela WHERE id = $recordID";
    $qr=$pdo->query($sql);
    if($qr&&$qr->rowCount()>0){
     echo json_encode(array('delete'=>'ok'));
    }
    else
     echo json_encode(array('delete'=>'erro desconhecido'));
   }
   else
    echo json_encode(array('delete'=>'erro desconhecido'));
  }
  catch(PDOException $e){
   echo json_encode(array('delete'=>$e->getCode()));
  }

  break;
 }

 ?>