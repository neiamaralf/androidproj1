 <?php
header('Access-Control-Allow-Origin: *');
$mysqli = new mysqli("localhost", "athen394", "ldae08", "athen394_vila_viela_db1");
$query = "SELECT * FROM produtos  LIMIT 10";
$dbresult = $mysqli->query($query);
 
while($row = $dbresult->fetch_array(MYSQLI_ASSOC)){
 
    $data[] = array(
        'title' => $row['nome'],
        'foto' => $row['image']
    );
}
 

echo json_encode($data);
?>