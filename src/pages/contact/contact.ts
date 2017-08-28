import { Component, ApplicationRef} from '@angular/core';
import { NavController, AlertController, ActionSheetController } from 'ionic-angular';
import { AuthData } from '../../providers/auth-data';
import { ProfileData } from '../../providers/profile-data';
import firebase from 'firebase';
import { AngularFire, AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

     public userProfile: any = null;
    public schoolName: string = "";
    public currentUser: firebase.User;
    public schools: Observable<any>;
        public schoolList = [];
    public emailEnd: String;
    
    constructor(public navCtrl: NavController, public authData:AuthData, public profData:ProfileData, public ar: ApplicationRef, public angFire: AngularFire, public alertCtrl: AlertController) {
        
        this.schoolName = this.profData.getSchoolName();
    }
    
    ionViewWillEnter() {
        this.userProfile = this.profData.getUser();
        console.log(this.userProfile);
        this.schoolName = this.profData.getSchoolName();
    }

    changeSchool()
    {
        this.setSchoolProfile(); 
        console.log("in change school after setSchool");
        
    }
    
    setSchoolProfile()
    {
        this.currentUser = firebase.auth().currentUser;
        this.emailEnd = this.profData.getEmailEnd();
        
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
                    firebase.database().ref("/userProfile").child(this.currentUser.uid).update({ schoolName: this.schoolList[0], [this.schoolList[0]]: "" });
                    this.profData.loadOtherData(); 
                    this.schoolName = this.schoolList[0];
                    this.ar.tick();
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
                        this.setSchoolProfile();
                      }
                    }
                ]
            });
            alert.present();
        }
        else {
            firebase.database().ref("/userProfile").child(this.currentUser.uid).update({ schoolName: data, [data]: "" });
            this.profData.loadOtherData(); 
            this.schoolName = data;
            this.ar.tick();
        }
    }
    
    logOut()
    {
        this.authData.logoutUser();  
    }

}
