import { Component } from '@angular/core';

import { NewRequest } from '../newRequest/newRequest';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  //tab2Root = NewRequest;
  tab3Root = ContactPage;

  constructor() {

  }
}
