// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  baseUrlSite: 'https://beta.tela-botanica.org/',
  baseURLServicesCelTpl: 'https://api-test.tela-botanica.org/service:cel:CelWidgetMapPoint/stations',
  celUrlImages: 'https://api-test.tela-botanica.org/service:cel:CelWidgetImage/*',
  delUrlObs: 'https://api-test.tela-botanica.org/service:del:0.1/observations',
  membersProfil: 'https://beta.tela-botanica.org/test/membres/',
  cookieName: 'tb_auth_beta_test',
  celExportUrl: 'https://api-cel-test.tela-botanica.org/api/export_totals'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
