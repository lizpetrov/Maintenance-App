import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2';
import { ProfileData } from '../../providers/profile-data';
import firebase from 'firebase';

import { RequestHandler } from '../../providers/request-handler';

@Component({
  selector: 'page-newRequest',
  templateUrl: 'newRequest.html'
})
export class NewRequest {

    
    public objects: any;
    chosenPath: string = "";
    currentUser: any;
    school: string;
otherLocation: string;
otherProblem: string;
comment: string = "";
otherCategory: string;
    email: String;
    
private banned: boolean;
    
    public categories: any[];
      public locations: any[];
      public problems: any[];

      public selectedLocations: any[];
      public selectedProblems: any[];

    public sCat: any;
    public sLocation: any;
    public sProblem: any;
    
    constructor(public navCtrl: NavController, db: AngularFireDatabase, public profData: ProfileData, private alertCtrl: AlertController, public reqHandler: RequestHandler) {
    
        this.school = this.profData.getSchoolName();
        this.banned = this.profData.isBanned;
        this.email = this.profData.getEmail();
        
    console.log("NEW REQUEST -> School = " + this.school + "\nbanned: " + this.banned + "\nEmail: " + this.email);
            
        this.objects = this.profData.getMaintStuff();
        console.log("LIST: " + this.objects);
        console.log(this.objects);
        
        this.initializeCategories();
        this.initializeLocations();
        this.initializeProblems();
    }


    initializeCategories(){
          this.categories = this.objects[0];
          console.log("CATEGORIES:");
          console.log(this.categories);
    }

    initializeLocations(){
        this.locations = this.objects[1];
        console.log("LOCATIONS:");
        console.log(this.locations);
    }

    initializeProblems(){
        this.problems = this.objects[2];
        console.log("PROBLEMS:");
        console.log(this.problems);
    }
  
    setValues(sCat) {
        this.selectedLocations = this.locations.filter(location => location.category == sCat);
         this.selectedProblems = this.problems.filter(problem => problem.category == sCat);
        this.sLocation = "";
        this.sProblem = "";
    }
    
    
    
    submitRequest()
    {
        var submittedCategory = "";
        var submittedLocation = "";
        var submittedProblem = "";
        
        
        if(this.sCat == 'other')
        {
            submittedCategory = this.otherCategory;
        }
        else 
        {
            submittedCategory = this.sCat;
        }
        
        if(this.sLocation == 'other')
        {
            submittedLocation = this.otherLocation;
        }
        else
        {
            submittedLocation = this.sLocation.location;
        }
        
        if(this.sProblem == 'other')
        {
            submittedProblem = this.otherProblem;
        }
        else
        {
            submittedProblem = this.sProblem.problem;
        }
        
        
        console.log("sCategory: " + submittedCategory);
        console.log("sLocation: " + submittedLocation);
        console.log("sProblem: " + submittedProblem);
        console.log("Comments: " + this.comment);
        
        if(submittedCategory == "" || submittedLocation =="" || submittedProblem == "")
        {
            let alert = this.alertCtrl.create({
                title: 'Not Complete',
                subTitle: 'Please complete all sections',
                buttons: ['Dismiss']
            });
            alert.present();
        }
        else if(this.banned == true){
            let alert = this.alertCtrl.create({
                title: 'Banned',
                subTitle: "Sorry, you were banned. Talk to administration.",
                buttons: ['Dismiss']
            });
            alert.present();
            this.navCtrl.pop();
        }
        else {
            // SUBMIT REQUEST
            this.reqHandler.submitRequest(submittedCategory.replace(/ /g, "_"), submittedLocation.replace(/ /g, "_"), submittedProblem.replace(/ /g, "_"), this.comment.replace(/ /g, "_"), this.school, this.email);
            let alert = this.alertCtrl.create({
                title: 'Submitted',
                subTitle: 'Your request has been submitted. You will get a notification when it is complete.',
                buttons: ['Dismiss']
            });
            alert.present();
            this.navCtrl.pop();
        }
        
    }
    
    

}
