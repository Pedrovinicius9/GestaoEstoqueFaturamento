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

  // Endpoint para listar todas as notas fiscais
  async getNotas() : Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/NotasFiscais`);
      return response.data as any[]; 
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }

  // Endpoint para cadastrar uma nova nota fiscal
  async cadastrarNota(nota: any) : Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/NotasFiscais`, nota);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar nota:', error);
    }
  }

  // Endoint para baixar nota fiscal
  async baixarNota(id: any) : Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/NotasFiscais/${id}/imprimir`);
      return response.data;
    } catch (error : any) {
      console.error('Erro ao baixar nota:', error);
      throw error.response?.data || error;
    }
  }
}