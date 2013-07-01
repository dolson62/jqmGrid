<?php
header('content-type: application/json');
$pageindex=htmlspecialchars($_GET["page"]);
$datapage="page" . $pageindex . ".js";

if (is_file($datapage))
  {
  include $datapage;
  }
else
  {
  echo "{ }";
  }

?>