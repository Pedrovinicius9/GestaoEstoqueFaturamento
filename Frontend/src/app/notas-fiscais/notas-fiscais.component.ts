import { Component, OnInit, ViewChild } from '@angular/core';
import { Produto } from '../models/produto.models';
import { Nota } from '../models/nota.models';

import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { TreeSelectModule } from 'primeng/treeselect';
interface ProdutoSelecionado {
  produtoId: any;
  quantidade: number | null;
}
@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [
    TableModule, 
    CommonModule, 
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    FormsModule,
    ProgressSpinnerModule,
    MessagesModule,
    TreeSelectModule,
  ],
  templateUrl: './notas-fiscais.component.html',
  styleUrl: './notas-fiscais.component.css'
})

export class NotasFiscais implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  notas: Nota[] = [];
  produtos: any[] = [];
  globalFilterFields: string[] = ['id', 'nome', 'codigoSKU', 'precoUnitario'];

  produtosParaSelect: any[] = [];
  produtosSelecionados: ProdutoSelecionado[] = [{ produtoId: null, quantidade: null }];

  messages: Message[] = [];

  loading: boolean = true;
  visible: boolean = false;
  dialogBaixa: boolean = false;
  dialogNota: boolean = false;

  data: string = '';
  quantidade : number = 0;

  notaSelecionada: Nota | null = null;;


  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    const year = today.getFullYear();
  
    this.data = `${day}/${month}/${year}`;

    this.notas = [];
    this.getNotas();
    this.getProdutos();
  }

  async getNotas()  {
    try {
      this.notas = [];
      this.notas = await this.apiService.getNotas();
      console.log(this.notas);
      
      this.loading = false;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  async getProdutos()  {
    try {
      this.produtos = [];
      this.produtos = await this.apiService.getProdutos();
      this.produtosParaSelect = this.produtos.map(produto => ({
        label: `${produto.codigoSKU} - ${produto.nome}`,
        value: produto.id
      }));
      this.loading = false;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  filtrarProdutos(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dt2.filterGlobal(inputElement.value, 'contains');
  }

  getProdutosDisponiveis(index: number) {
    const idsJaSelecionados = this.produtosSelecionados
      .filter((item, i) => i !== index && item.produtoId !== null)
      .map(item => item.produtoId);
    
    return this.produtosParaSelect.filter(produto => !idsJaSelecionados.includes(produto.value));
  }

  adicionarNovoProduto() {
    this.produtosSelecionados.push({ produtoId: null, quantidade: null });
  }

  async salvarNota() {
    this.loading = true;

    try {
      const maxId = this.notas.length > 0 ? Math.max(...this.notas.map(produto => Number(produto.numeroNota))) : 0;

      const novaNota: Nota = {
        numeroNota: (maxId + 1).toString(),
        data: this.data,
        itens: this.produtosSelecionados
          .filter(item => item.produtoId && item.quantidade)
          .map(item => ({
            produtoId: Number(item.produtoId.value),
            quantidade: item.quantidade
          })),
        ValorTotal: this.calcularValorTotal()
      };
      
      await this.apiService.cadastrarNota(novaNota);
      
      this.data = '';
      this.quantidade = 0;
      this.produtosSelecionados = [{ produtoId: null, quantidade: null }];

      this.getNotas();

      this.messages = [
        {severity:'success', summary: 'Sucesso', detail:'Nota cadastrada com sucesso!', life: 3000},
      ];

      this.loading = false;
      this.visible = false; 

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);

      this.messages = [
        {severity:'error', summary: 'Erro', detail:'Erro ao cadastrar produto!', life: 3000},
      ];

      this.loading = false;
    }
  }

  async baixarNota(id?: string) {
    if (!id) return;
    this.loading = true;
    try {
      const response = await this.apiService.baixarNota(Number(id));
      
      // Check if the response indicates an error
      if (response && response.error) {
        throw new Error(response.error);
      }
      
      this.messages = [
        {severity:'success', summary: 'Sucesso', detail:'Nota baixada com sucesso!', life: 3000},
      ];
      
      this.dialogBaixa = false; 
      this.loading = false;
      this.getNotas(); 
      
    } catch (error : any) {
      console.error('Erro ao baixar nota:', error);
      this.dialogBaixa = false;
      this.loading = false;
      this.messages = [
        {severity:'error', summary: 'Erro', detail: error.message || 'Erro ao baixar nota!', life: 3000},
      ];
    }
  }

  getProdutoNome(produtoId: number): string {
    const produto = this.produtos.find(p => p.id === produtoId);
    return produto ? produto.nome : '';
  }

  getValorProduto(produtoId: number, quantidade: number): number {
    const produto = this.produtos.find(p => p.id === produtoId);
    return produto ? produto.precoUnitario * quantidade : 0;
  }
  
  getValorTotal(): number {
    return this.notaSelecionada?.itens.reduce((total, item) => {
      return total + this.getValorProduto(item.produtoId, item.quantidade);
    }, 0) || 0;
  }

  calcularValorTotal(): number {
    return this.produtosSelecionados
      .filter(item => item.produtoId && item.quantidade)
      .reduce((total, item) => {
        const produto = this.produtos.find(p => p.id === Number(item.produtoId.value));
        if (produto) {
          return total + (produto.precoUnitario * Number(item.quantidade || 0));
        }
        return total;
      }, 0);
  }

  fecharDialog() {  
    // this.descricao = '';
    // this.sku = '';
    // this.preco = 0;
    // this.quantidade = 0;

    this.visible = false; 
    this.dialogBaixa = false;
  }

  showDialog() {
    this.visible = true;
  } 

  showDialogBaixa(nota : Nota) {
    this.dialogBaixa = true;
    
    this.notaSelecionada = nota;
  } 

  showDialogNota(nota : Nota) {
    this.dialogNota = true;
    
    this.notaSelecionada = nota;
  } 
}
