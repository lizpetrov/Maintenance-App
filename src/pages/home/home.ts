import { NavController } from 'ionic-angular';
import { Component, ApplicationRef } from '@angular/core';
//import firebase from 'firebase';
import { ProfileData } from '../../providers/profile-data';
import { NewRequest } from '../newRequest/newRequest';
import { ViewRequest } from '../viewRequest/viewRequest';
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
  //  public inProgress = [];
    public complete = [];
    
constructor(public navCtrl: NavController, public profData:ProfileData, public reqHand: RequestHandler, public ar: ApplicationRef) {
      this.schoolName = this.profData.getSchoolName();
    console.log("HOME CONSTRUCTOR");
  }
    
    ionViewWillEnter() {
        this.schoolName = this.profData.getSchoolName();
        
        console.log("HOME VIEW_WILL_ENTER");
        
        this.requestIDS = this.profData.getUserRequests();  
        console.log(this.requestIDS);
        
        this.submitted = this.requestIDS[0];
    //    this.inProgress = this.requestIDS[1];
        this.complete = this.requestIDS[1];
        console.log("ticking");
        this.ar.tick();
    }
    
    loadHomeScreen(tempArray: any[])
    {
        console.log("REFRESHING");
        console.log(tempArray);
        this.submitted = tempArray[0];
    //    this.inProgress = this.requestIDS[1];
        this.complete = tempArray[1];
        this.ar.tick();
    }
    
    doRefresh(refresher) {
        this.loadHomeScreen(this.profData.LoadAndGetUserRequests());
        refresher.complete();
    }
    
    
    viewRequestWithID(category: string, location: string, problem: string, status: string)
    {
        var requestid = category.replace(/ /g,"_") + "|||" + location.replace(/ /g,"_") + "|||" + problem.replace(/ /g,"_");
    console.log("VIEW: " + requestid + " STATUS: " + status + " school: " + this.schoolName);
        
        var data = {
                    id: requestid,
                    status: status,
                    school: this.schoolName,
            category: category,
            location: location,
            problem: problem
        };
        
        window.localStorage.setItem(
                      "current-viewing-request",
                      JSON.stringify(data)
                    );
        
        this.navCtrl.push(ViewRequest);
    }
    
    toReadableTime(time: string): string
    {
        var tempDate = new Date(parseInt(time));
        console.log(tempDate.toDateString());
        var min = tempDate.getMinutes() < 10 ? '0' + tempDate.getMinutes() : tempDate.getMinutes();
        var hour = tempDate.getHours();
        var addOn = "am";
        if(hour > 12)
         {
              hour = hour - 12;
              addOn = "pm";
         }
         return hour + ":" + min + " " + addOn + " " + (tempDate.getMonth() + 1) + "/" + tempDate.getDate() + "/" + (tempDate.getFullYear() + "").substring(2);
    }
    
     viewRequestWithIDandTime(category: string, location: string, problem: string, status: string, time: string)
    {
        var requestid = category.replace(/ /g,"_") + "|||" + location.replace(/ /g,"_") + "|||" + problem.replace(/ /g,"_");
         console.log("VIEW: " + requestid + " STATUS: " + status + " school: " + this.schoolName);
        
        var data = {
            id: requestid,
            status: status,
            school: this.schoolName,
            category: category,
            location: location,
            problem: problem,
            timestamp: time
        };
        
        window.localStorage.setItem(
                      "current-viewing-request",
                      JSON.stringify(data)
                    );
        
        this.navCtrl.push(ViewRequest);
    }
    
    newRequest(){
        this.navCtrl.push(NewRequest);
    }

}
