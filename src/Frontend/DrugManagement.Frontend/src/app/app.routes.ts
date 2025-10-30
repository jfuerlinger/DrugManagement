import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DrugListComponent } from './components/drug-list/drug-list.component';
import { ShopListComponent } from './components/shop-list/shop-list.component';
import { PersonListComponent } from './components/person-list/person-list.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'drugs', component: DrugListComponent },
  { path: 'shops', component: ShopListComponent },
  { path: 'persons', component: PersonListComponent },
  { path: '**', redirectTo: '' }
];
