﻿namespace Faturamento.Models;
public class ItemNotaFiscal
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public int NotaFiscalId { get; set; } 
}