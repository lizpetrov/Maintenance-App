import { Injectable, EventEmitter, Inject } from '@angular/core';
import { auth } from 'firebase';
import { NavController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { GooglePlus } from '@ionic-native/google-plus';
import { AuthProviders, AngularFire, FirebaseAuthState, AuthMethods, FirebaseApp } from 'angularfire2'; //Add FirebaseApp
import { Observable } from "rxjs/Observable";
import { ProfileData } from '../providers/profile-data'; 

@Injectable()
export class AuthData {
 // private authState: FirebaseAuthState;
 // public onAuth: EventEmitter<FirebaseAuthState> = new EventEmitter();
  public firebase : any;
   
  constructor(private af: AngularFire, @Inject(FirebaseApp)firebase: any, private platform: Platform, private googlePlus:GooglePlus, public profData:ProfileData) { //Add platform
    this.firebase = firebase;  
 //   this.af.auth.subscribe((state: FirebaseAuthState) => {
//      this.authState = state;
//      this.onAuth.emit(state);
//    });
  }

    loginUser() {
       return Observable.create(observer => {
          if (this.platform.is('cordova')) {
           return this.googlePlus.login({
              'webClientId':'387649536907-79vvvf3rqkj6jqtdq4i8r8pma7u8m2u9.apps.googleusercontent.com' //your Android reverse client id
            }).then(userData => {
              var token = userData.idToken;
              const googleCredential = auth.GoogleAuthProvider.credential(token, null);
              this.firebase.auth().signInWithCredential(googleCredential).then((success)=>{
         //       this.profData.update();
                observer.next(success);
              }).catch(error => {
                //console.log(error);
                observer.error(error);
              });
            }).catch(error => {
                //console.log(error);
                observer.error(error);
            });
          } else {
            return this.af.auth.login({
              provider: AuthProviders.Google,
              method: AuthMethods.Popup
              }).then(()=>{
         //         this.profData.update();
                observer.next();
              }).catch(error => {
                //console.log(error);
                observer.error(error);
            });
          }
        });
    }
    
    

  /**
   * This function doesn't take any params, it just logs the current user out of the app.
   */
  logoutUser() {
    this.af.auth.logout();
  }

}
