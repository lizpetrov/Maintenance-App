import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AuthData } from '../providers/auth-data';
import { ProfileData } from '../providers/profile-data';
import { RequestHandler } from '../providers/request-handler';
import { NewRequest } from '../pages/newRequest/newRequest';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireModule, FirebaseAuthState, AngularFire } from 'angularfire2';
import { GooglePlus } from '@ionic-native/google-plus';

export const firebaseConfig = {
     apiKey: "AIzaSyDxr6-qw1YKUTj6Fu-KLlEi_d7OEtYr3Es",
        authDomain: "maintanance-app.firebaseapp.com",
        databaseURL: "https://maintanance-app.firebaseio.com",
        projectId: "maintanance-app",
        storageBucket: "maintanance-app.appspot.com",
        messagingSenderId: "387649536907"
  };


@NgModule({
  declarations: [
    MyApp,
    ContactPage,
    HomePage,
    LoginPage,
    TabsPage,
      NewRequest
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
    tabsHideOnSubPages: true
  }),
      AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ContactPage,
    HomePage,
    LoginPage,
    TabsPage,
      NewRequest
  ],
  providers: [
      GooglePlus,
    AuthData,
      RequestHandler,
    ProfileData,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
