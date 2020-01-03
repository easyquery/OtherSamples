using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Extensions;
using Microsoft.OData.Edm;
using Microsoft.AspNet.OData.Builder;

using ODataDemo.Models;
using ODataDemo.Services;

namespace ODataDemo
{
    public class Startup
    {

        private string _dataPath;

        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            this._dataPath = System.IO.Path.Combine(env.ContentRootPath, "App_Data");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("EqDemoDb")));

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAny",
                builder =>
                {
                    builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                });
            });

            services.AddOData(); 
            services.AddODataQueryFilter();

            services.AddMvc(op => op.EnableEndpointRouting = false)
                    .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseCors("AllowAny");

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.Select().Expand()
                      .Filter().Count()
                      .OrderBy().SkipToken()
                      .MaxTop(null);

                routes.MapODataServiceRoute("odata", "odata", GetEdmModel(app.ApplicationServices));
            });


            app.EnsureDbInitialized(Configuration, env);
        }

        private static IEdmModel GetEdmModel(IServiceProvider serviceProvider)
        {
            var builder = new ODataConventionModelBuilder(serviceProvider);
            builder.EntitySet<Category>("Categories")
              .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Customer>("Customers")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Employee>("Employees")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Product>("Products")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Shipper>("Shippers")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Supplier>("Suppliers")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<Order>("Orders")
                .EntityType.HasKey(e => e.Id);

            builder.EntitySet<OrderDetail>("OrderDetails")
                .EntityType.HasKey(e => e.OrderID)
                           .HasKey(e => e.ProductID);

            return builder.GetEdmModel();
        }
    }
}
