<?php
header('content-type: application/json');
$pageIndex=htmlspecialchars($_GET["page"]);


$totalPages=9;
$rowsPerPage=60;


$firstRowID=($pageIndex*$rowsPerPage);
echo "{\n";
if($pageIndex<$totalPages)
  {
  echo '  "totalPages":'.$totalPages.",\n";
  echo '  "totalRows":'.($totalPages*$rowsPerPage).",\n";
  echo '  "rowsPerPage":'.$rowsPerPage.",\n";
  echo '  "pageIndex":'.$pageIndex.",\n";
  echo '  "pageRows":'.$rowsPerPage.",\n";
  echo '  "rows":'."[\n";
  for($i=0;$i<$rowsPerPage;$i++)
    {
    echo "    {\n";
    echo "    \"RowID\"   :{\"value\": ".$firstRowID."},\n";
    echo "    \"TeamID\"  :{\"value\": \"ti-".$firstRowID."\"},\n";
    echo "    \"TeamName\":{\"value\": \"tn-".$firstRowID."\"},\n";
    echo "    \"Yield\"   :{\"value\": ".($firstRowID+1)."},\n";
    echo "    \"Cost\"    :{\"value\": ".($firstRowID+2)."},\n";
    echo "    \"Margin\"  :{\"value\": ".($firstRowID+3)."}\n";

    echo "    }";
    if(($i+1)!=$rowsPerPage)
      echo ",";
    echo "\n";

    $firstRowID++;
    }
  echo "  ]\n";
  }

echo "}";

?>