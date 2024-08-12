export const environment = {
  production: true,
  salesapiurl: 'https://medplan-sales-api.alchemylms.com/',
  adminapiurl: 'https://mhv2-admin-api.alchemylms.com/',
  borrowerapiurl: 'https://mhv2-borrower-api.alchemylms.com/',
  installerapiurl: 'https://medplan-installer-api.alchemylms.com/',
  /// salesapiurl : "http://localhost:3000/",
  // adminapiurl : "http://localhost:3001/",
  plaidApiVersion: 'v2',
  plaidEnv: 'sandbox',
  title: 'MED Plan',
  offersTerms: [10, 15, 18, 24],
  creditscore: 'https://de.alchemylms.com/modernhealth/practiceRule',
  mastercreditscore: 'https://de.alchemylms.com/modernhealth/mastercreditscore',
};
export const dispalySettings = {
  helpEmail: 'help@modernhealthfinance.com',
  name: 'Modern Health Finance',
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
