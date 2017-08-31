import { Component } from '@angular/core';
import {  NavParams, ViewController } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';

@Component({
  templateUrl: 'buscacep.html'
})
export class BuscaCEPPage {
  cansearchCEP: boolean = false;
  limit: number = 20;
  offset: number = 0;
  UF: string = "PR";
  cidade: string = "";
  endereco: string = "";
  UFList: Array<{ ufs: Array<{ id: number, sigla: string }> }>;
  CEPList: Array<{ endereco: string, bairro: string, cidade: string, estado: string, cep: string }>;
  cadPG: any;
  constructor(public ts: TarefaService,  public params: NavParams, public viewCtrl: ViewController) {
    this.UFList = [];
    this.UFList.push({ ufs: [] });
    this.ts.getUFList(this);
    this.CEPList = [];
    this.cadPG = params.get('cadastroPag');
  }

  buscarCEP(): Promise<any> {
    if (this.cansearchCEP) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getCEPList(this);
          resolve();
        }, 500);
      });
    }
    else return null;
  }

  initbuscaCEP() {
    this.CEPList = [];
    this.cansearchCEP = true;
    this.offset = 0;
    this.buscarCEP();
  }

  preencheCEP(result: any) {
    this.cadPG.formvariables.endereco = result.endereco;
    this.cadPG.formvariables.cidade = result.cidade;
    this.cadPG.formvariables.bairro = result.bairro;
    this.cadPG.formvariables.estado = result.estado;
    this.cadPG.formvariables.cep = result.cep;
    this.ts.mostraCep = false;
    this.dismiss();
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }
}
