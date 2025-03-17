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
        // Validar se o número da nota já existe
        if (_context.NotasFiscais.Any(n => n.NumeroNota == notaFiscalDTO.NumeroNota))
            return BadRequest("Número da nota já existe.");

        // Validar se há pelo menos um item
        if (notaFiscalDTO.Itens == null || !notaFiscalDTO.Itens.Any())
            return BadRequest("A nota fiscal deve ter pelo menos um item.");

        // Criar a nota fiscal
        var notaFiscal = new NotaFiscal
        {
            NumeroNota = notaFiscalDTO.NumeroNota,
            Status = "aberto"
        };

        // Adicionar os itens à nota fiscal
        foreach (var itemDTO in notaFiscalDTO.Itens)
        {
            var item = new ItemNotaFiscal
            {
                ProdutoId = itemDTO.ProdutoId,
                Quantidade = itemDTO.Quantidade,
                NotaFiscalId = notaFiscal.Id // Relacionamento com a nota fiscal
            };
            notaFiscal.Itens.Add(item);
        }

        // Salvar a nota fiscal e os itens no banco de dados
        _context.NotasFiscais.Add(notaFiscal);
        await _context.SaveChangesAsync();

        return Ok(notaFiscal);
    }

    [HttpPost("{id}/imprimir")]
    public async Task<IActionResult> ImprimirNotaFiscal(int id)
    {
        // Buscar a nota fiscal pelo ID
        var notaFiscal = await _context.NotasFiscais
            .Include(n => n.Itens)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notaFiscal == null)
            return NotFound("Nota fiscal não encontrada.");

        if (notaFiscal.Status != "aberto")
            return BadRequest("A nota fiscal já foi baixada.");

        // Verificar o saldo de cada item
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

        // Se houver produtos com saldo insuficiente, retornar erro
        if (produtosComSaldoInsuficiente.Any())
        {
            return BadRequest(new
            {
                Message = "Saldo insuficiente para os seguintes produtos:",
                Produtos = produtosComSaldoInsuficiente
            });
        }

        // Dar baixa no estoque dos produtos
        foreach (var item in notaFiscal.Itens)
        {
            var produto = await _estoqueContext.Produtos.FindAsync(item.ProdutoId);
            produto.SaldoEstoque -= item.Quantidade;
            _estoqueContext.Produtos.Update(produto);
        }

        // Atualizar o status da nota fiscal para "baixada"
        notaFiscal.Status = "baixada";
        _context.NotasFiscais.Update(notaFiscal);

        // Salvar as alterações no banco de dados
        await _context.SaveChangesAsync();
        await _estoqueContext.SaveChangesAsync();

        return Ok(new
        {
            Message = "Nota fiscal baixada com sucesso.",
            NotaFiscal = notaFiscal
        });
    }
}