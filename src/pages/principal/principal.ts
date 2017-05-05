import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams ,Content} from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';
@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html'
})
export class Principal {
  @ViewChild('con1') cont: Content;
  selectedItem: any;
  hasabaaberta:boolean=false;
  menubuttons: string[];
  items: Array<{cor:number,title: string, id: number,show:boolean,
    menuitems:  Array<{title: string, tipo: number,showdados:boolean}>}>;
  constructor( public navCtrl: NavController,public ts:TarefaService, public navParams: NavParams) {
  
 
    this.selectedItem = navParams.get('item');
    this.items = [];

    this.items.push({cor:4,title: 'MEU BIOATEST',id:1,show:false,
    menuitems:[
      {title:'DADOS',tipo:0,showdados:false},
      {title:'COMPRAS',tipo:1,showdados:false},
     {title:'MENSAGENS',tipo:2,showdados:false},
     {title:'UPLOADS',tipo:3,showdados:false}]});
    this.items.push({cor:4,title: 'BUSCAR PRODUTO',id:2,show:false,menuitems:[]});
    this.items.push({cor:4,title: 'BUSCAR PROPRIEDADE',id:3,show:false,menuitems:[]});
    this.items.push({cor:4,title: 'BUSCAR PONTO DE VENDA',id:4,show:false,menuitems:[]});
    this.items.push({cor:4,title: 'CONTEÚDO',id:5,show:false,menuitems:[]});
    this.items.push({cor:4,title: 'PREMIUM',id:6,show:false,menuitems:[]});
    this.items.push({cor:1,title: 'PROMOÇÕES DE HOJE',id:7,show:false,menuitems:[]});
    if(ts.dadosUsuario.tipo=="3"){
     this.items.push({cor:4,title: 'CERTIFICADORAS',id:8,show:false,menuitems:[]});
    }
    setTimeout(() => {
       this.cont.resize();
    }, 2000);
    ts.getUDfromstorage();
  }

  menuitemclick(item,menuitem){
    if (item.title == "CERTIFICADORAS") {
      this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "certificadoras" });
    }
    else if (item.title == "MEU BIOATEST") {
      if (menuitem.tipo == 0) {
        this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "usuarios" });
      }
    }
  }

  novacert(event,item){
   this.navCtrl.push(CadastroPage,{edit: false,getcep:true,tabela:"certificadoras"});  
   event.stopPropagation();
  }

  showhideclick(event,menuitem){
   menuitem.showdados = !menuitem.showdados;
  }

  itemTapped(event, item) {
    for (let data of this.items) {
      if(data!=item)
      data.show = false;
    }
    item.show = !item.show;

    this.hasabaaberta = item.show;
    if(item.show&&item.title=="CERTIFICADORAS"){
      this.ts.getCertList(this.items[7]);     
     
     
    }
    /* setTimeout(() => {
       this.cont.resize();
    }, 2000);*/

    //  this.navCtrl.push(Page2, {item: item });
  }
}
