import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shop } from '../models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private http = inject(HttpClient);
  private apiUrl = '/api/shops';

  getAllShops(): Observable<{ shops: Shop[] }> {
    return this.http.get<{ shops: Shop[] }>(this.apiUrl);
  }

  getShopById(id: number): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/${id}`);
  }

  createShop(shop: Omit<Shop, 'id'>): Observable<Shop> {
    return this.http.post<Shop>(this.apiUrl, shop);
  }

  updateShop(id: number, shop: Partial<Shop>): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiUrl}/${id}`, shop);
  }

  deleteShop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
