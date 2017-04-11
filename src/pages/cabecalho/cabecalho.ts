import { Component } from '@angular/core';
import { AlertController, Searchbar, NavController } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
import { ViewChild } from '@angular/core';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';
import { Http, Headers, RequestOptions } from '@angular/http';
@Component({
  selector: 'new-navbar',
  templateUrl: 'cabecalho.html'
})
export class newNavbar {

  @ViewChild('sb') _searchbar: Searchbar;

  constructor(public http: Http, public navCtrl: NavController, public alertCtrl: AlertController, public tarefaService: TarefaService) {

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
  }

  login() {
    let prompt = this.alertCtrl.create({

      inputs: [{ type: 'email', name: 'email', placeholder: 'digite seu email' },
      { type: 'password', name: 'senha', placeholder: 'digite sua senha' }],
      buttons: [
        { text: 'Cancelar' },
        {
          text: 'Entrar',
          handler: data => {
            //this.tarefaService.dologin(data.email, data.senha);
            //if(!this.tarefaService.logged)this.login();
            let device: string = "test";
            let body: string = "key=login&email=" + data.email + "&password=" + data.senha + "&device=" + device,
              type: string = "application/x-www-form-urlencoded; charset=UTF-8",
              headers: any = new Headers({ 'Content-Type': type }),
              options: any = new RequestOptions({ headers: headers }),
              url: any = "http://www.athena3d.com.br/bioatest/manage-data.php";
            let obs = this.http.post(url, body, options);
            obs.map(res => res.json()).subscribe((jsonres) => {
              console.log(jsonres);
              if (jsonres[0].token != "") {
                this.tarefaService.logged = true;
                this.tarefaService.setstorage(jsonres[0].token, jsonres[0].id, jsonres[0].nome, data.senha,
                  jsonres[0].admin, data.email);
              }
              else {
                alert('erro :' + jsonres[0].nome);
                this.login();
              }
            });

          }
        }
      ]
    });

    prompt.present();
  }

  cadastrar(event) {
    this.navCtrl.push(CadastroPage, {
      edit: false
    });
  }

  editar(event) {
    this.navCtrl.push(CadastroPage, {
      edit: true
    });
    //  if(this.navCtrl.getActive())
    // console.log(this.navCtrl.getActive().pageRef().nativeElement.localName);
  }

} 