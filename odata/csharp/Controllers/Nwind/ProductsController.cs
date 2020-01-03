using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class ProductsController : NwindODataController<Product>
    {
        public ProductsController(AppDbContext db) : base(db)
        {
        }
    }
}
