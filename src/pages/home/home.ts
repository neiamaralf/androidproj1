import { Component } from '@angular/core';
import {  NavController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { TarefaService } from '../../services/json.server';
import { Principal } from '../../pages/principal/principal';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor( public navCtrl: NavController, public tarefaService: TarefaService) {
   if(!tarefaService.logged){
     //tarefaService.loginprompt(this.navCtrl, Principal);
   }
  
  }  
}
