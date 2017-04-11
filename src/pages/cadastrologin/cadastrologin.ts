import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { TarefaService } from '../../services/json.server';



@Component({
  selector: 'page-cadastrologin',
  templateUrl: 'cadastrologin.html'
})
export class CadastroPage {
  
  public form: FormGroup;
  public username: any;
  public password: any;
  public password2: any;
  public email: any;
  public isEdited: boolean = false;
  public hideForm: boolean = false;
  private baseURI: string = "http://www.athena3d.com.br/bioatest/";

  constructor(public navCtrl: NavController, public tarefaService: TarefaService, public http: Http, public NP: NavParams, public fb: FormBuilder, public toastCtrl: ToastController) {
    this.form = fb.group({
      "name": ["", Validators.required],
      "fala": ["", Validators.required],
      "password": ["", Validators.required],
      "password2": ["", Validators.required],
      "email": ["", Validators.required]
    });
    this.isEdited = NP.get('edit');;
    this.username = tarefaService.dadosUsuario.nome;
    this.email = tarefaService.dadosUsuario.email;
  }

  

  createEntry() {
    let body: string = "key=create&name=" + this.username + "&password=" + this.form.controls["password"].value+ 
     "&email=" + this.email,
      type: string = "application/x-www-form-urlencoded; charset=UTF-8",
      headers: any = new Headers({ 'Content-Type': type }),
      options: any = new RequestOptions({ headers: headers }),
      url: any = this.baseURI + "manage-data.php";
    let obs = this.http.post(url, body, options);
    obs.map(res => res.json())
      .subscribe((data) => {
        console.log(data);
        if (data.insert === "ok") {
          this.hideForm = true;
          this.sendNotification(`O usuário: ${name} foi cadastrado com sucesso!`);
          this.tarefaService.dologin(this.email, this.form.controls["password"].value);
        }
        else {
          if (data.insert === "23000")
            this.sendNotification('Email já cadastrado');
          else
            this.sendNotification('Algo deu errado! ' + data.insert);
        }
      });
  }

  updateEntry() {
    this.tarefaService.storage.ready().then(() => {
      this.tarefaService.storage.get('userid').then((userid) => {
        let body: string = "key=update&username=" + this.form.controls["name"].value + "&password=" +
          this.form.controls["password"].value + "&email=" + this.form.controls["email"].value + "&recordID=" + userid,
          type: string = "application/x-www-form-urlencoded; charset=UTF-8",
          headers: any = new Headers({ 'Content-Type': type }),
          options: any = new RequestOptions({ headers: headers }),
          url: any = this.baseURI + "manage-data.php";

        this.http.post(url, body, options).map(res => res.json()).subscribe(data => {
          // alert(data.update);
          if (data.update === "ok") {
            this.hideForm = true;
            this.username = this.form.controls["name"].value;
            this.email = this.form.controls["email"].value;
            this.password = this.form.controls["password"].value;

            this.tarefaService.storage.set('username', this.username);
            this.tarefaService.storage.set('email', this.email);
            this.tarefaService.storage.set('senha', this.password);
            this.tarefaService.dadosUsuario.nome = this.username;
            this.tarefaService.dadosUsuario.email = this.email;

            this.sendNotification(`Cadastro atualizado com sucesso`);
          }
          else {
            if (data.update === "23000")
            this.sendNotification('Email já cadastrado');
           else
            this.sendNotification('Algo deu errado: ' + data.update);
          }
        });
      });

    });

  }

  deleteEntry() {
    this.tarefaService.storage.ready().then(() => {
      this.tarefaService.storage.get('userid').then((userid) => {
        let name: string = this.form.controls["name"].value,
          body: string = "key=delete&recordID=" + userid,
          type: string = "application/x-www-form-urlencoded; charset=UTF-8",
          headers: any = new Headers({ 'Content-Type': type }),
          options: any = new RequestOptions({ headers: headers }),
          url: any = this.baseURI + "manage-data.php";

        this.http.post(url, body, options).map(res => res.json()).subscribe(data => {
          if (data.delete === "ok") {
            this.hideForm = true;
            this.sendNotification(`O usuário: ${name} foi excluído do sistema`);
          }
          else {
            this.sendNotification('Algo deu errado! Tente novamente.');
          }
        });
      });

    });
  }

  saveEntry() {
    
    let password = this.form.controls["password"].value;
    let password2: string = this.form.controls["password2"].value;
    if (password != password2) {
      alert("Senhas não conferem! Redigite-as.");
      return;
    }
    this.username = this.form.controls["name"].value;
    this.email = this.form.controls["email"].value;
    if (this.isEdited) {
      this.updateEntry();
    }
    else {
      this.createEntry();
    }
  }

  resetFields(): void {
    this.username = "";
    this.password = "";
    this.email = "";
  }

  sendNotification(message): void {
    let notification = this.toastCtrl.create({ message: message, duration: 3000 });
    notification.present();
  }

  back() {
    this.navCtrl.pop();
  }
}