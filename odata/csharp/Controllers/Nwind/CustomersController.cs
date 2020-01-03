using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNet.OData;
using ODataDemo.Models;

namespace ODataDemo.Controllers
{
    public class CustomersController : NwindODataController<Customer>
    {
        public CustomersController(AppDbContext db) : base(db)
        {
        }
    }
}
