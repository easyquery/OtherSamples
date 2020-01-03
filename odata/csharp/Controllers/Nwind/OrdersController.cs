using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class OrdersController: NwindODataController<Order>
    {
        public OrdersController(AppDbContext db) : base(db)
        {
        }
    }
}
