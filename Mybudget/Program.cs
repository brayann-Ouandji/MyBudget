using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Mybudget.Data;
using Mybudget.Models;
var builder = WebApplication.CreateBuilder(args);
/*builder.Services.AddDbContext<MybudgetContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MybudgetContext") ?? throw new InvalidOperationException("Connection string 'MybudgetContext' not found.")));*/
var cs = builder.Configuration.GetConnectionString("MybudgetContext");

builder.Services.AddDbContext<MybudgetContext>(options =>
    options.UseMySql(cs ?? throw new InvalidOperationException("Connection string 'MybudgetContext' not found."), ServerVersion.AutoDetect(cs)));
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDistributedMemoryCache(); // stockage session en RAM
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/api/auth/login";
        options.LogoutPath = "/api/auth/logout";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseSession();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var serviceScope = app.Services.GetService<IServiceScopeFactory>().CreateScope())
{
    var context = serviceScope.ServiceProvider.GetRequiredService<MybudgetContext>();
    //context.Database.EnsureDeleted();
    context.Database.EnsureCreated();
}
app.Run();
