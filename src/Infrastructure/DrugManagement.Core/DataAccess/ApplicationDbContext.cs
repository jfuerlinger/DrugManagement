using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.Model;

namespace DrugManagement.Core.DataAccess
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Slot> Slots { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
    }
}
