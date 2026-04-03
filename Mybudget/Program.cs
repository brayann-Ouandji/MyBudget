using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;

var builder = WebApplication.CreateBuilder(args);

var cs = builder.Configuration.GetConnectionString("MybudgetContext");

builder.Services.AddDbContext<MybudgetContext>(options =>
    options.UseMySql(cs ?? throw new InvalidOperationException("Connection string 'MybudgetContext' not found."),
    ServerVersion.AutoDetect(cs)));

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        // Ignore les références circulaires au lieu de planter
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDistributedMemoryCache();
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); //  redirige HTTP vers HTTPS
app.UseStaticFiles();      //  sert les fichiers de wwwroot
app.UseSession();          //  active les sessions
app.UseAuthentication();   //  vérifie qui tu es
app.UseAuthorization();    //  vérifie ce que tu as le droit de faire
app.MapControllers();      // route vers les contrôleurs

#pragma warning disable CS8602 // Déréférencement d'une éventuelle référence null.
using (var scope = app.Services.GetService<IServiceScopeFactory>().CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MybudgetContext>();
    context.Database.EnsureCreated();
}
#pragma warning restore CS8602 // Déréférencement d'une éventuelle référence null.

app.Run();
