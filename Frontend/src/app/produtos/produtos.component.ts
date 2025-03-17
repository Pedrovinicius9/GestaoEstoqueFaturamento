import { Component, OnInit} from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class Produtos {

}
