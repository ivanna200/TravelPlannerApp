using Microsoft.EntityFrameworkCore;
using TravelPlanService.Models;

namespace TravelPlanService.Data
{
    public class TravelPlanDbContext : DbContext
    {
        public TravelPlanDbContext(DbContextOptions<TravelPlanDbContext> options) : base(options) { }

        public DbSet<TravelPlan> TravelPlans { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Activity> Activities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TravelPlan>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
                entity.Property(t => t.Budget).HasPrecision(18, 2);
                entity.HasMany(t => t.Destinations)
                      .WithOne(d => d.TravelPlan)
                      .HasForeignKey(d => d.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(t => t.Activities)
                      .WithOne(a => a.TravelPlan)
                      .HasForeignKey(a => a.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Destination>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).IsRequired().HasMaxLength(200);
                entity.Property(d => d.Location).IsRequired().HasMaxLength(300);
            });

            modelBuilder.Entity<Activity>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
                entity.Property(a => a.EstimatedCost).HasPrecision(18, 2);
                entity.Property(a => a.Status).HasDefaultValue("Planirano");
            });
        }
    }
}