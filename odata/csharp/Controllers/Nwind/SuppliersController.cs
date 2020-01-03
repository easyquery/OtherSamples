using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class SuppliersController : NwindODataController<Supplier>
    {
        public SuppliersController(AppDbContext db) : base(db)
        {
        }
    }
}
