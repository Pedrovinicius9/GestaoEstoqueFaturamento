using Faturamento.Data;
using ControleEstoque.Data; // Adicione o namespace do ControleEstoque
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Registrar o FaturamentoContext
builder.Services.AddDbContext<FaturamentoContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Registrar o EstoqueContext
builder.Services.AddDbContext<EstoqueContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();