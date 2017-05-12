import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { DadosUsuario,TarefaService } from '../../services/json.server';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';
@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html'
})
export class Principal {

  @ViewChild('con1') cont: Content;
  selectedItem: any;
  hasabaaberta: boolean = false;
  menubuttons: string[];
  items: Array<{
    cor: number, title: string, id: number, show: boolean,
    menuitems: Array<{
      title: string, tipo: number, showdados: boolean,
      linhas: Array<{
        title: string,
        info: string
      }>,
      dbdata?: {
        nome?: string,
        email?: string,
        endereco?: string,
        estado?: string,
        cidade?: string,
        bairro?: string,
        site?: string,
        numero?: any,
        complemento?: string,
        fone?: string,
        cep?: string,
        tipo?: string,
        password?:string,
        password2?:string
      }
    }>
  }>;
  constructor(public navCtrl: NavController, public ts: TarefaService, public navParams: NavParams) {
    setTimeout(() => {
      ts.getUDfromstorage();

      this.selectedItem = navParams.get('item');
      this.items = [];
      this.items.push({
        cor: 4, title: 'MEU BIOATEST', id: 1, show: false,
        menuitems: [
          {
            title: 'DADOS', tipo: 0, showdados: false, linhas: [
              { title: 'NOME', info: ts.dadosUsuario.nome },
              { title: 'EMAIL', info: ts.dadosUsuario.email },
              { title: 'ENDEREÇO', info: ts.dadosUsuario.endereco+','+ts.dadosUsuario.numero+'-'+ts.dadosUsuario.bairro+'-'+ts.dadosUsuario.cidade+'-'+ts.dadosUsuario.estado },
              { title: 'FONE', info: ts.dadosUsuario.fone }]
          },
          { title: 'COMPRAS', tipo: 1, showdados: false, linhas: [] },
          { title: 'MENSAGENS', tipo: 2, showdados: false, linhas: [] },
          { title: 'UPLOADS', tipo: 3, showdados: false, linhas: [] }]
      });
      this.items.push({ cor: 4, title: 'BUSCAR PRODUTO', id: 2, show: false, menuitems: [] });
      this.items.push({ cor: 4, title: 'BUSCAR PROPRIEDADE', id: 3, show: false, menuitems: [] });
      this.items.push({ cor: 4, title: 'BUSCAR PONTO DE VENDA', id: 4, show: false, menuitems: [] });
      this.items.push({ cor: 4, title: 'CONTEÚDO', id: 5, show: false, menuitems: [] });
      this.items.push({ cor: 4, title: 'PREMIUM', id: 6, show: false, menuitems: [] });
      this.items.push({ cor: 1, title: 'PROMOÇÕES DE HOJE', id: 7, show: false, menuitems: [] });
      if (ts.dadosUsuario.tipo == "3") {
        this.items.push({ cor: 4, title: 'CERTIFICADORAS', id: 8, show: false, menuitems: [] });
        ts.getCertList(this.items[7]);   

      }
      setTimeout(() => { this.cont.resize(); }, 500);
    }, 500);
  }

  showhideclick(event, item, menuitem) {
    menuitem.showdados = !menuitem.showdados;
    if (menuitem.showdados) {
      
    }
    event.stopPropagation();
  }

  menuitemclick(item, menuitem) {
    if (item.title == "CERTIFICADORAS") {
      this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "certificadoras",idcert:menuitem.tipo, formvariables: menuitem.dbdata });
    }
    else if (item.title == "MEU BIOATEST") {
      if (menuitem.tipo == 0) {
        this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "usuarios",formvariables:this.ts.dadosUsuario });
      }
    }
  }

  novacert(event, item) {
    this.navCtrl.push(CadastroPage, { edit: false, getcep: true, tabela: "certificadoras",formvariables:new DadosUsuario });
    event.stopPropagation();
  }

  deleteEntry(menuitem) {
    this.ts.tabela = "certificadoras";
    this.ts.deleteEntry(menuitem.tipo,menuitem.dbdata);
    event.stopPropagation();
  }

  itemTapped(event, item) {
    for (let data of this.items) {
      if (data != item)
        data.show = false;
    }
    item.show = !item.show;

    this.hasabaaberta = item.show;
    if (item.show && item.title == "CERTIFICADORAS") {
      //this.ts.getCertList(this.items[7]);
    }
    event.stopPropagation();
  }
}
