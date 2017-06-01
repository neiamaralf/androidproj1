import { Component } from '@angular/core';
import { ModalController,AlertController,NavController, NavParams } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TarefaService } from '../../services/json.server';
import { BuscaCEPPage } from '../../pages/buscacep/buscacep';
import { Principal,DBData } from '../../pages/principal/principal';
@Component({
  selector: 'page-cadastrologin',
  templateUrl: 'cadastrologin.html'
})
export class CadastroPage {
  
  public form: FormGroup;
  public cepform: FormGroup;
  public menuitem:any;
  public formvariables:any;
  public item:any;
  public principal:any;
  public pageTitle:any="";
  public dbdata:DBData=new DBData();

  constructor(public modalCtrl: ModalController,public navCtrl: NavController, public tarefaService: TarefaService,  public NP: NavParams, public fb: FormBuilder,public alertCtrl: AlertController) {
    this.tarefaService.tabela = NP.get('tabela');
    this.pageTitle=NP.get('pageTitle');
    this.principal=NP.get('principal');
    let validatorok:boolean=this.tarefaService.tabela=="usuario";
    this.form = fb.group({
      "name": ["", Validators.required],
      "fala": ["", Validators.nullValidator],
      "tipo": ["0", Validators.required],
      "idmarca": ["0", Validators.required],
      "idcategoria": ["22", Validators.required],
      "endereco": ["", Validators.required],
      "numero": ["", Validators.required],
      "bairro": ["", Validators.required],
      "cidade": ["", Validators.required],
      "estado": ["", Validators.required],
      "fone": ["", Validators.required],
      "site": ["",Validators.nullValidator],
      "password": ["",validatorok? Validators.required:Validators.nullValidator],
      "password2": ["", validatorok? Validators.required:Validators.nullValidator],
      "email": ["", Validators.required],
      "cep": ["", Validators.required]
    });   
    this.form.controls["endereco"].disable(true);
    this.form.controls["bairro"].disable(true);
    this.form.controls["cidade"].disable(true);
    this.form.controls["estado"].disable(true);
    this.form.controls["cep"].disable(true);
    if(this.tarefaService.tabela=='produtos'){
      this.form.controls["tipo"].disable(true);
      this.form.controls["fone"].disable(true);
      this.form.controls["email"].disable(true);
      this.form.controls["numero"].disable(true);
    }
    else{
      this.form.controls["idmarca"].disable(true);
      this.form.controls["idcategoria"].disable(true);
    }
    this.cepform = fb.group({
      "cep": ["", Validators.required]
    });
    this.formvariables=NP.get('formvariables');
    this.tarefaService.isEdited = NP.get('edit');
    
    if(this.tarefaService.isEdited)this.form.controls["tipo"].disable(true);
    this.tarefaService.mostraCep = NP.get('getcep');

    // if (this.tarefaService.isEdited)
    this.menuitem = NP.get('menuitem');

    this.item = NP.get('item');
    this.dbdata.items.push({ cor: 4, title: 'CATEGORIAS', id: 0, show: false, menuitems: [] });
    tarefaService.getCategoriasList(this.dbdata.items[0]);
    this.dbdata.items.push({ cor: 4, title: 'MARCAS', id: 10, show: false, menuitems: [] });
    tarefaService.getMarcasList(this.dbdata.items[1]);
  }

  showcep() {
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
      if(this.tarefaService.tabela=="usuarios"){
         this.tarefaService.storage.ready().then(() => {
            this.tarefaService.storage.get('userid').then((userid) => {
                this.tarefaService.updateEntry(this.principal,this.item,userid,this.formvariables,this.menuitem);
            });

        });
      }
      else  if(this.tarefaService.tabela=="certificadoras"||this.tarefaService.tabela=="produtos"){
        this.tarefaService.updateEntry(this.principal,this.item,this.NP.get('idcert'),this.formvariables,this.menuitem);
      }
      
      this.navCtrl.pop();
    }
    else
      this.tarefaService.createEntry(this.principal,this.item,this.navCtrl,Principal,this.formvariables);
    
  } 

   deleteEntry() {
     this.tarefaService.storage.ready().then(() => {
       this.tarefaService.storage.get('userid').then((userid) => {
         this.tarefaService.deleteEntry(this.principal,this.item,userid,this.formvariables);
         this.navCtrl.pop();
       });
     });
   } 

  dismiss() {
    this.tarefaService.getUDfromstorage();
    this.tarefaService.hideForm=false;
    this.navCtrl.pop();
  }
}