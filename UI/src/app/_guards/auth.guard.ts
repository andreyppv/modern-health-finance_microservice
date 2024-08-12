import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


@Injectable({ providedIn: "root" })
export class LoanidGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let Loan_ID = sessionStorage.getItem('Loan_ID')
      if(!Loan_ID){
        this.router.navigate(['sales']);
      }else{
        return true;
      }
    }
}

@Injectable({ providedIn: "root" })
export class adminGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('admin_token')
      if(!token){
        this.router.navigate(['admin']);
      }else{
        return true;
      }
    }
}

@Injectable({ providedIn: "root" })
export class adminloginGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('admin_token')
      if(token){
        this.router.navigate(['admin/dashboard']);
      }else{
        return true;
      }
    }
}


@Injectable({ providedIn: "root" })
export class borrowerGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('borrower_token')
      if(!token){
        this.router.navigate(['borrower']);
      }else{
        return true;
      }
    }
}

@Injectable({ providedIn: "root" })
export class borrowerloginGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('borrower_token')
      if(token){
        this.router.navigate(['borrower/overview']);
      }else{
        return true;
      }
    }
}


@Injectable({ providedIn: "root" })
export class installerGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('installer_token')
      if(!token){
        this.router.navigate(['installer']);
      }else{
        return true;
      }
    }
}

@Injectable({ providedIn: "root" })
export class installerloginGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let token = sessionStorage.getItem('installer_token')
      if(token){
        this.router.navigate(['installer/main']);
      }else{
        return true;
      }
    }
}

@Injectable({ providedIn: "root" })
export class AdminPagesGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      return true;
    }

    getpath(name){
      switch(name){
        case 'dashboard':
          return 'Dashboard'
        case 'approved':
          return 'Approved Application'
        case 'pendings':
          return 'Pending Application'
        case 'incomplete':
          return 'Incomplete Application'
        case 'denied':
          return 'Denied Application'
        case 'funded-contracts':
          return 'Funded Contracts'
        case 'settings':
          return 'Settings'
        case 'installer':
          return 'Installer Management'
        case 'users':
          return 'Users'
        case 'start-application':
          return 'Start Application'
        default:
          null
        break;
      }
    }
    gopage(list,tabs){
      switch(list.name){
        case 'Dashboard':
          this.router.navigate(['admin/dashboard']);
        break;
        case 'Approved Application':
          this.router.navigate(['admin/approved']);
        break;
        case 'Pending Application':
          this.router.navigate(['admin/pendings']);
        break;
        case 'Incomplete Application':
          this.router.navigate(['admin/incomplete']);
        break;
        case 'Denied Application':
          this.router.navigate(['admin/dashboard']);
        break;
        case 'Funded Contracts':
          this.router.navigate(['admin/funded-contracts']);
        break;
        case 'Settings':
          this.gosetting(tabs[list.id])
        break;
        case 'Installer Management':
          this.router.navigate(['admin/installer']);
        break;
        case 'Users':
          this.router.navigate(['admin/users']);
        break;
        case 'Start Application':
          this.router.navigate(['admin/start-application']);
        break;
        case 'Funding Contracts':
          this.router.navigate(['admin/funding-contracts']);
        break;
        default:
          sessionStorage.clear()
        break;
      }
    }
    gosetting(list){
      switch(list.name){
        case 'Audit Log':
          this.router.navigate(['admin/settings/auditlog']);
        break;
        case 'Questions':
          this.router.navigate(['admin/settings/questions']);
        break;
        case 'Admin Security':
          this.router.navigate(['admin/settings/admin-security']);
        break;
        case 'Roles':
          this.router.navigate(['admin/settings/roles']);
        break;
        case 'DecisionEngine':
          this.router.navigate(['admin/settings/decisionrngine']);
        break;
        default:
          sessionStorage.clear()
        break;
    }
  }
}

@Injectable({ providedIn: "root" })
export class InstallerPagesGuard implements CanActivate {
  constructor(public router:Router) { 
    
  }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let path = this.getpath(route.url[0].path)
      let pages = sessionStorage.getItem('pages')
      let go = false
      if(pages){
        pages = JSON.parse(pages)
        for (let i = 0; i < pages.length; i++) {
          if(pages[i]['name']==path){
            go = true;
            i = pages.length+1
          }
        }
      }
      if(!go){
        this.gopage(pages[0])
      }else{
        return go
      }
    }

    getpath(name){
      switch(name){
        case 'main':
          return 'Dashboard'
        case 'customers':
          return 'Customers'
        case 'profile':
          return 'Profile'
        case 'transaction':
          return 'Transaction'
        default:
          null
        break;
      }
    }
    gopage(list){
      switch(list.name){
        case 'Dashboard':
          this.router.navigate(['installer/main']);
        break;
        case 'Customers':
          this.router.navigate(['installer/customers']);
        break;
        case 'Profile':
          this.router.navigate(['installer/profile']);
        break;
        case 'Transaction':
          this.router.navigate(['installer/transaction']);
        break;
        default:
          sessionStorage.clear()
        break;
      }
    }
    
}
