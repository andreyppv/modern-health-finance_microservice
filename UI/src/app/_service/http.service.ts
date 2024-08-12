import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  salesapiurl = environment.salesapiurl;
  adminapiurl = environment.adminapiurl;
  borrowerapiurl = environment.borrowerapiurl;
  getMainColor: EventEmitter<any> = new EventEmitter<any>();
  practiceMainColor = '#fff';
  practiceSecondaryColor = '#fff';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  geturl(url, key) {
    let nurl = '';
    switch (key) {
      case 'sales':
        nurl = this.salesapiurl + url;
        break;
      case 'admin':
        nurl = this.adminapiurl + url;
        break;
      case 'borrower':
        nurl = this.borrowerapiurl + url;
        break;
    }
    return nurl;
  }
  gettoken(key) {
    let token = '';
    switch (key) {
      case 'admin':
        token = 'Bearer ' + sessionStorage.getItem('admin_token');
        break;
      case 'borrower':
        token = 'Bearer ' + sessionStorage.getItem('borrower_token');
        break;
    }
    return token;
  }

  get(url, key) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);

    return this.http.get(nurl, options);
  }

  post(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.post(nurl, data, options);
  }
  patch(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.patch(nurl, data, options);
  }
  files(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('dataType', 'jsonp')
      .set('Access-Control-Allow-Origin', '*')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.post(nurl, data, options);
  }

  authfiles(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('dataType', 'jsonp')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('UserId', sessionStorage.getItem('UserId'));
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.post(nurl, data, options);
  }

  authget(url, key) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('UserId', sessionStorage.getItem('UserId'));

    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    console.log(this.http.get(nurl, options));
    return this.http.get(nurl, options);
   
  }

  authpost(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('UserId', sessionStorage.getItem('UserId'));

    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.post(nurl, data, options);
  }

  authpatch(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('UserId', sessionStorage.getItem('UserId'));

    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.patch(nurl, data, options);
  }
  authput(url, key, data) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('UserId', sessionStorage.getItem('UserId'));

    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.put(nurl, data, options);
  }
  put(url, key, data) {
    let nurl = this.geturl(url, key);
    return this.http.put(nurl, data);
  }
  logout() {
    sessionStorage.clear();
    location.reload();
  }
  addlog(module, loan_id, key) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let data = {
      module: module,
      loan_id: loan_id,
    };
    let nurl = '';
    switch (key) {
      case 'admin':
        data['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id'];
        nurl = this.geturl('pending/addlogs', key);
        return this.http.post(nurl, data, options);
        break;
      case 'borrower':
        data['user_id'] = sessionStorage.getItem('UserId');
        nurl = this.geturl('overview/addlogs', key);
        return this.http.post(nurl, data, options);
        break;
      case 'installer':
        data['user_id'] = sessionStorage.getItem('InstallerUserId');
        nurl = this.geturl('users/addlogs', key);
        return this.http.post(nurl, data, options);
        break;
    }
  }
  addLoginLog(key) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let data = {};
    let nurl = '';
    switch (key) {
      case 'admin':
        data['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id'];
        nurl = this.geturl('pending/addloginlogs', key);
        return this.http.post(nurl, data, options);
        break;
      case 'borrower':
        data['user_id'] = sessionStorage.getItem('UserId');
        nurl = this.geturl('overview/addloginlogs', key);
        return this.http.post(nurl, data, options);
        break;
      case 'installer':
        data['user_id'] = sessionStorage.getItem('InstallerUserId');
        nurl = this.geturl('logs/addloginlogs', key);
        return this.http.post(nurl, data, options);
        break;
    }
  }
  authdelete(url, key) {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key))
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
    let options = {
      headers: httpHeaders,
    };
    let nurl = this.geturl(url, key);
    return this.http.delete(nurl, options);
  }
  showSuccess(msg: string) {
    this.toastr.success(msg);
  }
  showError(error) {
    this.toastr.error(error);
  }
  download(url, key): Observable<Blob> {
    let httpHeaders = new HttpHeaders()
      .set('dataType', 'jsonp')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', this.gettoken(key));
    let nurl = this.geturl(url, key);
    return this.http.get(nurl, { headers: httpHeaders, responseType: 'blob' });
  }
}
