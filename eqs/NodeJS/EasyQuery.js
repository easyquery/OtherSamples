const config = require('./config');
const FileQueryStore = require('./fileQueryStore');
const createExporter = require('./exporter');

const mysql = require('mysql');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const urljoin = require('url-join');

const isHttps = config.SQBAPI_HOST.startsWith('https');
console.log("Is https mode: ", isHttps);

const https = isHttps
            ? require('https') 
            : require('http');

const con = mysql.createConnection({
    host     : config.DB_HOST,
    port     : config.DB_PORT,
    user     : config.DB_USER,
    password : config.DB_PASSWD,
    database : config.DB_NAME
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to db!");
});

const rowNumberAlias = '__rowNumber';
function buildDataTable(query, recordSet) {
    var table = {};

    const enablesEqCols = query.cols.filter(col => col.enabled !== false);
    table.cols = recordSet.fields
        .filter(item => item.name !== rowNumberAlias)
        .map((item, index) => {
            const eqCol = enablesEqCols[index];
            const isAggr = typeof (eqCol.expr.func) !== 'undefined';
            const expr = isAggr ? eqCol.expr.args[0] : eqCol.expr;
            return {
                id: eqCol.id,
                attrId: expr.val,
                label: item.name,
                type: expr.dtype,
                isAggr: typeof(eqCol.expr.func) !== 'undefined'
            };
        });

    table.rows = recordSet.rows.map(row => {

        if (row[rowNumberAlias])
            delete row[rowNumberAlias];

        return Object.values(row);
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

function fetchData(sql) {

    return new Promise((resolve, reject) => {
        con.query(sql, (error, result, fields) => {
            if (error) {
                reject(error);
                return;
            }

            if (!result) {
                reject('Empty result');
                return;
            }

            var recordSet = { rows: result, fields: fields };
            resolve(recordSet);
        });
    });
}

function buildSql(modelId, query, paging) {
    //send a request to the REST web-service
    var request_data = {
        modelId: modelId,
        query: query,
        paging: paging
    };

    return new Promise((resolve, reject) => {
        const url = urljoin(config.SQBAPI_HOST, 'api/3.0/SqlQueryBuilder');
        const request = https.request(url, {
            rejectUnauthorized: false,
            headers: {
                'Content-type': 'application/json',
                'SQB-Key': config.SQBAPI_KEY
            },
            method: 'POST',
        }, (res) => {
            let data = '';
    
            res.on('data', (chunk) => data += chunk);
    
            res.on('end', () => resolve(data));
        })
        .on('error', (err) => reject(err))
        
        request.write(JSON.stringify(request_data))
        request.end();
    
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

            const countSql = resObj.countSql;
    
            return { sql, countSql};
        }
        catch (e) {
            throw new Error("Error: Invalid response: " + e);
        }
    });
}

function getJsonModel(modelId, browser = false){
    return new Promise((resolve, reject) => {
        const url = urljoin(config.SQBAPI_HOST, 'api/3.0/DataModels', modelId) + `?format=json&browser=${browser}`;
        https.request(url, {
                rejectUnauthorized: false,
                method: 'GET',
                headers: {
                    'SQB-Key': config.SQBAPI_KEY
                }
            }, (res) => {
                let data = '';
        
                res.on("data", (chunk) => data += chunk);
        
                res.on("end", () => {;
                    if (res.statusCode >= 400) {
                        reject(new Error("Can't load model: " + data));
                        resolve({});  
                    } 
                    else {
                        resolve(JSON.parse(data));  
                    }
                });
            })
        .on("error", (err) => reject(err))
        .end();
    });
}


const app = express();
const queryStore = new FileQueryStore(app.path());

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html')); 
});


app.use(express.static('public'));

//GET /models/{modelId}
app.get('/models/:modelId', (request, response) => {
    const modelId = config.MODEL_ID; //request.params.modelId;
    
    //read model from a file and return in response
    getJsonModel(modelId, true)
    .then(model => {
        response.send({
            result: 'ok',
            model: model
        });
    })
    .catch((e) => {
        console.error(e);
        response.status(400).send("Error: " + e);
    });;  ;
   
});

//GET /models/{modelId}/queries
app.get('/models/:modelId/queries', (request, response) => {
    const modelId = config.MODEL_ID; //request.params.modelId;

    queryStore
    .all(modelId)
    .then(queries => {
        response.send({
            result: 'ok',
            queries: queries
        });
    });
});

//GET /models/{modelId}/queries/{queryId}
app.get('/models/:modelId/queries/:queryId', (request, response) => {
    const modelId = config.MODEL_ID; //request.params.modelId;
    const queryId = request.params.queryId;

    queryStore
    .get(modelId, queryId)
    .then(query => {
        response.send({
            result: 'ok',
            query: query
        });
    });     
});

