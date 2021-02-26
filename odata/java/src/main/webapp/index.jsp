<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EasyQuery.JS OData + Java Demo</title>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"
              crossorigin="anonymous"
              integrity="sha256-eSi1q2PG6J7g7ib17yAaWMcrr5GrtohYChqibrV7PBE=" />

        <link rel="stylesheet" href="https://cdn.korzh.com/eq/7.0.0/eq.core.min.css">

        <link rel="stylesheet" href="css/site.css" />
            
    </head>
    <body>

        <header class="navbar border-bottom mb-3 p-0 container-fluid px-5">
            <div class="header my-2">
                <a href="~/"><div class="logo-title">EasyQuery.JS OData + Java Demo</div></a>
            </div>
        </header>

        <div class="global-message"></div>
    
        <div class="container">
            <h2>Orders</h2>
            <div id="ProcessBar" class="eqjs-process-bar" style="display: none;"></div>
            <div id="FilterBar"  class="eqjs-fb-container"></div>  
            <div id="ResultPanel"></div>
        </div>
    
        <footer class="footer container-fluid px-5">
            <div class="float-right">Powered by <a href="https://korzh.com/easyquery">EasyQuery</a></div>
            <div>Copyright 2020 (c) <a href="https://korzh.com">Korzh.com</a></div>
        </footer>
    
         <!-- EasyQuery script -->
    <!--<script src="https://cdn.korzh.com/eq/7.0.0/eq.community.min.js"></script>-->
    <script src="https://cdn.korzh.com/eq/7.0.0/eq.enterprise.min.js"></script>
    <script src="https://cdn.korzh.com/eq/7.0.0/eq.odata.js"></script>

    <script>
        window.addEventListener('load', function () {
            let options = {
                //Load model on start
                loadModelOnStart: true,
                //hadlers
                handlers: {
                    //override error handler
                    onError: function (message) {
                        alert("Error: " + message.text)
                    }
                },
                //Different widgets options
                widgets: {
                    //FilterBar options
                    filterBar: {
                        queryPanel: {
                            attrElementFormat: "{entity} {attr}"
                        }
                    },
                    //Grid options
                    resultGrid: {
                        tableClass: "table table-sm"
                    }
                },
                result: {
                    //do not clear result on each query chage
                    clearResultOnQueryChange: false,
                    paging: {
                        useBootstrap: true,
                        enabled: true
                    }
                }
            };
            var view = new easyquery.ui.DataFilterView();
            var context = view.getContext();
            context.useEnterprise('M-Vm5PXqfpFr0P6bDruZ2wBIJ1H334')
            context.useOData({
                    endpoint: 'NWind.svc',
                    fromType: {
                        entityType: 'Nwind.Order',
                        depth: 3
                    }
                });

            // after model loaded we add default columns
            context.addEventListener('initialModelLoad', function (model) {
                var query = context.getQuery();
                addDefaultColumns(query);
            });
            
            view.init(options);
            document['view'] = view;
        });

        function addDefaultColumns(query) {
            //add columns you would like to display
            var columns = [
                {
                    attributeId: "Customer.ContactTitle",
                    caption: "Customer's contact title"
                },
                {
                    attributeId: "Customer.Address",
                    caption: "Customer's Address"
                },
                {
                    attributeId: "Order.Freight",
                    caption: "Freight"
                },
                {
                    attributeId: "Order.ShipCountry",
                    caption: "Ship to country"
                },
                {
                    attributeId: "Order.OrderDate",
                    caption: "Ordered date"
                },
                {
                    attributeId: "Employee.FirstName",
                    caption: "Employee's first name"
                },
                {
                    attributeId: "Employee.LastName",
                    caption: "Employee's last name"
                }
            ];
            for (let column of columns) {
                try {
                    query.addColumn(column);
                }
                catch {
                    console.error("Cannot add column: " + column.attributeId);
                }
            }
        }
    </script>
    
    </body>
</html>
