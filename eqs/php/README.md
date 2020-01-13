### What it's all about.

Here we are going to describe how to use [EasyQuery.JS](https://korzh.com/easyquery/javascript) framework to add an advanced search or ad hoc reporting functionality to your PHP application. 

In result you can something similar to this [EasyQuery demo page](https://korzh.com/demo/easyquery-asp-net-core-razor/advanced-search).

### 0. Prerequisites.

To run this sample you will need the following programs/services be installed on your computer/server:

  * [Apache HTTP server](http://www.apache.org/)
  * [PHP](http://php.net/). Please modify php.ini file to set `magic_quotes_gpc` variable to `Off`
  * [MySQL server](http://mysql.org) (either installed locally or on some other server you have an access to)
  * [`mysqli` extension for PHP](http://www.php.net/manual/en/mysqli.installation.php)
  * [NET Core 2.1  or higher](http://dot.net)   

> Please note: you will need it only to run **eqdm** global tool (see more details below) 
and it's not necessary to run it exactly on the computer where you plan to set up this demo or on your production server.

Of course, to perform all the steps below you need to clone / download this repository first and open `{repository-folder}/eqs/php` folder on your hard drive.

 ### Step 1. Running sample with the testing data

This folder contains almost all necessary parts to run and test query builder web-page locally. 
It's preconfigured to run over well-known Northwind demo database and already include an API key for the testing account on [SqlQueryBuilder.com](http://sqlquerybuilder.com) web-service (more about it later).    

So, all you need to do is:

 * Copy the content of this folder to `/htdocs` folder of your Apache installation. You can use any sub-folder of `/htdocs` as well (e.g. `/htdocs/easyquery`)
 * Open index.html page from that folder in the browser. For example, if you place it into `apache dir>/htdocs/easyquery` folder you will be able to access it by `http://localhost/easyquery` (don’t forget to add your port number if you run your Apache server on other than 80 port).    

If everything went well you will see an "advanced search" page similar to [this one](https://korzh.com/demo/easyquery-asp-net-core-razor/advanced-search) 
and will be able to build a simple query and execute it. 
For example, add "Customer Company Name" and "Order Freight" columns in the "Columns" panel 
and a simple condition like "Customer Country is equal to USA" to the "Conditions" panel.

> If you encounter any problem on any of the steps described above please don't hesitate and [contact us](https://korzh.com/support).

 ### Step 2. Create data model for your own database.
 
 Now, when our sample web-page is setup and running well, you can move to the next step: 
 getting the same behavior in your own web-application and for your own database.

As you possibly know (if not - please read [this article](https://korzh.com/easyquery/docs/fundamentals/how-it-works) first) EasyQuery components and widgets do not work with your database directly. 
Instead, they use a special user-friendly representation of your DB called *“data model”*.

Data model defines which entities and attributes your users can operate with when they build their queries. 
It allows to set user-friendly names for tables (entities), fields (attributes) and operators (like “is equal to” or “starts with”). 
Additionally, data model can contain a list of predefined values for some attribute - so your users will be able to select a value from a list instead of typing it manually.

.NET version of EasyQuery allows you to build data model at run-time. 
On other platforms, you will need to create data model “manually” using either our *eqdm* command line utility (runs on Windows, Linux and Mac) or *Data Model Editor* (DME) GUI application (only for Windows).

Here are step-by-step instructions for both cases:

#### Option 1: eqdm command line utility

1.Open terminal (Command Prompt) and run the following command to install **eqdm** utility:
```
dotnet tool install -g Korzh.EasyQuery.DataModelTool
```

2. Now you can run **eqdm** at any time by via `eqdm` comman in your terminal.

3. Create a configuration file for your DB:

```
eqdm crtconf
```

This command will create `eqdm.json` configuration file in the same folder where you run the command.
Open this file and modify the setting there:
 * Specify the type of your database in `DbType` parameter. Possible options are: "MsSql", "MySql" and "PostreSql" (other DB types will be supported soon as well ).
 * Specify the connection string to your database. If you don't know how the connection string should look like for your DB - use [ConnectionStrings.com](https://www.connectionstrings.com/) website. Just select your database and then use the **Connector/Net** option there.
 * You can also specify your model ID and its name in the config file. Alternatively, your can pass them in `eqdm` parameters as `--modelId:ModelID` and `--modelName:ModelName`.
 
4. Save the config file and start `eqdm` utility with `genmodel` comman:

```
eqdm genmodel --config=eqdm.json --modelId=YourModelID --modelName=YourModelName
```

When it's finished - you will find *YourModelID.xml* and *YourModelID.json* files in the same folder.


#### Option 2: Data Model Editor (Windows only!)

* [Download](https://korzh.com/download/dme_setup.exe) and install Data Model Editor

* Run DME (DMEditor40.exe file)

* Select "Model | New" menu item.

* Type your model name (any), select the type of your database type (MS SQL, Oracle, MySQL, etc) and enter the connection string. 

If you don’t know how connection string may look like - use “Build connection” button and follow the wizard which helps you to set up a connection to your DB.
* Press OK in “New model” dialog and then follow the prompts that will appear to add tables, links, etc. Save your model to some XML file (Model | Save menu) for future use.

* Use “Model | Save as..” menu item to create a copy of your model file in JSON format (e.g. "MyModel.json"). 
Select “JSON” file type in “Save as type” field.

That’s all, close DME.

### Step 3. Connect your model and modify EasyQuery.php script
Copy the JSON file with your model (built on step #2) into the same folder with `EasyQuery.php` file.
This script processes all AJAX requests from EasyQuery widgets. At the beginning of that script you can find the following definitions:

```
public static $SQBAPI_HOST= "http://sqlquerybuilder.com/"; //You will need to change this address in case of using a standalone (local) version of SQL Query Builder web-servive
public static $SQBAPI_KEY = "3ea4523c-1d18-4d8c-82f5-c4f998d67daf"; //<-- change this with your API key
public static $MODEL_ID = "NWind"; //<-- change this with the ID of your model
```
Our sample script loads NWind.json model file. You need to replace the value of `MODEL_ID` configuration settings to the ID of your model and the name of JSON file created on previous step (e.g. "MyModel").

### Step 4. Generating and executing SQL by the query defined in UI
EasyQuery widgets send the query, defined by the user in a JSON format. You can get it through `queryJson` parameter in `saveQuery`, `syncQuery` or `executeQuery` action handlers.   
So, how do we get a correct SQL statement by this JSON query?   

The answer is a special [SQL query builder](http://sqlquerybuilder.com) web-service we created for this task.
This service implements a web API which allows you to pass your query JSON string and get a correct SQL statement in the result.
To use it you need to get your API Key first and attach this key to any your request (in a Header section).

So, here are the instructions:
 * Open [SQL query builder](http://sqlquerybuilder.com) web-page and click on Register link.
 * Fill out the form and click on Register button to finish registration and get your API Key.
 * You will get your API key in a moment by email. Copy it into your `EasyQuery.php` file:
```
public static $SQBAPI_HOST = "http://sqlquerybuilder.com/";
public static $SQBAPI_KEY = "Your API key goes here";
```
* Then press “Add model” link, enter the ID of your model (the same as you set for `MODEL_ID` config setting above) and copy the content of the XML file created on the step #2.
* Now you can send a POST request to `/api/3.0/SqlQueryBuilder` action when you need to get an SQL statement. Send the JSON representation of the query returned by EasyQuery widgets as the request's content.

So all you need to do now - is to execute this SQL statement over your database, return the result set back to the client-side in some format and show that result set to the user in a form of some data grid or chart. We gave an example of possible JSON string in the Node.js script from our sample.

In our demo web page, we show generated SQL statement on any query change. Of course, you don’t need to do it in a production environment. Most possibly, you will hide it from users and show only the result table returned after SQL execution.


### Step 5. Standalone (local) version of SQL query builder web-service

Our [SQL query builder](http://sqlquerybuilder.com) REST service</a> is free but has some limitations on the number of daily requests one user can send. 

To remove those limits or if you want to avoid using a third-party web-service for SQL generation - we have a local version of this service which you can install on your own Windows, Linux or Mac server.  
For more information please read [EasyQuery.JS web-page](https://korzh.com/easyquery/javascript).


Feel free to send a [support request](https://korzh.com/support) if you have any questions regarding EasyQuery widgets or SqlQueryBuilder.com web-service.
