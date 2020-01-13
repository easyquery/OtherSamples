var config = require('./config');

var mysql = require('mysql');
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var path = require("path");
var urljoin = require('url-join');


var con = mysql.createConnection({
    host     : config.DB_HOST,
    port     : config.DB_PORT,
    user     : config.DB_USER,
    password : config.DB_PASSWD,
    database : config.DB_NAME
  });

 
con.connect(function(err) {
 if (err) throw err;
 console.log("Connected!");
});


function getTypeName(type) {
    switch (type) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 8:
        case 9:
        case 246:
            return 'number';
        case 7:
        case 10:
        case 11:
        case 12:
            return 'datetime';
        default:
            return 'string';
    }
}

function renderDataTable(recordSet) {
    var table = {};

    table.cols = recordSet.fields.map(item => {
        return {
            id: item.name,
            label: item.name,
            type: getTypeName(item.type)
        };
    });

    table.rows = recordSet.rows.map(row => {
        var rowData = {};

        rowData.c = Object.keys(row).map((key, keyIdx) => {
            let value = row[key];

            switch (table.cols[keyIdx].type) {
                case 'number':
                    return { v: value * 1 }
                case 'datetime':
                    if (value !== null) {
                        var dateString = value.toISOString();
                        return {
                            v: "Date(" + dateString.substr(0, 4) + ", " + (parseInt(dateString.substr(5, 2)) - 1) +
                                ", " + dateString.substr(8, 2) + ")"
                        };
                    }
                    return { v: "Date(0000,00,00)" };
                default:
                    return { v: value };
            }
        });

        return rowData;
    });

    return table;
}

function renderRequestedList(recordSet) {
    let result = recordSet.rows.map(row => {
        let id_field = row[Object.keys(row)[0]];
        let text_field = Object.keys(row).length > 1 ? row[Object.keys(row)[1]] : id_field;
        
        return {
            id: id_field.toString(),
            text: text_field
        };
    });

    return result;
}

function executeSql(sql) {

    return new Promise(function(resolve, reject){
        con.query(sql, (error,result, fields)=>{
            if (error){
                reject(error);
                return;
            }

			if (!result) {
                reject('Empty result');
                return;
            }

			//console.log(result);
            var recordSet = {rows: result,fields: fields }
            resolve(recordSet);
        })
    });
}

function buildSql(modelId, query) {
    //send a request to the REST web-service
    var request_data = {
        modelId: modelId,
        query: query
    };

    return new Promise((resolve, reject) => {
        let obj = {
            url: urljoin(config.SQBAPI_HOST, 'api/3.0/SqlQueryBuilder'), 
            method: 'POST',
            headers: {
                'Content-type': "application/json",
                'SQB-Key': config.SQBAPI_KEY
             },
            body:  JSON.stringify(request_data)
        }

        request(obj,
		(error, response, body) => {
            if (error) {
                reject(error);
            }
            else if (response.statusCode >= 400) {
                reject(new Error(response.body));
            }
            resolve(response.body);
        })  
    })
    .then((resJson) => {
        //get a response in JSON format	
        try {         
            var resObj = JSON.parse(resJson); 	
    
            var sql = "";
            //now we get an SQL statement by the query defined on client-side
            if (resObj.sql !== null) {
                sql = resObj.sql;
            }
            else {
                throw new Error("Error: No 'sql' field");
            }
    
            return sql;
        }
        catch (e) {
            throw new Error("Error: Invalid response: " + e);
        }
    });
}

function getJsonModel(modelId, browser = false){
    return new Promise((resolve, reject) => {
        request({
            url: urljoin(config.SQBAPI_HOST, 'api/3.0/DataModels', modelId) + `?format=json&browser=${browser}`,
            method: 'GET',
            headers: {
                'SQB-Key': config.SQBAPI_KEY
            }

        }, (error, response, body) => {
            if (error) {
                reject(error);
            } else if (response.statusCode >= 400) {
                reject(new Error("Can't load json"));
            }
            resolve(JSON.parse(response.body));
        });
    });
}


const app = express();

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html')); 
});

//GET /models/{modelId}
app.get('/models/:modelId', (request, response) => {
    const modelId = request.params.modelId;
    
    //read model from a file and return in response
    getJsonModel(modelId, true).then(model => {
        response.send({
            result: 'ok',
            model: model
        });
    });
   
});

//POST /models/{modelId}/queries/{queryId}/sync
app.post('/models/:modelId/queries/:queryId/sync', (request, response) => {
    //return generated SQL to show it on our demo web-page. Not necessary to do in production!
    const modelId = request.params.modelId;
    const queryId = request.params.queryId;

    buildSql(modelId, request.body.query).then((sql)=>{
        response.send({
            result: 'ok',
            statement: sql
        });
    })   
    .catch((error) => {
        response.status(400).send("Error: " + error);
    });	
});

//POST /models/{modelId}/queries/{queryId}/execute
app.post('/models/:modelId/queries/:queryId/execute', (request, response) => {
    const modelId = request.params.modelId;
    const queryId = request.params.queryId;

    buildSql(modelId, request.body.query)
    .then((sql) => {
        var result = '{}';
        executeSql(sql).then((recordSet) => {
            if (recordSet){
                var resultSet = renderDataTable(recordSet);
                result = { result: "ok", statement: sql, resultSet: resultSet };	
            }
            else {
                result = {statement: "DATABASE CONNECTION ERROR!!!"};		
            }
            
            response.send(result);
    
        }).catch((error) => {
            response.status(400).send(error);
        });
    }).catch((error) => {
        response.status(400).send(error);
    });
});

//GET /models/{modelId}/valuelists/{editorId}
app.get('/models/:modelId/valuelists/:editorId', function(request, response){
    //here  we need to assemble the requested list based on its name and return it as JSON array
    //each item in that array is an object with two properties: "id" and "text"
    const modelId = request.params.modelId;
    const editorId = request.params.editorId;

    //if this is a SQL list request - we need to execute SQL statement and return the result set as a list of of {id, text} items
    //First we need to get out json model from the SQB
    getJsonModel(modelId, false).then((model) =>{

        var sql = null;
        for(let editor of model.editors) {
            if (editor.id === editorId) {
                sql = editor.sql;
                break;
            }
        }
      
        if (sql) {
             //And now execute our sql to get data and render list
             executeSql(sql).then((recordSet) => {
                if(recordSet !== null) {
                    var values = renderRequestedList(recordSet);
                    response.send({
                        result: 'ok',
                        values: values
                    });
                }
            })
            .catch((e) => {
                response.status(400).send("Error: " + e);
            });
        }
        else {
            response.send({
                result: 'ok',
                values: []
            });
        }
    });  

});

var port = process.env.PORT || config.port || 3200; 
app.listen(port);

console.log("Server run on localhost: ", port);