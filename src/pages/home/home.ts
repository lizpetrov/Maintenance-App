import { NavController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import firebase from 'firebase';
import { ProfileData } from '../../providers/profile-data';
import { NewRequest } from '../newRequest/newRequest';

import { RequestHandler } from '../../providers/request-handler';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    public user: any = null;
    public schoolName: string = "";
    public requestIDS = [];
    
    public submitted = [];
    public inProgress = [];
    public complete = [];
    
constructor(public navCtrl: NavController, public profData:ProfileData, public reqHand: RequestHandler) {
      this.schoolName = this.profData.getSchoolName();
    console.log("HOME CONSTRUCTOR");
  }
    
    ionViewWillEnter() {
        
        console.log("HOME VIEW_WILL_ENTER");
        
        this.requestIDS = this.profData.getUserRequests();  
        console.log(this.requestIDS);
        
        this.submitted = this.requestIDS[0];
        this.inProgress = this.requestIDS[1];
        this.complete = this.requestIDS[2];
    }
    
    viewRequestWithID(requestid: string)
    {
        console.log("VIEW: " + requestid);
    }
    
    newRequest(){
        this.navCtrl.push(NewRequest);
    }

}
