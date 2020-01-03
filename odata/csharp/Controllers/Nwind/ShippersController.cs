using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class ShippersController : NwindODataController<Shipper>
    {
        public ShippersController(AppDbContext db) : base(db)
        {
        }
    }
}
