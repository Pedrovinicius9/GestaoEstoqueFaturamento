import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7275/api';

  constructor() {}

  // Endpoint para listar todos os produtos
  async getProdutos() : Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/produtos`);
      console.log('Dados recebidos da API:', response.data);
      return response.data as any[]; 
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }

  // Endpoint para cadastrar um novo produto
  async cadastrarProduto(produto: any) : Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/produtos`, produto);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      throw error;
    }
  }
}
