namespace Faturamento.DTOs;

public class NotaFiscalDTO
{
    public string NumeroNota { get; set; }

    public string Data { get; set; }
    public List<ItemNotaFiscalDTO> Itens { get; set; } = new();
}

public class ItemNotaFiscalDTO
{
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
}