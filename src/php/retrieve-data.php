<?php
   header('Access-Control-Allow-Origin: *');
   $hn 		= 'localhost';
   $un 		= 'athen394';
   $pwd		= 'ldae08';
   $db 		= 'athen394_bioatest';
   $cs 		= 'utf8';
   
   $dsn 	= "mysql:host=" . $hn . ";port=3306;dbname=" . $db . ";charset=" . $cs;
   $opt 	= array(
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                        PDO::ATTR_EMULATE_PREPARES   => false,
                       );
   $key 	= strip_tags($_REQUEST['key']);
   $pdo 	= new PDO($dsn, $un, $pwd, $opt);
   $data        = array();

   try {
     switch($key){
       case "infousuario":
        $idusuario=$_REQUEST['idusuario'];
      $stmt 	= $pdo->query("SELECT * FROM infousuario WHERE idusuario = $idusuario");
      if($stmt->rowCount()>0 ){
       while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
       }
       echo json_encode($data);
      }
       else{
          echo '[{"id":"null"}]';
       }
      break;
       break;
       case 'getprodlist':
        $idusuario=$_REQUEST['idusuario'];
        $sql="SELECT l.id,prod.nome,prod.imagem,l.idproduto,c.id as idcategoria,c.nome as categoria,m.id as idmarca,m.nome as marca FROM produtos as prod,categorias as c,marcas as m,listaprodutos as l WHERE  c.id=prod.idcategoria AND m.id=prod.idmarca AND prod.id=l.idproduto AND l.idusuario=$idusuario ORDER BY prod.nome LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
        if($stmt->rowCount()>0 ){
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
          $data[] = $row;
         }    
         echo json_encode($data);
       }
       else{
          echo '[{"id":"null"}]';
       }
       break;
       case 'searchbyprod':
        $sql="SELECT prod.id,prod.nome,prod.imagem,prod.idcategoria,prod.idmarca FROM produtos as prod WHERE  prod.nome LIKE '".$_REQUEST['nome']."%' ORDER BY prod.nome LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
        if($stmt->rowCount()>0 ){
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
          // if($row->nome!="null")
          $data[] = $row;
         }    
         mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
         echo json_encode($data);
       }
       else{
          echo '[{"nome":"null"}]';
       }
       break;
        case 'getimgslist':
        $idusuario=$_REQUEST['idusuario'];
        $sql="SELECT * FROM userimages WHERE idusuario=$idusuario ORDER BY id LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
        if($stmt->rowCount()>0 ){
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
          $data[] = $row;
         }    
         echo json_encode($data);
       }
       else{
          echo '[{"id":"null"}]';
       }
       break;
       case "categ":
       $sql="SELECT * FROM categorias ORDER BY nome";
        $stmt 	= $pdo->query($sql);
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }    
      mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
      echo json_encode($data);
     }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
      case "marcas":
       $sql="SELECT * FROM marcas ORDER BY nome";
        $stmt 	= $pdo->query($sql);
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }    
      mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
      echo json_encode($data);
     }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
       case "prodlist":
       $idusuario=$_REQUEST['idusuario'];

        $sql="SELECT * FROM listaprodutos WHERE idusuario=$idusuario";        
        $stmt 	= $pdo->query($sql);
         $values=""; 
        if($stmt->rowCount()>0 ){
            $values="("; 
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
            $values=$values.$row->idproduto.',';
         
         }    
         $values=rtrim($values,',');  
       $values=$values.')';
         $values="prod.id NOT IN $values AND";        
       }
       
       $sql="SELECT prod.id as id,prod.nome,prod.imagem,c.id as idcategoria,c.nome as categoria,m.id as idmarca,m.nome as marca FROM produtos as prod,categorias as c,marcas as m WHERE  $values  c.id=prod.idcategoria AND m.id=prod.idmarca ORDER BY prod.nome LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }    
      mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
      echo json_encode($data);
     }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
       case "parceiroslist":
       $idusuario=$_REQUEST['idusuario'];

        $sql="SELECT * FROM parceiros WHERE idusuario=$idusuario";        
        $stmt 	= $pdo->query($sql);
         $values=""; 
        if($stmt->rowCount()>0 ){
            $values="("; 
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
            $values=$values.$row->idparceiro.',';
         
         }    
         $values=rtrim($values,',');  
       $values=$values.')';
         $values="id NOT IN $values AND";        
       }
       
       $sql="SELECT * FROM usuarios WHERE  $values  tipo=1 ORDER BY nome LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }    
      mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
      echo json_encode($data);
     }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
       case 'getparceiroslistusr':
        $idusuario=$_REQUEST['idusuario'];
        $sql="SELECT p.id,u.nome,u.email FROM parceiros AS p,usuarios AS u WHERE p.idusuario=$idusuario AND u.id=p.idparceiro ORDER BY u.nome LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
        if($stmt->rowCount()>0 ){
         while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
          $data[] = $row;
         }    
         echo json_encode($data);
       }
       else{
          echo '[{"id":"null"}]';
       }
       break;
      case "buscacep":
       $sql="SELECT end.logracompl as endereco,b.nome as bairro,c.nome as cidade,est.uf,end.cep FROM estados as est,cidades as c,enderecos as end,bairros as b WHERE  est.uf='".$_REQUEST['uf']."' AND c.estado_cod=est.id AND end.cidade_id=c.id AND end.bairro_id=b.id AND c.nome LIKE '".$_REQUEST['cidade']."%' AND  end.logracompl LIKE '%".$_REQUEST['endereco']."%' ORDER BY end.logracompl LIMIT ".$_REQUEST['limit']." OFFSET ".$_REQUEST['offset'];
        $stmt 	= $pdo->query($sql);
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }
     mb_convert_variables('UTF-8', 'ISO-8859-1', $data);
      echo json_encode($data);
     }
       else{
          echo '[{"endereco":"null"}]';
       }
      break;
      case "certdados":
      $id=$_REQUEST['idcert'];
      $stmt 	= $pdo->query("SELECT * FROM certificadoras WHERE id=$id");
      if($stmt->rowCount()==1 ){
       while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
       }
       echo json_encode($data);
      }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
    case "cert":
      $stmt 	= $pdo->query('SELECT * FROM certificadoras ORDER BY nome ASC');
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }
      echo json_encode($data);
     }
       else{
          echo '[{"nome":"null"}]';
       }
      break;
      case "uf":
      $stmt 	= $pdo->query('SELECT id, uf FROM estados ORDER BY uf ASC');
      if($stmt->rowCount()>0 ){
      while($row  = $stmt->fetch(PDO::FETCH_OBJ))      {
         $data[] = $row;
      }
      echo json_encode($data);
     }
       else{
          echo '[{"uf":"null"}]';
       }
      break;
      default:
       echo '[{"getcert":"erro"}]';
     }
   }
   catch(PDOException $e){
      echo $e->getMessage();
   }
?>