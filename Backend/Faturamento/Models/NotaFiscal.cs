namespace Faturamento.Models;

public class NotaFiscal
{
    public int Id { get; set; }
    public string NumeroNota { get; set; }
    public string Status { get; set; } = "aberto";
    public string Data { get; set; }
    public decimal ValorTotal { get; set; }
    public List<ItemNotaFiscal> Itens { get; set; } = new();
}