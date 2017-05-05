import { Component } from '@angular/core';
import { TarefaService } from '../../services/json.server';
import { NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/map';
@Component({
  selector: 'page-page3',
  templateUrl: 'page3.html'
})
export class Page3 {
  //items: Observable<DadosUsuario[]>;
  selectedItem: any;
  constructor(private tarefaService: TarefaService, public navCtrl: NavController, public navParams: NavParams) {
    //this.items = tarefaService.get();   
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(Page3, { item: item });
  }

  clickButton() {   

  }

  myFunc(myObj) {
    document.getElementById("demo").innerHTML = myObj.name;
  }
}
