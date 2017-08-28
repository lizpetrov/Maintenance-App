import { Component, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { AuthData } from '../../providers/auth-data';
import firebase from 'firebase';
import { ProfileData } from '../providers/profile-data';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;
zone: NgZone;
    
    
constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, profData: ProfileData) {
      

      


      this.zone = new NgZone({});

    firebase.auth().onAuthStateChanged((user) => {
        
        this.zone.run( () => {
          if (user){

              console.log("user found: " + firebase.auth().currentUser.uid);
            var data = {
              thisUser: firebase.auth().currentUser
            };
            window.localStorage.setItem('current-user', JSON.stringify(data));
            console.log("thisUSer " + data.thisUser);
              var tempRootPage = this.rootPage;
              profData.loadUser().then(function(snapshot) {
                  console.log("APP COMP: GOING TO HOME PAGE");
                    tempRootPage = TabsPage;
              });
              this.rootPage = TabsPage;
              

          } else { 
            console.log("user found not found " + firebase.auth().currentUser);
            var data = {
              thisUser: firebase.auth().currentUser
            };
            window.localStorage.setItem('current-user', JSON.stringify(data));
            console.log("thisUSer " + data.thisUser);
            this.rootPage = LoginPage;
          }
        });  
    });
      
      
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
