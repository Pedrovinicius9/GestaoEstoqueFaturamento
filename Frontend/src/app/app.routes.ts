import { Routes } from '@angular/router';
import { Produtos } from './produtos/produtos.component';
import { NotasFiscais } from './notas-fiscais/notas-fiscais.component';

export const routes: Routes = [
  { path: '', component: Produtos },
  { path: 'notas', component: NotasFiscais },
];