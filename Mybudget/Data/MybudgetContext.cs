using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Mybudget.Models;
using MyBudget.Models;

namespace Mybudget.Data
{
    public class MybudgetContext : DbContext
    {
        public MybudgetContext (DbContextOptions<MybudgetContext> options)
            : base(options)
        {
        }

        public DbSet<Mybudget.Models.Budget> Budget { get; set; } = default!;
        public DbSet<MyBudget.Models.Categorie> Categorie { get; set; } = default!;
        public DbSet<MyBudget.Models.Transaction> Transaction { get; set; } = default!;
        public DbSet<MyBudget.Models.Utilisateur> Utilisateur { get; set; } = default!;
    }
}
