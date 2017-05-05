import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';

@Component({
  templateUrl: 'template.html'
})
export class BuscaCEPPage {
  cansearchCEP:boolean=false;
  limit:number=20;
  offset:number=0;
  UF:string="PR";
  cidade:string="";
  endereco:string="";
  UFList: Array<{ufs:Array<{id: number,sigla: string}>}>;
  CEPList: Array<{endereco: string,bairro: string,cidade: string,estado: string,cep: string}>;
  cadPG:any;
  constructor(public ts:TarefaService,public platform: Platform,public params: NavParams,public viewCtrl: ViewController){
   this.UFList = [];
   this.UFList.push({ufs:[]});
   this.ts.getUFList(this);
   this.CEPList=[];
   this.cadPG=this.params.get('cadastroPag');
  }

buscarCEP(infiniteScroll){
  //if (this.cansearchCEP){
     setTimeout(() => {
    this.ts.getCEPList(this, infiniteScroll);
     },500);
  //}
}

initbuscaCEP(){
  this.CEPList=[];
  this.cansearchCEP=true;
}

preencheCEP(result:any){
  this.ts.dadosUsuario.endereco = result.endereco;
  this.ts.dadosUsuario.cidade = result.cidade;
  this.ts.dadosUsuario.bairro = result.bairro;
  this.ts.dadosUsuario.estado = result.estado;
  this.ts.dadosUsuario.cep = result.cep;
  this.ts.mostraCep=false;
 this.dismiss();
}
  

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
