import { Component } from '@angular/core';
import { ModalController,AlertController,NavController, NavParams } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TarefaService } from '../../services/json.server';
import { BuscaCEPPage } from '../../pages/buscacep/pages';
import { Principal } from '../../pages/principal/principal';
@Component({
  selector: 'page-cadastrologin',
  templateUrl: 'cadastrologin.html'
})
export class CadastroPage {
  
  public form: FormGroup;
  public cepform: FormGroup;

  constructor(public modalCtrl: ModalController,public navCtrl: NavController, public tarefaService: TarefaService,  public NP: NavParams, public fb: FormBuilder,public alertCtrl: AlertController) {
    this.form = fb.group({
      "name": ["", Validators.required],
      "fala": ["", Validators.nullValidator],
      "tipo": ["0", Validators.required],
      "endereco": ["", Validators.required],
      "numero": ["", Validators.required],
      "bairro": ["", Validators.required],
      "cidade": ["", Validators.required],
      "estado": ["", Validators.required],
      "fone": ["", Validators.required],
      "password": ["", Validators.required],
      "password2": ["", Validators.required],
      "email": ["", Validators.required],
      "cep": ["", Validators.required]
    });   
    this.form.controls["endereco"].disable(true);
    this.form.controls["bairro"].disable(true);
    this.form.controls["cidade"].disable(true);
    this.form.controls["estado"].disable(true);
    this.form.controls["cep"].disable(true);
    this.cepform = fb.group({
      "cep": ["", Validators.required]
    });
    this.tarefaService.isEdited = NP.get('edit');
    this.tarefaService.tabela = NP.get('tabela');
    if(this.tarefaService.isEdited)this.form.controls["tipo"].disable(true);
    this.tarefaService.mostraCep = NP.get('getcep');
    tarefaService.getUDfromstorage();
  }

  showcep(){
     this.tarefaService.mostraCep =true;
  }

  showdlgCEP() {  
    let modal = this.modalCtrl.create(BuscaCEPPage, {cadastroPag: this});
    modal.present(); 
}

   saveEntry() {    
    let password = this.form.controls["password"].value;
    let password2: string = this.form.controls["password2"].value;
    if (password != password2) {
      alert("Senhas não conferem! Redigite-as.");
      return;
    }    
    if (this.tarefaService.isEdited){
      this.tarefaService.updateEntry();
      this.navCtrl.pop();
    }
    else
      this.tarefaService.createEntry(this.navCtrl,Principal);
    
  } 

  deleteEntry() {   
    this.tarefaService.deleteEntry();
    this.navCtrl.pop();
  } 

  back() {
    this.tarefaService.getUDfromstorage();
    this.tarefaService.hideForm=false;
    this.navCtrl.pop();
  }
}