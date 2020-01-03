using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Mvc;

namespace ODataDemo.Controllers
{
    public abstract class NwindODataController<T>: ODataController where T: class
    {
        private readonly AppDbContext _db;

        public NwindODataController(AppDbContext db)
        {
            _db = db;
        }

        [EnableQuery]
        public IActionResult Get()
        {
            return Ok(_db.Set<T>().AsQueryable());
        }
    }
}
