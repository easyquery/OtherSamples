using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Mvc;
using ODataDemo.Models;

namespace ODataDemo.Controllers
{

    public class CategoriesController : NwindODataController<Category>
    {
        public CategoriesController(AppDbContext db): base(db)
        {
        }
    }
}
