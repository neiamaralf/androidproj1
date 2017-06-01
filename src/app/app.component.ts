import { Component, ViewChild } from '@angular/core';
import { Nav, Platform,AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { Principal } from '../pages/principal/principal';
import { Page3 } from '../pages/page3/page3';

@Component({
  templateUrl: 'app.html'
})
export class BioatestApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public al:AlertController,public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();
    this.pages = [
      { title: 'Início', component: HomePage },
      { title: 'Menu Principal', component: Principal },
      { title: 'Page 3', component: Page3 }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log(this.platform.platforms());
     let alert = this.al.create({
    title: 'Low battery',
    subTitle: JSON.stringify(this.platform.platforms()),
    buttons: ['Dismiss']
  });
  alert.present();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {    
    this.nav.setRoot(page.component);
  }
}
