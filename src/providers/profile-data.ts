import { Injectable } from '@angular/core';
import firebase from 'firebase';


import { Observable } from 'rxjs/Rx';
import { NavController, AlertController, ActionSheetController } from 'ionic-angular';
import { AngularFire, AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
//import { RequestHandler } from '../providers/request-handler';

@Injectable()
export class ProfileData {
      public userProfile: firebase.database.Reference;
      public currentUser: firebase.User;
      public dataReference: any;
    public schools: Observable<any>;
    public emailEnd: any;
        public schoolList = [];
    public isAdmin: boolean;
    public isBanned: boolean;
    public usersSchool: string = "";
    public usersEmail: string;
    public isLoaded = false;
  
public requests = [];
    public submitted: any;
    public inProgress: any;
    public complete: any;
    
    
    //stuff for loading locations + problems json
    public schoolMaintananceData = [];
    
    
    constructor(public db: AngularFireDatabase, public angFire: AngularFire, public alertCtrl: AlertController) {
    
    }

    getEmail(): String{
        return this.usersEmail;
    }
    
    getEmailEnd(): String
    {
        return this.emailEnd;
    }
    
    loaded(): boolean
    { 
        return this.isLoaded;
    }
    
    getUID(): string{
        return this.currentUser.uid;
    }

    loadUser(): firebase.Promise<any>
    {
        
        var complete = false;
        var complete2 = false;
        var complete3 = false;
        
        console.log("LOADING USER");
        
            this.currentUser = firebase.auth().currentUser;
        
        
           return firebase.database().ref("/userProfile").once('value', (snapshot) => {
              if (snapshot.hasChild(this.currentUser.uid)) {
                // user exists
                  this.loadOtherData();
              }
                else
                {
                    // new user
                    this.isAdmin = false;
                    this.isBanned = false;
                    this.usersEmail = this.currentUser.email;
                    firebase.database().ref("/userProfile").child(this.currentUser.uid).set({email: this.currentUser.email, name: this.currentUser.displayName});
                    this.emailEnd = this.currentUser.email.split("@")[1];
                    console.log("email: " + this.emailEnd);
                    this.setSchool();
                }
            });
        

        
    
    }
    
    loadOtherData()
    {
        this.isLoaded = false;
        this.usersSchool = "";
        this.usersEmail = "";
        this.isAdmin = null;
        this.isBanned = null;
        
        firebase.database().ref("/userProfile/" + this.currentUser.uid).once('value', (snapshot) => {
                if (snapshot.hasChild("/schoolName")) {
                    this.usersSchool = snapshot.val().schoolName;
              }
              else
              {
                //    this.setSchool();
              }
              if (snapshot.hasChild("/email")) {
                this.usersEmail = snapshot.val().email;
              }

                console.log("School - " + this.usersSchool + "  email - " + this.usersEmail + " email head - " + this.usersEmail.split("@")[0].trim());

                firebase.database().ref("/schoolData/" + this.usersSchool + "/admins").once('value', (snapshot) => {
                if (snapshot.hasChild("/"+this.usersEmail.split("@")[0].trim())) {
                    this.isAdmin = true;
                
                  }
                    else
                    {
                        this.isAdmin = false;
                       
                    }

                    console.log("Admin - " + this.isAdmin);
                });

                firebase.database().ref("/schoolData/" + this.usersSchool + "/banned").once('value', (snapshot) => {
                if (snapshot.hasChild("/"+this.usersEmail.split("@")[0].trim())) {
                    this.isBanned = true;
                 
                  }
                    else
                    {
                        this.isBanned = false;
                    
                    }

                    console.log("Banned - " + this.isBanned);
                });


                this.isLoaded = true;
                this.loadSchoolLocationData();
                this.loadUserRequests();
            });
    }
    
    
    setSchool()
    {
        
            if(this.usersEmail == "")
            {
                firebase.database().ref("/userProfile/" + this.currentUser.uid).once('value', (snapshot) => {
                    
                      if (snapshot.hasChild("/email")) {
                        this.usersEmail = snapshot.val().email;
                      }

                    this.emailEnd = this.usersEmail.split("@")[0].trim();
                    
                });
            }
        
        
            this.schools = this.angFire.database.list('/schools', { preserveSnapshot: true });

            this.schools.subscribe(snapshots => {

                  snapshots.forEach(snapshot => {
                    console.log("key " + snapshot.key)
                    console.log(snapshot.val())
                      var snap = snapshot.val().split("||");
                      console.log(snap);
                      var em: string;
                          for ( em in snap)
                          {
                                console.log(em);
                                  if(snap[em] === this.emailEnd)
                                  {
                                          if(this.schoolList.indexOf(snapshot.key) < 0)
                                          {
                                              this.schoolList.push(snapshot.key);
                                          }
                                  }
                          }


                });

                console.log("CHECKING SCHOOL LIST LENGTH: ");
                console.log(this.schoolList);
                console.log("CURRENT USER: " + this.currentUser.uid);
                if(this.schoolList.length == 0)
                {
                    let alert = this.alertCtrl.create({
                        title: 'Sorry',
                        subTitle: "Please login with your school account. If you did, this means that your school isn't using this app yet. Contact your administration :)",
                        buttons: [
                            {
                              text: 'Ok',
                              handler:  () => {
                                    // remove user + logout
                                    firebase.database().ref("/userProfile").child(this.currentUser.uid).remove();
                                    firebase.auth().currentUser.delete();
                                    this.angFire.auth.logout();
                              }
                            }
                        ]
                    });
                    alert.present();
                    
                   firebase.database().ref("/userProfile").child(this.currentUser.uid).update({ schoolName: "NA" });
                }
                else if(this.schoolList.length == 1)
                {
                    this.usersSchool = this.schoolList[0];
                    firebase.database().ref("/userProfile").child(this.currentUser.uid).update({ schoolName: this.schoolList[0], [this.schoolList[0]]: "" });
                    this.loadOtherData(); 
                }
                else
                {                       
                    this.presentRadioAlert();
                }
     });

    }
    
    
    
    presentRadioAlert() {

        // Object with options used to create the alert
        var options = {
          title: 'Choose your school',
          message: '',
            inputs: [],
          buttons: [
            {
              text: 'Ok',
              handler: data => {
                    this.selectCertainSchool(data);
              }
            }
          ]
        };

        options.inputs = [];

        // Now we add the radio buttons
        for(let i=0; i< this.schoolList.length; i++) {
          options.inputs.push({ name : 'options', value: this.schoolList[i], label: this.schoolList[i], type: 'radio' });
        }

        // Create the alert with the options
        let alert = this.alertCtrl.create(options);
        alert.present();
    }
    
    selectCertainSchool(data: string)
    {
        if(data == "" || data === undefined)
        {
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Please select a school',
                buttons: [
                    {
                      text: 'Ok',
                      handler:  () => {
                        this.setSchool();
                      }
                    }
                ]
            });
            alert.present();
        }
        else {
            firebase.database().ref("/userProfile").child(this.currentUser.uid).update({ schoolName: data, [data]: "" });
            this.loadOtherData(); 
        }
    }
    
    getSchoolName(): string {
        return this.usersSchool;
    }

    getUser(): firebase.User {
        return this.currentUser;
    }

    loadSchoolLocationData()
    {
        var schoolMaintananceDataTEMP = [];
        
        var categories = [];   
        var locationData = [];
        var problemData = [];
        
        firebase.database().ref("/schoolData/" + this.usersSchool + "/inputs/").once('value', function(snapshot) {
          snapshot.forEach(function(categorySnapshot) {
            var category = categorySnapshot.key;
              categories.push(category);
              
            var categoryInfo = categorySnapshot.val().split("|||||");
            
            var locations = categoryInfo[0].split("||");
            var problems = categoryInfo[1].split("||");
              console.log(locations);
            for(let loc of locations)
              {
               // console.log(loc);
                locationData.push({category: category, location: loc});
              }
              
              for(let prob of problems)
              {
                problemData.push({category: category, problem: prob});
              }
              
              
            //  var categoryJSON = {"category": category, "locations": locations, "problems": problems};
              
            //  schoolMaintananceDataTEMP.push(categoryJSON);
              
              return false;
        });
            schoolMaintananceDataTEMP.push(categories);
            schoolMaintananceDataTEMP.push(locationData);
            schoolMaintananceDataTEMP.push(problemData);
            console.log("MAINT ARRAY: " + schoolMaintananceDataTEMP);
        });
        
        this.schoolMaintananceData = schoolMaintananceDataTEMP;
        console.log("MAINT ARRAY MAIN: " + this.schoolMaintananceData);
    }

    getMaintStuff()
    {
        return this.schoolMaintananceData;
    }


    getUserRequests(): any[]
    {   
            if(this.requests == [])
            {
                this.loadUserRequests();
            }
        
        return this.requests;
    }
    
    loadUserRequests()
    {
        console.log("LOAD USER REQUESTS");
        
        var uid = this.getUID();
        var requestIDS = [];    
        
        var tempSubmitted = [];
       // var tempInProgress = [];
        var tempComplete = [];
        
        firebase.database().ref('/userProfile').child(uid).once("value", snapshot => {
              if (snapshot.hasChild("schoolName")) {
                var schoolName = snapshot.val().schoolName;
                  
                firebase.database().ref('/userProfile').child(uid).child(schoolName + "/requests").once("value", snapshot => {
                   
                        var tempArray1 = [];
                    
                        for(var requestID in snapshot.val())
                        {
                                if(requestID != "")
                                {
                                    tempArray1.push(requestID);
                                }
                            
                           
                            
                        } 
                    
                        for(let tempID of tempArray1)
                        {
                             console.log("LOOP IT IN LOAD REQUESTS YO");
                            //go through each requestID in submitted
                            console.log("checking: " + tempID);
                           
                               // var tempID = tempArray1[tempnum]
                            
                                firebase.database().ref('/schoolData/' + schoolName + "/requests/").child(tempID).once("value").then( function(snapshot) {
                                    console.log("CHECKING FOR REQUEST YO");
                                    if (snapshot.val()) {
                                        // request is submitted - not seen yet
                                            console.log("request " + tempID + " -> was submitted");
                                            var tempArray = tempID.split("|||");
                                            console.log("TEMP ARRAY: ");
                                            console.log(tempArray);
                                        tempSubmitted.push({"category": tempArray[0].replace(/_/g,' '), "location": tempArray[1].replace(/_/g,' '), "problem": tempArray[2].replace(/_/g,' ')});
                                    }
                            });
                        }
                    
                });   
                  
                  
                firebase.database().ref('/userProfile').child(uid).child(schoolName + "/complete").once("value", snapshot => {
                   
                        for(var timestamp in snapshot.val())
                        {
                            var requestID = snapshot.val()[timestamp];
                            
                            console.log("COMPLETE TIMESTAMP: " + timestamp);
                            
                            if(requestID != ""){
                                var tempArray = requestID.split("|||");

                                tempComplete.push({"category": tempArray[0].replace(/_/g,' '), "location": tempArray[1].replace(/_/g,' '), "problem": tempArray[2].replace(/_/g,' '), "timestamp": timestamp});
                            }
                            
                        } 
                });   
                  
              }  
        });
        
        
        this.requests = [];

        this.requests.push(tempSubmitted);
        this.requests.push(tempComplete);
    }

    LoadAndGetUserRequests(): any[]
    {
         console.log("LOAD AND GET  USER REQUESTS");
        
         
        var uid = this.getUID();
        var requestIDS = [];    
        
        var tempSubmitted = [];
       // var tempInProgress = [];
        var tempComplete = [];
        
        firebase.database().ref('/userProfile').child(uid).once("value", snapshot => {
              if (snapshot.hasChild("schoolName")) {
                var schoolName = snapshot.val().schoolName;
                  
                firebase.database().ref('/userProfile').child(uid).child(schoolName + "/requests").once("value", snapshot => {
                   
                        var tempArray1 = [];
                    
                        for(var requestID in snapshot.val())
                        {
                                if(requestID != "")
                                {
                                    tempArray1.push(requestID);
                                }
                            
                           
                            
                        } 
                    
                        for(let tempID of tempArray1)
                        {
                             console.log("LOOP IT IN LOAD REQUESTS YO");
                            //go through each requestID in submitted
                            console.log("checking: " + tempID);
                           
                               // var tempID = tempArray1[tempnum]
                            
                                firebase.database().ref('/schoolData/' + schoolName + "/requests/").child(tempID).once("value").then( function(snapshot) {
                                    console.log("CHECKING FOR REQUEST YO");
                                    if (snapshot.val()) {
                                        // request is submitted - not seen yet
                                            console.log("request " + tempID + " -> was submitted");
                                            var tempArray = tempID.split("|||");
                                            console.log("TEMP ARRAY: ");
                                            console.log(tempArray);
                                        tempSubmitted.push({"category": tempArray[0].replace(/_/g,' '), "location": tempArray[1].replace(/_/g,' '), "problem": tempArray[2].replace(/_/g,' ')});
                                    }
                            });
                        }
                    
                });   
                  
                  
                firebase.database().ref('/userProfile').child(uid).child(schoolName + "/complete").once("value", snapshot => {
                   
                        for(var timestamp in snapshot.val())
                        {
                            var requestID = snapshot.val()[timestamp];
                            
                            console.log("COMPLETE TIMESTAMP: " + timestamp);
                            
                            if(requestID != ""){
                                var tempArray = requestID.split("|||");

                                tempComplete.push({"category": tempArray[0].replace(/_/g,' '), "location": tempArray[1].replace(/_/g,' '), "problem": tempArray[2].replace(/_/g,' '), "timestamp": timestamp});
                            }
                            
                        } 
                });   
                  
              }  
        });
        
        
        this.requests = [];

        this.requests.push(tempSubmitted);
        this.requests.push(tempComplete);
        return this.requests;
    }
    
}
