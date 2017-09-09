import { Component, ApplicationRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2';
import firebase from 'firebase';


@Component({
  selector: 'page-viewRequest',
  templateUrl: 'viewRequest.html'
})
export class ViewRequest {

    public timesSubmitted = "";
    public category = "";
    public location = "";
    public problem = "";
    public comments = [];  
    public lastTimeSubmitted = "";
    public school = "";
    public showStatus = "";
    public status = "";
    
    constructor(public ar: ApplicationRef, public navCtrl: NavController, db: AngularFireDatabase, private alertCtrl: AlertController) {
    
    }

    ionViewWillEnter()
    {
        var data = JSON.parse(
              window.localStorage.getItem("current-viewing-request")
        );

        var requestID = data.id;
        var status = data.status;
        this.status = data.status;
        var school = data.school;
        this.school = data.school;
        this.category = data.category;
        this.problem = data.problem;
        this.location = data.location;
        
            if(status == "requests")
            {
                this.showStatus = "Submitted";
            }
            else if(status == "complete")
            {
                this.lastTimeSubmitted = data.timestamp;
                this.showStatus = "Complete";
            }
        
        
        if(status == "requests"){
            
            console.log("going to load data for " + requestID + " with status: " + status + " for school " + school);


            firebase.database().ref('/schoolData/' + school + "/" + status).child(requestID).once("value", snapshot => {
              if (snapshot.hasChild("timesSubmitted")) {
                this.timesSubmitted = snapshot.val().timesSubmitted;

                  console.log("submitted x times: "+this.timesSubmitted);
              }
              if (snapshot.hasChild("timestamp")) {
                  var time = snapshot.val().timestamp;
                    var tempDate = new Date(time);
                  var min = tempDate.getMinutes() < 10 ? '0' + tempDate.getMinutes() : tempDate.getMinutes();
                  var hour = tempDate.getHours();
                  var addOn = "am";
                      if(hour > 12)
                      {
                          hour = hour - 12;
                          addOn = "pm";
                      }
                  this.lastTimeSubmitted = hour + ":" + min + " " + addOn + " " + (tempDate.getMonth() + 1) + "/" + tempDate.getDate() + "/" + (tempDate.getFullYear() + "").substring(2);
                 // console.log("last time submitted: " + this.lastTimeSubmitted);
              } 
              if (snapshot.hasChild("comments")) {
                  var tempComments = snapshot.val().comments.split("|||");
                    for(var i in tempComments)
                    {
                            if(tempComments[i] != "")
                            {
                                this.comments.push(tempComments[i].replace(/_/g, " "));
                            }
                    }
              }
                console.log("ticking now...");
                this.ar.tick();

            });
        }
    }

}
