using Microsoft.EntityFrameworkCore;
using ControleEstoque.Models;

namespace ControleEstoque.Data;

public class EstoqueContext : DbContext
{
    public DbSet<Produto> Produtos { get; set; }

    public EstoqueContext(DbContextOptions<EstoqueContext> options) : base(options) { }
}