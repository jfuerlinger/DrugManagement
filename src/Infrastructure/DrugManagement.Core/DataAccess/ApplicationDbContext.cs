using Microsoft.EntityFrameworkCore;
using DrugManagement.Core.Model;

namespace DrugManagement.Core.DataAccess
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Slot> Slots { get; set; }
        public DbSet<DrugMetadata> DrugMetadata { get; set; }
        public DbSet<DrugPackageSize> DrugPackageSizes { get; set; }
        public DbSet<Drug> Drugs { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Shop> Shops { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // DrugMetadata configuration
            modelBuilder.Entity<DrugMetadata>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
            });

            // DrugPackageSize configuration
            modelBuilder.Entity<DrugPackageSize>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.DrugMetadata)
                    .WithMany(d => d.PackageSizes)
                    .HasForeignKey(e => e.DrugMetaDataId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Person configuration
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Firstname).IsRequired();
                entity.Property(e => e.Lastname).IsRequired();
            });

            // Shop configuration
            modelBuilder.Entity<Shop>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
            });

            // Drug configuration
            modelBuilder.Entity<Drug>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Metadata)
                    .WithMany(d => d.Drugs)
                    .HasForeignKey(e => e.MetadataId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.DrugPackageSize)
                    .WithMany(d => d.Drugs)
                    .HasForeignKey(e => e.DrugPackageSizeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Shop)
                    .WithMany(s => s.Drugs)
                    .HasForeignKey(e => e.ShopId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.BoughtByPerson)
                    .WithMany(p => p.DrugsBought)
                    .HasForeignKey(e => e.BoughtBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.PersonConcernedPerson)
                    .WithMany(p => p.DrugsConcerned)
                    .HasForeignKey(e => e.PersonConcerned)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.AmountLeftAbsolute)
                    .HasPrecision(18, 2);

                entity.Property(e => e.AmountLeftInPercentage)
                    .HasPrecision(5, 2);
            });
        }
    }
}
