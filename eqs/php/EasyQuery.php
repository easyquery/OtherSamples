<?php
	
	// ini_set("log_errors", 1);
	// ini_set("display_errors", 0);
	// ini_set("error_log", "easyquery.log");
	
	class config {
		public static $SQBAPI_HOST= "http://sqlquerybuilder.com/";
		public static $SQBAPI_KEY = "3ea4523c-1d18-4d8c-82f5-c4f998d67daf"; //<-- change to your API key
		public static $MODEL_ID = "NWind"; //<-- change to the ID of your model
		
		//Database
		//Below we use the connection parameters for our own testing DB.
		//You will need to change these parameter if you want to connect to your own database.
		public static $DB_NAME='nwind';
		public static $DB_HOST='demodb.korzh.com';
		public static $DB_PORT='6603';
		public static $DB_USER='equser';
		public static $DB_PASSWD='ILoveEasyQuery';
	}

	class Endpoint {

		public $action;
		public $pattern;
		public $method;

		public function __construct($action, $pattern, $method) {
			$this->action = $action;
			$this->pattern = $pattern;
			$this->method = $method;
		}
	}

	//endpoints, which this file processes
	$endpoints = array(
		new Endpoint("SyncQuery",    "/\/models\/(.*?)\/queries\/(.*?)\/sync\/?$/", "POST"),
		new Endpoint("ExecuteQuery", "/\/models\/(.*?)\/queries\/(.*?)\/execute\/?$/", "POST"),
		new Endpoint("GetValueList", "/\/models\/(.*?)\/valuelists\/(.*?)\/?$/", "GET"),
		new Endpoint("GetModel",     "/\/models\/(.*?)\/?$/", "GET")
	);
	
	function getTypeName($type) {
		
		$types[1]='number';
		$types[2]='number';
		$types[3]='number';
		$types[4]='number';
		$types[5]='number';
		$types[5]='number';
		$types[8]='number';
		$types[9]='number';
		$types[246]='number';
		$types[7]='datetime';
		$types[10]='datetime';
		$types[11]='datetime';
		$types[12]='datetime';

		if(!isset($types[$type]))
			return 'string';

		return $types[$type];
	}

	function renderDataTable($recordSet) {
		$ret=array();
		
		$columns=$recordSet->fetch_fields();
        foreach($columns as $col) {
            $columnDescr=array();
            $columnDescr['id']=$col->name;
            $columnDescr['label']=$col->name;
			$columnDescr['type']=getTypeName($col->type);
            $ret['cols'][]=$columnDescr;
        }
		
        while($array=$recordSet->fetch_array(MYSQLI_ASSOC)) {
			$values=array_values($array);
			$rowData=array();
			$rowData['c']=array();
			$col_index = 0;
			$colType = '';
			foreach($values as $value) {
				$colType = $ret['cols'][$col_index]['type'];
				if ($colType =='number') {
                    $rowData['c'][]=array("v"=>$value*1);
                }
				else if ($colType =='datetime') {
					$year = substr($value, 0, 4);
					$month = intval(substr($value, 5, 2)) - 1;
					$day = substr($value, 8, 2);
                    $rowData['c'][]=array("v"=> "Date(".$year.", ".$month.", ".$day.")");
				}
                else {
                    $rowData['c'][]=array("v"=>$value);
                }
                $col_index++;
			}
			$ret['rows'][]=$rowData;
			
		}
		return $ret;		
	}
	
	function renderRequestedList($recordSet) {
		$ret=array();
		while($array=$recordSet->fetch_array(MYSQLI_NUM)) {
			if(!isset($array[1]))$array[1]=$array[0];
			$ret[]=array('id'=>$array[0],'text'=>$array[1]);
		}		
		return $ret;
	}
	
	function executeSql($sql) {
		$mysqli=new mysqli(config::$DB_HOST,config::$DB_USER,config::$DB_PASSWD,config::$DB_NAME,config::$DB_PORT);
		if ($mysqli->connect_error) {
			return null;
		}
		return $mysqli->query($sql);
	}
	
	function buildSql($modelId, $query_json) {
		//send a request to the REST web-service	
		$url = config::$SQBAPI_HOST.'api/3.0/SqlQueryBuilder';
		$request_data = '{"modelId": "'.$modelId.'", "query":'.$query_json.'}';

		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/json\r\nSQB-Key: ".config::$SQBAPI_KEY."\r\n",
		        'method'  => 'POST',
		        'content' => $request_data,
		    ),
		);

		$context  = stream_context_create($options);

		$response = file_get_contents($url, false, $context);

		//get a response in JSON format	
		if ( $response !== FALSE) {
			$res = json_decode($response, true); 	
			
			$sql = "";
			//now we get an SQL statement by the query defined on client-side
			if ($res != null && array_key_exists("sql", $res) )
				$sql = $res["sql"]; 

			return $sql;
		}
		else {
			return 'ERROR';
		}
	}

	function getJsonModel($modelId, $browser = false) {
		
		// Get JSON Model from EQS
		// You can keep model.json file on your server and load it instead of making request
		// Or cache your model after first call
		$url = config::$SQBAPI_HOST.'api/3.0/DataModels/'.$modelId.'?format=json&browser'.$browser;

		$options = array(
		    'http' => array(
				'header'  => "SQB-Key: ".config::$SQBAPI_KEY,
			)
		);

		$context  = stream_context_create($options);

		$response = file_get_contents($url, false, $context);
		
		return $response;
	}
	

	function isQueryEmpty($query) {
		$column_count = count($query->cols);
		$condition_count = count($query->root->conds);
		return $column_count == 0 && $condition_count == 0;
	}

	//Process requests
	$method = $_SERVER['REQUEST_METHOD'];
	$uri = $_SERVER['PATH_INFO'];
	
	$action = null;
	$modelId = null;
	$queryOrEditorId = null;

	for($i = 0; $i < count($endpoints); ++$i) {

		$endpoint = $endpoints[$i];

		if ($endpoint->method == $method
			&& preg_match_all($endpoint->pattern, $uri, $matches, PREG_PATTERN_ORDER)) {

			$action = $endpoint->action;

			$modelId = $matches[1][0];
			
			if (count($matches) > 2) {
				$queryOrEditorId = $matches[2][0];
			}
			
			break;
		
		}
		
	}

	// uncomment it if you want to use constant instead of url parameter
	//$modelId = $MODEL_ID

	//GET /models/{modelId}
	if ($action == "GetModel") {

		$modelJson = getJsonModel($modelId, true);

		header('Content-type: application/json');
		echo '{ "result": "ok", "model": '.$modelJson.' }';
	}

	//POST /models/{modelId}/queries/{queryId}/sync
	else if ($action == "SyncQuery") {
		//return generated SQL to show it on our demo web-page. Not necessary to do in production!
		$data = json_decode(file_get_contents('php://input'), false);

		$sql = "";

		if (!isQueryEmpty($data->query)) {
			$queryJson = json_encode($data->query);
			$sql = buildSql($modelId, $queryJson);	
		}

		header('Content-type: application/json');
		$result = json_encode(array('statement' => $sql, 'result' => "ok"));
		echo $result;
	}

	//POST /models/{modelId}/queries/{queryId}/execute
	else if ($action == "ExecuteQuery") {
		//get query in JSON format
		$data = json_decode(file_get_contents('php://input'), false);
		
		$query_json = json_encode($data->query);
		$sql = buildSql($modelId, $query_json);
		$result='{}';
		$recordSet = executeSql($sql);
		if ($recordSet) {
			$resultSet=renderDataTable($recordSet);
			$ret=array('result'=>'ok', 'statement' => $sql, 'resultSet' => $resultSet);

			$result=json_encode($ret);	
		}
		else {
			$ret['statement']="DATABASE CONNECTION ERROR!!!";
			$result = json_encode($ret);		
		}
		
		header('Content-type: application/json');
		echo $result;
	}

	//GET /models/{modelId}/valuelists/{editorId}
	else if ($action == 'GetValueList') {
		//here  we need to assemble the requested list based on its name and return it as JSON array
		//each item in that array is an object with two properties: "id" and "text"
		
		//if this is a SQL list request - we need to execute SQL statement and return the result set as a list of of {id, text} items
		
		$dataModelJson = getJsonModel($modelId, false);
			
		//Parse json model to get sql statement for generationg list
		$dataModel = json_decode($dataModelJson, false);
		$sql = ' ';

		foreach ($dataModel->editors as $editor) {

			if($editor->id == $queryOrEditorId){
				$sql = $editor->sql;
			}
			
		}

		header('Content-type: application/json');
		$result = '{"result: "ok", "values": []}';

		if($recordSet=executeSql($sql)) {
			$ret=array('result'=>'ok', 'values' => renderRequestedList($recordSet));
			$result=json_encode($ret);	
		} 

		echo $result;
	}
	else {
		header('Content-type: application/json');
		header('Status Code: 404 NotFound');
		echo '';
	}

?>