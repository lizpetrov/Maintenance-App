import { Injectable, EventEmitter, Inject } from '@angular/core';
import { auth } from 'firebase';
import { NavController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';
import { AuthProviders, AngularFire, FirebaseAuthState, AuthMethods, FirebaseApp } from 'angularfire2'; //Add FirebaseApp
import { Observable } from "rxjs/Observable";
import { ProfileData } from '../providers/profile-data'; 
import firebase from 'firebase';

@Injectable()
export class RequestHandler {
    
  public firebase : any;
   
  constructor(private af: AngularFire, public profData:ProfileData) {

      
  }

    submitRequest(category: String, location: String, problem: String, comment: String, school: string, email: String)
    {
        var uid = this.profData.getUID();
        
        console.log("Category" + category + "\nLocation: " + location + "\nProblem: " + problem + "\nComment: " + comment + "\nSchool: " + school + "\nEmail: " + email + "\nUID: " + uid);
        
        var requestID = category + "_0_" + location + "_0_" + problem;
        
        firebase.database().ref("/schoolData/" + school + "/requests/").once('value', (snapshot) => {
          if (snapshot.hasChild(requestID)) {
                // ALREADY REQUESTED
              
              // increment submitted count
              var databaseRef = firebase.database().ref("/schoolData/" + school + "/requests/").child(requestID).child('timesSubmitted');

                databaseRef.transaction(function(timesSubmitted) {
                  if (timesSubmitted) {
                    timesSubmitted = timesSubmitted + 1;
                  }
                  return timesSubmitted;
                });
              
              // update time + comments
              
              var newComment = comment;
              var newSubmitted = email;
              
                firebase.database().ref("/schoolData/" + school + "/requests/").child(requestID).once('value', (snapshot) => {
                  if (snapshot.hasChild("comments")) {
                    newComment = snapshot.val().comments + "_0_" + newComment;
                  }
                   
                if (snapshot.hasChild("submittedBy")) {
                    newSubmitted = snapshot.val().submittedBy;
                    
                    var temp = snapshot.val().submittedBy.split("|||");
                          if(temp.indexOf(email) < 0)
                          {   
                              newSubmitted = snapshot.val().submittedBy + "|||" + newSubmitted;
                          }
                    
                  }
                    
                    firebase.database().ref("/schoolData/" + school).child("/requests/" + requestID).update(
                    {timestamp: Date.now(), comments: newComment, submittedBy: newSubmitted});
                    
                });
              
          }
            else
            {
                firebase.database().ref("/schoolData/" + school).child("/requests").update(
                {[requestID]: {timestamp: Date.now(), submittedBy: email, comments: comment, timesSubmitted: 1}});
            }
    
    
            //add to user profile
            firebase.database().ref("/userProfile/" + uid).child(school).once('value', (snapshot) => {
                var newRequestIDS = requestID;
                  
                      var temp = snapshot.val().split("|||");
                          if(temp.indexOf(requestID) < 0)
                          {
                              newRequestIDS = snapshot.val() + "|||" + newRequestIDS;
                              firebase.database().ref("/userProfile/" + uid).update(
                              {[school]: newRequestIDS});
                          }
 
                    
            });

        });
    }
    
    
    
}