//POST /models/{modelId}/queries
app.post('/models/:modelId/queries', (request, response) => {
    const query = request.body.query;

    // uncomment if you want to save query on new request
    // const modelId = config.MODEL_ID; //request.params.modelId;
    // const queryId = request.params.queryId;
    // queryStore.add(modelId, queryId, query)
    //    .then(query => {
    //        response.send({
    //            result: 'ok',
    //            query: query
    //        });
    //    });
    
    response.send({
        result: 'ok',
        query: query
    });  
});

//PUT /models/{modelId}/queries/{queryId}
app.put('/models/:modelId/queries/:queryId', (request, response) => {
    const modelId = config.MODEL_ID; //request.params.modelId;
    const queryId = request.params.queryId;
    const query = request.body.query;

    queryStore
    .update(modelId, queryId, query)
    .then(query => {
        response.send({
            result: 'ok',
            query: query
        });
    });
});

//DELETE /models/:modelId}/queries/{queryId}
app.delete('/models/:modelId/queries/:queryId', (request, response) => {
 const modelId = config.MODEL_ID; //request.params.modelId;
    const queryId = request.params.queryId;
    
    queryStore
    .remove(modelId, queryId)
    .then(() => {
        response.send();
    });
});

//POST /models/{modelId}/queries/{queryId}/sync
app.post('/models/:modelId/queries/:queryId/sync', (request, response) => {
    //return generated SQL to show it on our demo web-page. Not necessary to do in production!
    const modelId = config.MODEL_ID; //request.params.modelId;
    const queryId = request.params.queryId;
    const query = request.body.query;

    buildSql(modelId, query).then( res =>{
        response.send({
            result: 'ok',
            statement: res.sql
        });
    })   
    .catch((error) => {
        response.status(400).send("Error: " + error);
    });	
});

//POST /models/{modelId}/fetch
app.post('/models/:modelId/fetch', (request, response) => {
    const modelId = config.MODEL_ID; //request.params.modelId;
    const query = request.body.query;
    const chunk = request.body.chunk;
    const paging = { 
        limit: chunk.limit, 
        page: Math.trunc(chunk.offset / chunk.limit) + 1
    };

    buildSql(modelId, query, chunk.needTotal ? paging : null)
    .then(res => fetchData(res.sql)
        .then(recordSet => {
            let result = {};
            if (recordSet) {
                const resultSet = buildDataTable(query, recordSet);
                result = { result: 'ok', statement: res.sql, resultSet: resultSet };
                if (chunk.needTotal && res.countSql) {
                    return fetchData(res.countSql).then(recordSet => {
                        if (recordSet) {
                            const totalRecords = recordSet.rows[0]['__rowCount'];
                            result.meta = {
                                totalRecords: totalRecords
                            }
                        }

                        return result;
                    });
                }
            }
            else {
                result = { statement: "DATABASE CONNECTION ERROR!!!" };
            }

            return result;
        })
    )
    .then(result => response.send(result))
    .catch(error => {
        console.error(error);
        response.status(400).send(error)
    });
});

//GET /models/{modelId}/valuelists/{editorId}
app.get('/models/:modelId/valuelists/:editorId', (request, response) => {
    //here  we need to assemble the requested list based on its name and return it as JSON array
    //each item in that array is an object with two properties: "id" and "text"
    const modelId = config.MODEL_ID; //request.params.modelId;
    const editorId = request.params.editorId;

    //if this is a SQL list request - we need to execute SQL statement and return the result set as a list of of {id, text} items
    //First we need to get out json model from the SQB
    getJsonModel(modelId, false).then((model) => {

        var sql = null;
        for (let editor of model.editors) {
            if (editor.id === editorId) {
                sql = editor.sql;
                break;
            }
        }

        if (sql) {
            //And now execute our sql to get data and render list
            fetchData(sql)
            .then((recordSet) => {
                if (recordSet !== null) {
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
    })
    .catch((e) => {
        console.error(e);
        response.status(400).send("Error: " + e);
    });;  

});

//POST /models/{modelId}/export/{format}
app.post('/models/:modelId/export/:format', (request, response) => {
    const modelId = config.MODEL_ID; // request.params.modelId;
    const format = request.params.format;
    const query = request.body.query;

    buildSql(modelId, query)
    .then(res =>  fetchData(res.sql))
    .then(dataSet => {
        const exporter = createExporter(format);
        const contentType = exporter.contentType();
        const fileExtension = exporter.fileExtension();
        const fileName = `${query.name}.${fileExtension}`;

        response.setHeader('Content-Disposition',
            `attachment; filename="${fileName}"`);
        response.setHeader('Content-Type', contentType);

        exporter.export(dataSet, response);
        response.end();
    })
    .catch(error => {
        console.error(error);
        response.status(400).send(error.message)
    });
});

var port = process.env.PORT || config.port || 3200; 
app.listen(port);


console.log("Server run on localhost: ", port);