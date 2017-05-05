import { Component } from '@angular/core';
import { Searchbar, NavController } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
import { ViewChild } from '@angular/core';
import { HomePage } from '../../pages/home/home';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';
import { Principal } from '../../pages/principal/principal';

@Component({
  selector: 'new-navbar',
  templateUrl: 'cabecalho.html'
})
export class newNavbar {

  @ViewChild('sb') _searchbar: Searchbar;

  constructor( public navCtrl: NavController,  public tarefaService: TarefaService) {
    if(!tarefaService.logged)
       tarefaService.assertlogin(navCtrl,Principal);
    
    
  }

  soundOnOff(event) {
    this.tarefaService.sound = !this.tarefaService.sound;
    this.tarefaService.falatexto();
  }

  micOnOff(event) {
    this.tarefaService.mic = !this.tarefaService.mic;
    this.tarefaService.getfala();
  }

  search() {
    this.tarefaService.searchbar = !this.tarefaService.searchbar;
    if (this.tarefaService.searchbar)
      setTimeout(() => {
        this._searchbar.setFocus();
      }, 150);

  }

  logout() {
    this.tarefaService.logout();
   // if(this.navCtrl.parent!=null this.navCtrl.getByIndex)
     //this.navCtrl.popToRoot();
     if(this.navCtrl.first()!=this.navCtrl.getActive())
      this.navCtrl.popTo(this.navCtrl.first());
    //this.navCtrl.push(HomePage);
  }  

  login() {
    this.tarefaService.loginprompt(this.navCtrl,Principal);   
    
     
  }

  cadastrar(event) {
    this.navCtrl.push(CadastroPage, {
      edit: false,getcep:true,tabela:"usuarios"
    });
  }

  editar(event) {
    this.navCtrl.push(CadastroPage, {
      edit: true,getcep:false,tabela:"usuarios"
    });
    //  if(this.navCtrl.getActive())
    // console.log(this.navCtrl.getActive().pageRef().nativeElement.localName);
  }

} 