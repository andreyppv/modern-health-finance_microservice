import { AbstractControl, FormGroup } from "@angular/forms";

export function AccountNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const accountnumber = control.get('accountnumber');
    const confmAccountNumber = control.get('confmAccountNumber');
    if(accountnumber.pristine || confmAccountNumber.pristine){
        return null;
    }
    return accountnumber && confmAccountNumber && accountnumber.value!=confmAccountNumber.value?
    {'misMatch': true} :
    null;
}

// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

export function ConfirmPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPasword = control.get('newpw');
    const confirmNewPassword = control.get('cnewpw');
    if(newPasword.pristine || confirmNewPassword.pristine){
        return null;
    }
    return newPasword && confirmNewPassword && newPasword.value!=confirmNewPassword.value?
    {'misMatch': true} :
    null;
}