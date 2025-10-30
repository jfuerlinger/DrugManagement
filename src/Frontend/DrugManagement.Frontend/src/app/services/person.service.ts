import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);
  private apiUrl = '/api/persons';

  getAllPersons(): Observable<{ persons: Person[] }> {
    return this.http.get<{ persons: Person[] }>(this.apiUrl);
  }

  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }

  createPerson(person: Omit<Person, 'id'>): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person);
  }

  updatePerson(id: number, person: Partial<Person>): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/${id}`, person);
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
