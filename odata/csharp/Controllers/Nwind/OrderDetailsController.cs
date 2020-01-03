using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class OrderDetailsController : NwindODataController<OrderDetail>
    {
        public OrderDetailsController(AppDbContext db) : base(db)
        {
        }
    }
}
