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
		new Endpoint("FetchData", "/\/models\/(.*?)\/fetch\/?$/", "POST"),
		new Endpoint("GetValueList", "/\/models\/(.*?)\/valuelists\/(.*?)\/?$/", "GET"),
		new Endpoint("GetModel",     "/\/models\/(.*?)\/?$/", "GET")
	);
	
	function buildDataTable($query, $recordSet) {
		$ret=array();
		
		$columns=$recordSet->fetch_fields();
		$enabledEqCols = array_filter($query->cols, function($col, $index) {
			return !isset($col->enabled) || $col->enabled !== false;
		}, ARRAY_FILTER_USE_BOTH);

        foreach($columns as $index => $col) {

			if($col->name == '__rowNumber')
				continue;

			$eqCol = $enabledEqCols[$index];
			$isAggr = property_exists($eqCol->expr, 'func');
			$expr = $isAggr ? $eqCol->expr->args[0] : $eqCol->expr;
			
            $columnDescr = array();
            $columnDescr['id'] = $eqCol->id;
			$columnDescr['attrId'] = $expr->val;
            $columnDescr['label'] = $col->name;
			$columnDescr['type'] = $expr->dtype;
			$columnDescr['isAggr'] = $isAggr;

            $ret['cols'][] = $columnDescr;
        }
		
        while($array=$recordSet->fetch_array(MYSQLI_ASSOC)) {

			if (array_key_exists('__rowNumber', $array)) {
				unset($array['__rowNumber']);
			}
			$ret['rows'][] = array_values($array);
			
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
	
	function fetchData($sql) {
		$mysqli = new mysqli(config::$DB_HOST,config::$DB_USER,config::$DB_PASSWD,config::$DB_NAME,config::$DB_PORT);
		if ($mysqli->connect_error) {
			return null;
		}
		return $mysqli->query($sql);
	}
	
	function buildSql($modelId, $query, $paging = NULL) {
		//send a request to the REST web-service	
		$url = config::$SQBAPI_HOST.'api/3.0/SqlQueryBuilder';
		$request_data = array();
		$request_data['modelId'] = $modelId;
		$request_data['query'] = $query;
		if ($paging) {
			$request_data['paging'] = $paging;
		}

		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/json\r\nSQB-Key: ".config::$SQBAPI_KEY."\r\n",
		        'method'  => 'POST',
		        'content' => json_encode($request_data),
		    ),
		);

		$context  = stream_context_create($options);

		$response = file_get_contents($url, false, $context);

		//get a response in JSON format	
		if ( $response !== FALSE) {
			$res = json_decode($response, true); 	
			
			if ($res == NULL) {
				$res = array('sql' => '');
			}
			return $res;
		}
		else {
			return 'ERROR';
		}
	}

	function getJsonModel($modelId, $browser = false) {
		
		// Get JSON Model from EQS
		// You can keep model.json file on your server and load it instead of making request
		// Or cache your model after first call
		$url = config::$SQBAPI_HOST.'api/3.0/DataModels/'.$modelId.'?format=json&browser='.( $browser ? 'true' : 'false');

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

	//comment it  you want to use modelId parameter
	$modelId = config::$MODEL_ID;

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

		$res = array('sql' => '');

		if (!isQueryEmpty($data->query)) {
			$res = buildSql($modelId, $data->query);	
		}

		header('Content-type: application/json');
		$result = json_encode(array('statement' => $res['sql'], 'result' => "ok"));
		echo $result;
	}

	//POST /models/{modelId}/fetch
	else if ($action == "FetchData") {
	
		//get query in JSON format
		$data = json_decode(file_get_contents('php://input'), false);
		$chunk = $data->chunk;
		$paging = array('limit' => $chunk->limit, 'page' => intval($chunk->offset / $chunk-> limit) + 1);
		$res = buildSql($modelId, $data->query, $paging);
		$result='{}';
		$recordSet = fetchData($res['sql']);
		if ($recordSet) {

			$resultSet = buildDataTable($data->query, $recordSet);

			$meta = NULL;
			if ($chunk->needTotal && array_key_exists('countSql', $res)) {
				$countSet = fetchData($res['countSql']);
				$row = $countSet->fetch_array(MYSQLI_ASSOC);
				$meta = array('totalRecords' => $row['__rowCount']);
			}

			$ret=array('result'=>'ok', 'statement' => $res['sql'], 'resultSet' => $resultSet);
			if ($meta) {
				$ret['meta'] = $meta;
			}

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
				break;
			}
			
		}

		header('Content-type: application/json');
		$result = '{"result: "ok", "values": []}';

		if($recordSet=fetchData($sql)) {
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