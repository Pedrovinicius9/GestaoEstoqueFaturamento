using Microsoft.AspNetCore.Mvc;
using Faturamento.Data;
using Faturamento.Models;
using Microsoft.EntityFrameworkCore;
using Faturamento.Services;
using Faturamento.DTOs;
using ControleEstoque.Data;

[Route("api/[controller]")]
[ApiController]
public class NotasFiscaisController : ControllerBase
{
    private readonly FaturamentoContext _context;
    private readonly EstoqueContext _estoqueContext; 

    public NotasFiscaisController(FaturamentoContext context, EstoqueContext estoqueContext)
    {
        _context = context;
        _estoqueContext = estoqueContext;
    }

    [HttpGet]
    public async Task<IActionResult> ListarNotasFiscais()
    {
        var notasFiscais = await _context.NotasFiscais
            .Include(n => n.Itens)
            .ToListAsync();
        return Ok(notasFiscais);
    }

    [HttpPost]
    public async Task<IActionResult> CriarNotaFiscal([FromBody] NotaFiscalDTO notaFiscalDTO)
    {
        if (_context.NotasFiscais.Any(n => n.NumeroNota == notaFiscalDTO.NumeroNota))
            return BadRequest("Número da nota já existe.");

        if (notaFiscalDTO.Itens == null || !notaFiscalDTO.Itens.Any())
            return BadRequest("A nota fiscal deve ter pelo menos um item.");

        var notaFiscal = new NotaFiscal
        {
            NumeroNota = notaFiscalDTO.NumeroNota,
            Status = "aberto",
            Data = notaFiscalDTO.Data,
            ValorTotal = notaFiscalDTO.ValorTotal
        };

        foreach (var itemDTO in notaFiscalDTO.Itens)
        {
            var item = new ItemNotaFiscal
            {
                ProdutoId = itemDTO.ProdutoId,
                Quantidade = itemDTO.Quantidade,
                NotaFiscalId = notaFiscal.Id 
            };
            notaFiscal.Itens.Add(item);
        }

        _context.NotasFiscais.Add(notaFiscal);
        await _context.SaveChangesAsync();

        return Ok(notaFiscal);
    }

    [HttpPost("{id}/imprimir")]
    public async Task<IActionResult> ImprimirNotaFiscal(int id)
    {
        var notaFiscal = await _context.NotasFiscais
            .Include(n => n.Itens)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notaFiscal == null)
            return NotFound("Nota fiscal não encontrada.");

        if (notaFiscal.Status != "aberto")
            return BadRequest("A nota fiscal já foi baixada.");

        var produtosComSaldoInsuficiente = new List<string>();

        foreach (var item in notaFiscal.Itens)
        {
            var produto = await _estoqueContext.Produtos.FindAsync(item.ProdutoId);
            if (produto == null)
                return NotFound($"Produto ID {item.ProdutoId} não encontrado.");

            if (produto.SaldoEstoque < item.Quantidade)
            {
                produtosComSaldoInsuficiente.Add($"Produto ID {item.ProdutoId}: Saldo insuficiente (Saldo: {produto.SaldoEstoque}, Necessário: {item.Quantidade})");
            }
        }

        if (produtosComSaldoInsuficiente.Any())
        {
            return BadRequest(new
            {
                Message = "Produtos com saldo insuficiente:",
                Produtos = produtosComSaldoInsuficiente
            });
        }

        foreach (var item in notaFiscal.Itens)
        {
            var produto = await _estoqueContext.Produtos.FindAsync(item.ProdutoId);
            produto.SaldoEstoque -= item.Quantidade;
            _estoqueContext.Produtos.Update(produto);
        }

        notaFiscal.Status = "baixada";
        _context.NotasFiscais.Update(notaFiscal);

        await _context.SaveChangesAsync();
        await _estoqueContext.SaveChangesAsync();

        return Ok(new
        {
            Message = "Nota fiscal baixada com sucesso.",
            NotaFiscal = notaFiscal
        });
    }
}