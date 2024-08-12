// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  salesapiurl: 'https://medplan-sales-api.alchemylms.com/',
  installerapiurl: 'https://medplan-installer-api.alchemylms.com/',
  // salesapiurl : "http://localhost:3000/",
  // adminapiurl: 'https://mhv2-admin-api.alchemylms.com/',
  adminapiurl: 'http://localhost:3001/',
  borrowerapiurl: 'http://localhost:3002/',
  // borrowerapiurl: 'https://mhv2-borrower-api.alchemylms.com/',
  // installerapiurl : "http://localhost:3003/",
  de: 'https://de-medplan.alchemylms.com/',
  //creditscore: 'https://de.alchemylms.com/medplan/creditscore',
  creditscore: 'https://de.alchemylms.com/modernhealth/practiceRule',
  mastercreditscore: 'https://de.alchemylms.com/modernhealth/mastercreditscore',
  plaidApiVersion: 'v2',
  plaidEnv: 'sandbox',
  title: 'Modern Health Finance',
  plaid_public_key: '',
  offersTerms: [10, 15, 18, 24],
};
export const readyMade = {
  pattern: {
    email:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
    //email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    decimal: /^[0-9]\d*(\.\d+)?$/,
    number: /^[0-9]*$/,
    name: /^[a-zA-Z ]*$/,
  },
};
export const dispalySettings = {
  helpEmail: 'help@modernhealthfinance.com',
  name: 'Modern Health Finance',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
