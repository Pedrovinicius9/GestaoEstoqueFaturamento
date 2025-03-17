using Microsoft.EntityFrameworkCore;
using Faturamento.Models;

namespace Faturamento.Data;

public class FaturamentoContext : DbContext
{
    public DbSet<NotaFiscal> NotasFiscais { get; set; }
    public DbSet<ItemNotaFiscal> ItemNotaFiscal { get; set; }

    public FaturamentoContext(DbContextOptions<FaturamentoContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NotaFiscal>()
            .HasMany(n => n.Itens)
            .WithOne()
            .HasForeignKey(i => i.NotaFiscalId);

        modelBuilder.Entity<ItemNotaFiscal>()
            .HasKey(i => i.Id);
    }
}