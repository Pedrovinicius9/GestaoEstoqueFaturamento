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
        // Verificar se o produto já existe pelo Código de Referência (SKU)
        var produtoExistente = await _context.Produtos
            .FirstOrDefaultAsync(p => p.CodigoSKU == produto.CodigoSKU);

        if (produtoExistente != null)
        {
            // Se o produto já existe, atualize o saldo de estoque
            produtoExistente.SaldoEstoque += produto.SaldoEstoque;
            _context.Produtos.Update(produtoExistente);
        }
        else
        {
            // Se o produto não existe, cadastre-o
            if (produto.SaldoEstoque < 0)
                return BadRequest("O saldo inicial do produto não pode ser negativo.");

            _context.Produtos.Add(produto);
        }

        // Salvar as alterações no banco de dados
        await _context.SaveChangesAsync();

        return Ok(produtoExistente ?? produto);
    }
}