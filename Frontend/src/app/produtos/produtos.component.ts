import { Component, OnInit, ViewChild } from '@angular/core';
import { Produto } from '../models/produto.models';

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

@Component({
  selector: 'app-produtos',
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
  ],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class Produtos implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  produtos: Produto[] = [];
  globalFilterFields: string[] = ['id', 'nome', 'codigoSKU', 'precoUnitario'];

  messages: Message[] = [];

  loading: boolean = true;
  visible: boolean = false;

  descricao: string = '';
  sku: string = '';
  preco: number = null || 0;
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
      this.loading = false;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  filtrarProdutos(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dt2.filterGlobal(inputElement.value, 'contains');
  }

  async salvarProduto() {
    this.loading = true;

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

      this.messages = [
        {severity:'success', summary: 'Sucesso', detail:'Produto cadastrado com sucesso!', life: 3000},
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