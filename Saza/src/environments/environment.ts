// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // defaultauth: 'fackbackend',
  defaultauth: 'nodejs',
   firebaseConfig: {
    apiKey: "AIzaSyByj6f5i-Qr3W4IDwfG1JWNIWDUNJ4iCbo",
    authDomain: "myapp-saza.firebaseapp.com",
    databaseURL: "https://myapp-saza.firebaseio.com",
    projectId: "myapp-saza",
    storageBucket: "myapp-saza.appspot.com",
    messagingSenderId: "198088728224",
    appId: "1:198088728224:web:612f5ca004c6cb5d56f3c5",
    measurementId: "G-V3VRJ5RTHZ"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
