namespace Faturamento.Services;

public interface IEstoqueService
{
    Task<bool> ValidarSaldoProduto(int produtoId, int quantidade);
    Task BaixarSaldoProduto(int produtoId, int quantidade);
}
