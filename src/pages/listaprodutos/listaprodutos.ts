import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DadosUsuario, TarefaService } from '../../services/json.server';
import { DBData } from '../principal/principal';

@Component({
 selector: 'page-listaprodutos',
 templateUrl: 'listaprodutos.html'
})
export class ListaPage {
 limit: number = 10;
 offset: number = 0;
 item: any;
 selAll: boolean = false;
 selCount: number = 0;
 principal:any;
 alvo:any;
 dbdata: DBData = new DBData();
 constructor(public navCtrl: NavController, public NP: NavParams, public ts: TarefaService) {
  this.item = NP.get('item');
  this.principal=NP.get('principal');
  this.alvo=NP.get('alvo');
  this.dbdata.items.push({  title: 'PRODUTOS', id: 11, show: false, menuitems: [] });
  this.refreshLists();
 }

 refreshLists() {
   if (this.alvo == "produtos")
     this.ts.getProdList(this, this.dbdata.items[0], "*", this.selAll);
   else if (this.alvo == "parceiros")
     this.ts.getParceirosList(this, this.dbdata.items[0], "*", this.selAll);
 }

 chkSelTudoClick(event) {
  if (this.selAll)
   this.selCount=this.dbdata.items[0].menuitems.length;
  else
   this.selCount=0;
  for (let item of this.dbdata.items[0].menuitems){
   item.showdados = this.selAll;
  }
  event.stopPropagation();
 }

 chkClick(event, item) {
  if (item.showdados)
   this.selCount++;
  else
   this.selCount--;
  event.stopPropagation();
 }

 populateListProd(): Promise<any> {
   return new Promise((resolve) => {
    setTimeout(() => {
     this.refreshLists();
     resolve();
    }, 500);
   });  
 }

 add() {
   if (this.alvo == "produtos")
     this.ts.insertProdLista(this.principal, this.dbdata.items[0], this.dbdata.items[0].menuitems);
   else if (this.alvo == "parceiros")
     this.ts.insertParceiroLista(this.principal, this.dbdata.items[0], this.dbdata.items[0].menuitems);
   this.dismiss();
 }

 dismiss() {
  this.navCtrl.pop();
 }
}