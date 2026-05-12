using Microsoft.EntityFrameworkCore;
using ChecklistService.Models;

namespace ChecklistService.Data
{
    public class ChecklistDbContext : DbContext
    {
        public ChecklistDbContext(DbContextOptions<ChecklistDbContext> options) : base(options) { }

        public DbSet<ChecklistItem> ChecklistItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ChecklistItem>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(300);
                entity.Property(c => c.IsCompleted).HasDefaultValue(false);
            });
        }
    }
}