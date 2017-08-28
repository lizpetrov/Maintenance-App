import { NavController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import firebase from 'firebase';
import { ProfileData } from '../../providers/profile-data';
import { NewRequest } from '../newRequest/newRequest';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    public user: any = null;
    public schoolName: string = "";
public requestIDS = [];
    
    
  constructor(public navCtrl: NavController, public profData:ProfileData) {
      this.schoolName = this.profData.getSchoolName();
    console.log("HOME CONSTRUCTOR");
  }
    
    ionViewWillEnter() {
        
        
        //console.log("loaded? " + this.profData.loaded());
        
        
        this.user = this.profData.getUser();
        console.log(this.user.uid);
        
        firebase.database().ref('/userProfile').child(this.user.uid).once("value", snapshot => {
              if (snapshot.hasChild("schoolName")) {
                this.schoolName = snapshot.val().schoolName;
              }
                
              if (snapshot.hasChild("requestIDS")) {
                  this.requestIDS = snapshot.val().requestIDS.split("|||");
              }
            
            console.log("HOME -> School = " + this.schoolName + "\nRequests: " + this.requestIDS);
        });
        
        
        
    }
    
    
    
    newRequest(){
        this.navCtrl.push(NewRequest);
    }

}
