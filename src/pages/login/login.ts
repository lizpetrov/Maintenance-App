import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
//import { FormBuilder, Validators } from '@angular/forms';
import { AuthData } from '../../providers/auth-data';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: any;


  constructor(public nav: NavController, public authData: AuthData, 
    public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
   
 
  }

  /**
   * If the form is valid it will call the AuthData service to log the user in displaying a loading component while
   * the user waits.
   *
   * If the form is invalid it will just log the form value, feel free to handle that as you like.
   */
  loginUser(): void {

    this.authData.loginUser().subscribe((success) => {
      console.log(success);
    }, err => {
      console.log(err);
    });

  }


}
