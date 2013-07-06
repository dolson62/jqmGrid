<?php
header('content-type: application/json');

$pageIndex    =htmlspecialchars($_GET["page"]);
$rowsPerPage  =htmlspecialchars($_GET["rowsPerPage"]);
$jsonpCallback=htmlspecialchars($_GET["callback"]);

$totalRows=142;
$totalPages=(int)((floor($totalRows-1)/$rowsPerPage)+1);


$firstRowID=($pageIndex*$rowsPerPage);
if($firstRowID>=$totalRows)
  {
  $firstRowID=$totalRows-1;
  $lastRowID=$totalRows;
  }
else
  {
  $lastRowID=($firstRowID+$rowsPerPage);
  if($lastRowID>$totalRows)
    $lastRowID=$totalRows;
  }
$pageRows=$lastRowID-$firstRowID;


$page= array(
  "totalPages"  => $totalPages,
  "totalRows"   => $totalRows,
  "rowsPerPage" => $rowsPerPage,
  "pageIndex"   => $pageIndex,
  "pageRows"    => $pageRows,
  "rows"        => array()
);


for($i=0;$i<$pageRows;$i++)
  {
  $page["rows"][$i] = array(
        "RowID"    => array("value" => $firstRowID),
        "TeamID"   => array("value" => "ti-".$firstRowID),
        "TeamName" => array("value" => "tn-".$firstRowID),
        "Yield"    => array("value" => $firstRowID+1),
        "Cost"     => array("value" => $firstRowID+2),
        "Margin"   => array("value" => $firstRowID+3)
        );
  $firstRowID++;
  }

if($jsonpCallback!="")
   echo $jsonpCallback."(".json_encode($page).");";
else
   echo json_encode($page,JSON_PRETTY_PRINT);

?>