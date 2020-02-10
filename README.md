# EasyQuery.JS Samples

## Packages
|Package Name|NPM Latest|
|---|---|
|@easyquery/core|[![Npm](https://img.shields.io/npm/v/@easyquery/core/latest)](https://www.npmjs.com/package/@easyquery/core)|
|@easyquery/ui|[![Npm](https://img.shields.io/npm/v/@easyquery/ui/latest)](https://www.npmjs.com/package/@easyquery/ui)|
|@easyquery/odata|[![Npm](https://img.shields.io/npm/v/@easyquery/odata/latest)](https://www.npmjs.com/package/@easyquery/odata)|
|@easyquery/enterprise|[![Npm](https://img.shields.io/npm/v/@easyquery/enterprise/latest)](https://www.npmjs.com/package/@easyquery/enterprise)|

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | ![Without jQuery](https://i.ibb.co/ZKSGMjt/no-jquery-logo.jpg)
| --------- | --------- | --------- | --------- | --------- |
| IE11, Edge| last version| last version| last version | without jQuery |

## About EasyQuery.JS

EasyQuery.JS - is a JavaScript library designed to simplify different data-retrieval tasks, such as complex search, data filtering and ad hoc reporting. To see EasyQuery.JS in action - please visit our [online demos](https://korzh.com/demo/easyquery-asp-net-core-razor).

## About this repository

The main task of EasyQuery.JS - is to provide your application with a friendly UI for query building or data filtering. Of course to work with the data this library needs some server-side part. The most comprehensive server-side library that works with EasyQuery.JS is called [EasyQuery.NET](https://korzh.com/easyquery) and it's available for .NET platform. You can use it either in ASP.NET or ASP.NET Core solutions. Here are GitHub repositories that countains the source code for different .NET / .NET Core samples for EasyQuery:

* [ASP.NET Core samples](https://github.com/easyquery/AspNetCoreSamples)
* [ASP.NET, WPF, WinForms samples](https://github.com/easyquery/Net4Samples)

However, what you can do if your don't use neither ASP.NET nor ASP.NET Core on your backend?

There is a possibility to use EasyQuery.JS on other platforms as well and this repository contains several examples of such projects for Java, PHP and Node.JS.

## Directory structure

Currently, there are two main approaches of building sever-side solution that works with a EasyQuery.JS on the client-side: via OData and using EasyQuery Server.

So, that's why we have 2 main folders on the root level of this repository:

1. `odata` contains the samples that uses OData protocol to provide EasyQuery.JS with the neccessary meta-information, execute the queries and return the result sets.

2. `eqs` folder - there you can find the samples that requires EasyQuery Server (EQS) for their work. All those projects uses free [SqlQueryBuilder](http://sqlquerybuilder.com) web-service but it will work the same way if you install EQS on your own host.

For more information on how to set up and run a particular sample on your platform please read the README in the corresponding folder:

* [NodeJs EasyQuery.JSsample with EQS](https://github.com/easyquery/Samples/tree/master/eqs/NodeJS)

* [PHP EasyQuery.JS sample with EQS](https://github.com/easyquery/Samples/tree/master/eqs/NodeJS)

