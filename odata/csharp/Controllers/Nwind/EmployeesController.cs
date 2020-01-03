using ODataDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ODataDemo.Controllers
{
    public class EmployeesController : NwindODataController<Employee>
    {
        public EmployeesController(AppDbContext db) : base(db)
        {
        }
    }
}
