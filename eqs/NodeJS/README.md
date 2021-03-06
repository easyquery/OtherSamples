# Using EasyQuery.JS with NodeJS backend

Here we are going to describe how to use [EasyQuery.JS](https://korzh.com/easyquery/javascript) framework to add an advanced search or ad hoc reporting functionality to your NodeJS application. 

As a result, you can get something similar to this [EasyQuery demo page](https://korzh.com/demo/easyquery-asp-net-core-razor/advanced-search).

## 0. Prerequisites.

To run this sample you will need the following programs/services be installed on your computer/server:

 * [Node.js](https://nodejs.org) version 7.0 or higher
 * [NET Core](http://dot.net) version 2.1 or higher. Please note: you will need .NET Core only to run **eqdm** tool (see more details below) 
and it's not necessary to run it exactly on the computer where you plan to set up this demo or on your production server.

Of course, to perform all the steps below you need to clone/download this repository first and open `{repository-folder}/eqs/js` folder on your hard drive.

## Step 1. Running a sample with the testing data

This folder contains almost all necessary parts to run and test the query builder web-page locally. 
It's preconfigured to run over the well-known Northwind demo database and already include an API key for the testing account on [SqlQueryBuilder.com](http://sqlquerybuilder.com) web-service (more about it later).

So, all you need to do is:

* Start `run.bat` script there (or consequently run `call npm install` and then `node EasyQuery.js` commands)
* Open `http://localhost:3200` in your browser and enjoy the demo.    

If everything went well you will see an "advanced search" page similar to [this one](https://korzh.com/demo/easyquery-asp-net-core-razor/advanced-search) 
and will be able to build a simple query and execute it. 
For example, add "Customer Company Name" and "Order Freight" columns in the "Columns" panel 
and a simple condition like "Customer Country is equal to USA" to the "Conditions" panel.

> If you encounter any problem with any of the steps described above please don't hesitate and [contact us](https://korzh.com/support).

## Step 2. Create a data model for your own database.
 
Now, when our sample web-page is set up and running well, you can move to the next step: 
getting the same behavior in your own web-application and for your own database.

As you possibly know (if not - please read [this article](https://korzh.com/easyquery/docs/fundamentals/how-it-works) first) EasyQuery components and widgets do not work with your database directly. 
Instead, they use a special user-friendly representation of your DB called *“data model”*.

Data model defines which entities and attributes your users can operate with when they build their queries. 
It allows to set user-friendly names for tables (entities), fields (attributes) and operators (like “is equal to” or “starts with”). 
Additionally, data model can contain a list of predefined values for some attribute - so your users will be able to select a value from a list instead of typing it manually.

.NET version of EasyQuery allows you to build a data model at run-time. 
On other platforms, you will need to create a data model “manually” using either our *eqdm* command-line utility (runs on Windows, Linux, and Mac) or *Data Model Editor* (DME) GUI application (available only for Windows).

Here are step-by-step instructions for both cases:

### Option 1: eqdm command line utility

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
 * You can also specify your model ID and its name in the config file. Alternatively, you can pass them in `eqdm` parameters as `--modelId:ModelID` and `--modelName:ModelName`.
 
4. Save the config file and start `eqdm` utility with `genmodel` comman:

```
eqdm genmodel --config=eqdm.json --modelId=YourModelID --modelName=YourModelName
```

When it's finished - you will find *YourModelID.xml* and *YourModelID.json* files in the same folder.


### Option 2: Data Model Editor (Windows only!)

* [Download](https://korzh.com/download/dme_setup.exe) and install Data Model Editor

* Run DME (DMEditor40.exe file)

* Select "Model | New" menu item.

* Type your model name (any), select the type of your database type (MS SQL, Oracle, MySQL, etc) and enter the connection string. 

If you don’t know how connection string may look like - use “Build connection” button and follow the wizard which helps you to set up a connection to your DB.
* Press OK in “New model” dialog and then follow the prompts that will appear to add tables, links, etc. Save your model to some XML file (Model | Save menu) for future use.

* Use “Model | Save as..” menu item to create a copy of your model file in JSON format (e.g. "MyModel.json"). 
Select “JSON” file type in “Save as type” field.

That’s all, close DME.

## Step 3. Connect your model and modify config.js script

Copy the JSON file with your model (built on step #2) into the same folder with `EasyQuery.js` file. This script processes all AJAX requests from EasyQuery widgets. 
The `config.js` file contains all the settings you may need to change in order to get your application worked:

```
SQBAPI_HOST: "http://sqlquerybuilder.com/",  //You will need to change this address in case of using a standalone (local) version of EasyQuery Server
SQBAPI_KEY: "XXXX-XXXXXXXXX-XXXX-XXXX", //Your API key for SQL Query Builder service 
MODEL_ID: "NWind"; //Your model's ID
```
Our sample script loads NWind.json model file. 
You will need to replace the values of `MODEL_ID` configuration parameter to the ID of your model and the name of JSON file created on the previous step (e.g. "MyModel").

The `config.js` file contains the database connection settings as well. By default they are set to connect to our public database sample, but you may change this as you need.

> Please note, this sample works with MySQL database. If you want to use some other type the database, you will need to modify the `EasyQuery.js` file accordingly.

### Step 4. Generating and executing SQL by the query defined in UI

EasyQuery.JS widgets send the query, defined on the client-side UI by the end-user in a JSON format. 
So, how do we get a correct SQL statement by this JSON representation of the query?   

Here is where our [SQL builder](http://sqlquerybuilder.com) web-service, comes to help.
This service implements a REST API that allows you to pass your query (as a JSON string) and get a correct SQL statement back.

To use it you need to get your API Key first and attach this key to any your request (in a Header section).

So, here are the instructions:
 * Open [SQL query builder](http://sqlquerybuilder.com) web-page and click on Register link.
 
 * Fill the form and click on the Register button to finish registration and get your API Key.
 
 * You will get your API key in a moment by email. Copy it into your `config.js` script:
```
SQBAPI_HOST: "http://sqlquerybuilder.com/";  
SQBAPI_KEY: "Your API key goes here";
```
* Then press “Add model” link, enter the ID of your model (the same as you set for `MODEL_ID` config setting above) and copy the content of the XML file created on step #2.
* Now you can send a POST request to `/api/3.0/SqlQueryBuilder` action when you need to get an SQL statement. Send the JSON representation of the query returned by EasyQuery widgets as the request's content.

So all you need to do now - is to execute this SQL statement over your database, return the result set back to the client-side in some format and show that result set to the user as a data grid or chart. In our NodeJS sample script you can find an example of such a JSON string with the result set.

In our demo web page, we show generated the SQL statement on any query change. 
Of course, you don’t need to do it in a production environment. Most possibly, you will hide it from users and show only the result table returned after SQL execution.


## Standalone (local) version of SQL query builder web-service

Our [SQL query builder](http://sqlquerybuilder.com) REST service</a> is free but has some limitations on the number of daily requests one user can send. 

To remove those limits or if you want to avoid using a third-party web-service for SQL generation - we have a local version of this service that you can install on your own Windows, Linux or Mac server.  
For more information please read [EasyQuery.JS web-page](https://korzh.com/easyquery/javascript).

Feel free to send a [support request](https://korzh.com/support) if you have any questions regarding EasyQuery widgets or SqlQueryBuilder.com web-service.
