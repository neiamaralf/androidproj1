import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams ,Content} from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
@Component({
  selector: 'page-page2',
  templateUrl: 'page2.html'
})
export class Page2 {
  @ViewChild('con1') cont: Content;
  selectedItem: any;
  hasabaaberta:boolean=false;
  menubuttons: string[];
  items: Array<{title: string, id: number,show:boolean,menuitems:  Array<{title: string, tipo: number}>}>;
  constructor( public navCtrl: NavController,public ts:TarefaService, public navParams: NavParams) {
  
  /* DADOS
MEU BIOATEST
NOME: Maria Alice M Carmo EMAIL: tudonomundo@gmail.com ENDEREÇO: Rua Des. Motta, 1237 - Ap 124 FONE: (41) 3018-2485
USUÁRIO PREMIUM

COMPRAS 
1300 PONTOS 20/02/17: R$40,00 Banca do Eli 21/02/17: R$17,50 Ecomarket
UPLOADS 
20/02/17: www.nutriorganic.com/3454 21/02/17: 
imagem 2338574 27/02/17: 
video 234048
REGISTRAR COMPRA*/

    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
    this.items = [];
    this.items.push({title: 'MEU BIOATEST',id:1,show:false,menuitems:[{title:'DADOS',tipo:0},{title:'COMPRAS',tipo:1},
    {title:'MENSAGENS',tipo:0},{title:'UPLOADS',tipo:0}]});
    this.items.push({title: 'BUSCAR PRODUTO',id:2,show:false,menuitems:[]});
    this.items.push({title: 'BUSCAR PROPRIEDADE',id:3,show:false,menuitems:[]});
    this.items.push({title: 'BUSCAR PONTO DE VENDA',id:4,show:false,menuitems:[]});
    this.items.push({title: 'CONTEÚDO',id:5,show:false,menuitems:[]});
    this.items.push({title: 'PREMIUM',id:6,show:false,menuitems:[]});
    this.items.push({title: 'PROMOÇÕES DE HOJE',id:7,show:false,menuitems:[]});
    setTimeout(() => {
       this.cont.resize();
    }, 2000);
  }

  menuitemclick(event,menuitem){
   alert(menuitem.title);
  }

  itemTapped(event, item) {
    for (let data of this.items) {
      if(data!=item)
      data.show = false;
    }
    item.show = !item.show;

    this.hasabaaberta = item.show;

    /* setTimeout(() => {
       this.cont.resize();
    }, 2000);*/

    //  this.navCtrl.push(Page2, {item: item });
  }
}
