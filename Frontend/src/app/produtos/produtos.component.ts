import { Component, OnInit, ViewChild } from '@angular/core';
import { Produto } from '../models/produto.models';

import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
// import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    TableModule, 
    CommonModule, 
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule
  ],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class Produtos implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  produtos: Produto[] = [];
  globalFilterFields: string[] = ['id', 'nome', 'codigoSKU', 'precoUnitario'];

  visible: boolean = false;

  descricao: string = '';
  sku: string = '';
  preco: number = 0;
  quantidade: number = 0;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    this.produtos = [];
    this.getProdutos();
  }

  async getProdutos()  {
    try {
      this.produtos = [];
      this.produtos = await this.apiService.getProdutos();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  filtrarProdutos(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dt2.filterGlobal(inputElement.value, 'contains');
  }

  async salvarProduto() {
    try {
      const maxId = this.produtos.length > 0 ? Math.max(...this.produtos.map(produto => produto.id)) : 0;

      const novoProduto: Produto = {
        id: maxId + 1,
        nome: this.descricao,
        codigoSKU: this.sku,
        precoUnitario: this.preco,
        saldoEstoque: this.quantidade
      }
      
      await this.apiService.cadastrarProduto(novoProduto);
      
      this.descricao = '';
      this.sku = '';
      this.preco = 0;
      this.quantidade = 0;

      this.getProdutos();

      this.visible = false; 

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }

  }

  fecharDialog() {  
    this.descricao = '';
    this.sku = '';
    this.preco = 0;
    this.quantidade = 0;

    this.visible = false; 
  }

  showDialog() {
    this.visible = true;
  }
  
}
