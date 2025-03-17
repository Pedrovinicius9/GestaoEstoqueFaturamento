using Faturamento.Services;

public class EstoqueService : IEstoqueService
{
    private readonly HttpClient _httpClient;

    public EstoqueService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> ValidarSaldoProduto(int produtoId, int quantidade)
    {
        var response = await _httpClient.GetAsync($"produtos/{produtoId}/validar-saldo?quantidade={quantidade}");
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<bool>();
        }
        return false;
    }

    public async Task BaixarSaldoProduto(int produtoId, int quantidade)
    {
        var response = await _httpClient.PostAsync($"produtos/{produtoId}/baixar-saldo?quantidade={quantidade}", null);
        response.EnsureSuccessStatusCode();
    }
}