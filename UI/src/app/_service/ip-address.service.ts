import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IpAddressService {

  constructor(
    private http:HttpClient
  ) { }

  public getIPAddress()
  {
    return this.http.get("https://api.ipify.org/?format=json");
  }
}
