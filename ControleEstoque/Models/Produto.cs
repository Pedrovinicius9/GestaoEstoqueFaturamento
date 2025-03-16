namespace ControleEstoque.Models;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string CodigoSKU { get; set; }
    public decimal PrecoUnitario { get; set; }
    public int SaldoEstoque { get; set; }
}