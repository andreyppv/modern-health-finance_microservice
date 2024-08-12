import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({ providedIn: "root" })
export class JwtInterceptor implements HttpInterceptor {
    constructor(private spinner: NgxSpinnerService){}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.spinner.show();
       
        return next.handle(request)
        .pipe(tap ((result)=>{
        },(error)=>{
            if(error['error']['message']=='Token error: jwt expired'){
                sessionStorage.clear()
                location.reload();
            }
            //console.log(error) 
        }),finalize(()=>{
            this.spinner.hide();
        }));
    }
}