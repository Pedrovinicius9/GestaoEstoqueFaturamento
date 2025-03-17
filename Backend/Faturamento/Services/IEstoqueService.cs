namespace Faturamento.Services;

public interface IEstoqueService
{
    Task BaixarSaldoProduto(int produtoId, int quantidade);
}
