using Microsoft.AspNetCore.Mvc;
using ControleEstoque.Data;
using ControleEstoque.Models;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ProdutosController : ControllerBase
{
    private readonly EstoqueContext _context;

    public ProdutosController(EstoqueContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> ListarProdutos()
    {
        var produtos = await _context.Produtos.ToListAsync();
        return Ok(produtos);
    }

    [HttpPost]
    public async Task<IActionResult> CadastrarProduto([FromBody] Produto produto)
    {
        var produtoExistente = await _context.Produtos
            .FirstOrDefaultAsync(p => p.CodigoSKU == produto.CodigoSKU);

        if (produtoExistente != null)
        {
            produtoExistente.SaldoEstoque += produto.SaldoEstoque;
            _context.Produtos.Update(produtoExistente);
        }
        else
        {
            if (produto.SaldoEstoque < 0)
                return BadRequest("O saldo inicial do produto não pode ser negativo.");

            _context.Produtos.Add(produto);
        }

        await _context.SaveChangesAsync();

        return Ok(produtoExistente ?? produto);
    }
}