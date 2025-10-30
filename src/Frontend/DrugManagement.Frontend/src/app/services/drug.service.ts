import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Drug } from '../models/drug.model';

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private http = inject(HttpClient);
  private apiUrl = '/api/drugs';

  getAllDrugs(): Observable<{ drugs: Drug[] }> {
    return this.http.get<{ drugs: Drug[] }>(this.apiUrl);
  }

  getDrugById(id: number): Observable<Drug> {
    return this.http.get<Drug>(`${this.apiUrl}/${id}`);
  }

  createDrug(drug: Omit<Drug, 'id'>): Observable<Drug> {
    return this.http.post<Drug>(this.apiUrl, drug);
  }

  updateDrug(id: number, drug: Partial<Drug>): Observable<Drug> {
    return this.http.put<Drug>(`${this.apiUrl}/${id}`, drug);
  }

  deleteDrug(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
