import { Component } from '@angular/core';
import {  NavParams,ModalController,ViewController,ModalOptions  } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
import { DBData } from '../principal/principal';

export class ResultData{  
  public pvporproduto: Array<{
    pimg: string,
    preco: string,
    lpimg: string,
    nomeprod: string,
    id: string,
    nome:string,
    endereco: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string,
    cep: string,
    fone: string,
    tipo: string
  }>;
  public currarray:any;
  constructor(public tipobusca:string){
   if(tipobusca=="porproduto"){
     this.pvporproduto=[];
     this.currarray=this.pvporproduto;
   }
  }
}

@Component({
  template: `
  <ion-header>
  <ion-navbar>
    <ion-title>Certificações</ion-title>
    <ion-buttons start>
            <button ion-button (click)="close(null)">
                  <span ion-text color="primary" showWhen="ios">Cancelar</span>
                  <ion-icon name="md-close" ></ion-icon>
                </button>
        </ion-buttons>
  </ion-navbar>
</ion-header>

<ion-content>
    <ion-list>
     <ion-item *ngFor="let cert of dbdata.items[0].menuitems">
     <ion-grid>
     <ion-row>
     <ion-col>
     <ion-thumbnail>
      <img  item-start src="http://athena3d.com.br/bioatest/imagens/{{cert.dbdata.imagem}}">
    </ion-thumbnail>
    </ion-col>
    <ion-col text-align="left">
    <a href="{{cert.dbdata.site}}">{{cert.dbdata.nome}}</a> 
    </ion-col>
    </ion-row>
    </ion-grid>
     </ion-item>
    </ion-list>
    </ion-content>
  `
})
export class CertUsrDlg {
  dbdata: DBData = new DBData();
  constructor(public viewCtrl: ViewController) {
   //alert('id-'+viewCtrl.data.res.id); 
   this.dbdata.items.push({  menuitems: [] });
   viewCtrl.data.ts.getCertListUsrId(this, this.dbdata.items[0], viewCtrl.data.res.id);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}

@Component({
  selector: 'page-resultado',
  templateUrl: 'resultado.html'
})
export class PaginaResultado implements ModalOptions{
  limit: number = 10;
  offset: number = 0;
  item:any;
  resdata: ResultData ;
  constructor( public ts: TarefaService,public NP: NavParams,public popoverCtrl: ModalController) {
   this.item = NP.get('item');
   this.resdata= new ResultData(NP.get('tipobusca'));
   ts.getPvByProduto(this);
  }  

  showcertificacoes(myEvent,_res){
    let popover = this.popoverCtrl.create(CertUsrDlg,{res: _res,ts:this.ts});
    popover.present();

  }

  premium(){

  }

  likeit(){

  }

  contatar(){

  }

  indicar(){

  }

  alerta(){

  }

  vermapa(){

  }
}