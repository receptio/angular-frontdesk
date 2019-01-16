import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class WorkSpaceDescriptionService {

    private BASE_URL = 'http://localhost:8001/v1/description';

    constructor(private http: HttpClient) {}

    addArea(payload, query): Observable<any> {
        const queryString = this.stringfyQuery(query);
        const url = `${this.BASE_URL}/area/?${queryString}`;
        return this.http.post<User>(url, payload);
    }

    getAreas(query): Observable<any> {
        const queryString = this.stringfyQuery(query);
        const url = `${this.BASE_URL}/area/?${queryString}`;
        return this.http.get<User>(url);
    }

    stringfyQuery(query: {}): string{
        return Object.keys(query).map(key => key + '=' + query[key]).join('&');
    }
}
