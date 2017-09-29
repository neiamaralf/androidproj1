import { Component , ViewChild, ElementRef } from '@angular/core';
import {  NavParams,ModalController,ViewController,ModalOptions  } from 'ionic-angular';
import { TarefaService } from '../../services/json.server';
import { DBData } from '../principal/principal';
import { Geolocation } from '@ionic-native/geolocation';
import { Pipe, PipeTransform } from "@angular/core";
import { Slides } from 'ionic-angular';

export class ResultData{  
  public pvporproduto: Array<{
    pimg: string,
    fullpimg?: string,
    lpimg: string,
    fulllpimg?: string,
    texto?:string,
    preco: string,    
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
    tipo: string,
    lat?:number,
    long?:number,
    distancia?:number
   
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
      <img  item-start src="http://athena3d.com.br/bioatest/{{cert.dbdata.imagem}}">
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

declare var google;




@Component({
  selector: 'page-map',
  template: `
  <ion-header>
  <ion-navbar>
    <ion-title>
      MAPA
    </ion-title>
    <ion-buttons end>
      <button ion-button>{{respage.item.dbdata.nome}}</button>
    </ion-buttons>  
  </ion-navbar>
</ion-header>
 
<ion-content>
  <div #map id="map"></div>  
</ion-content>
  `
})
export class Mapa {
   @ViewChild('map') mapElement: ElementRef;
  map: any;
  respage:any;
  pos:any;
  constructor(public viewCtrl: ViewController, public geolocation: Geolocation) {
    this.respage=viewCtrl.data.respage;
  }
  ionViewDidLoad() {
    var options = {
        enableHighAccuracy : true
    };
    this.geolocation.getCurrentPosition(options).then((position) => {
      this.pos=position;

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
     this.respage.resdata.currarray.forEach(element => {
       this.respage.ts.getgeocode(this,element,true,false);
       
     });
      this.addMarker(position.coords.latitude, position.coords.longitude) ;
    });
  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }
  

  addMarker(latitude,longitude) {
  var image = 'http://www.athena3d.com.br/bioatest/voce.png';
   let marker = new google.maps.Marker({
     icon: image,
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: {
              lat: latitude,
              lng: longitude
            }
    });
    //let content = "<h4>Information!</h4>";
    //this.addInfoWindow(marker, content);
  }

   addMarker1(latitude,longitude,elem) {
  
   let marker = new google.maps.Marker({
     label: elem.nome,
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: {
              lat: latitude,
              lng: longitude
            }
    });
    let content = "<h2>"+elem.nome+"</h2>"+"<h5><b>Endereço:</b>"+this.respage.ts.constroiendereco(elem)+"</h5>";
    
    this.addInfoWindow(marker, content);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}


@Pipe( {
name: 'orderBy'
} )
export class OrderByPipe implements PipeTransform {
transform( array: Array<any>, orderType: boolean ): Array<any> {
    array.sort(  );
    return array;
  }
}

@Component({
  selector: 'page-prodpv',
  template: `
  <ion-header>
    <new-navbar hideBackButton></new-navbar>
 </ion-header>
 
<ion-content>
 <ion-list no-lines>
        <ion-list-header color="cor2">{{res.nome}}
           <button style="text-align: right" item-right icon-right (click)="likeit()">1.109<ion-icon color="cor2" name="heart"></ion-icon></button>
        </ion-list-header>
        <ion-item>
  <ion-slides >
    <ion-slide *ngFor="let item of resdata.currarray" >      
      <img src="http://athena3d.com.br/bioatest/{{item.pimg}}" class="slide-image" (click)="slideTap(item.fullpimg)"/>
    </ion-slide>
  </ion-slides>
  </ion-item>
  <ion-item  *ngIf="showimg" color="cor1" >
    <img src="http://athena3d.com.br/bioatest/{{itempimg}}" />   
  </ion-item>
  
  <ion-item text-wrap text-justify  *ngIf="infodata.historico!=null"><b>Sobre:</b>
  <p>{{infodata.historico}}</p>
  </ion-item>
  <ion-item text-wrap text-justify *ngIf="infodata.valores!=null"><b>Valores:</b>
  <p>{{infodata.valores}}</p>
  </ion-item>
   <ion-item text-wrap text-justify *ngIf="infodata.missao!=null"><b>Missão:</b>
  <p>{{infodata.missao}}</p>
  </ion-item>
  </ion-list>
</ion-content>
<ion-footer>
    <page-rodape></page-rodape>
</ion-footer>
  `
})
export class Produtor_PV {
  @ViewChild(Slides) slides: Slides;
  respage:any;
  res:any;
  resdata: ResultData ;
  public infodata: {   
    historico?:string,
    valores?:string,
    missao?:string
  };
  showimg:Boolean=false;
  imgindex:number=-1;
  itempimg:any;
  
  slideTap(itempimg){
    if(this.itempimg===itempimg)this.showimg=!this.showimg;
    else this.showimg=true;
    this.imgindex = this.slides.getActiveIndex();
    this.itempimg=itempimg;
    console.log('Current index is', this.imgindex);
  }

  constructor(public NP: NavParams) {
    this.respage = NP.get('respage');
    this.res = NP.get('res');
    this.resdata = new ResultData("porproduto");
    this.respage.ts.getImgsListUsrID(this.respage, this.resdata,this.res);
    this.infodata = new ResultData("porproduto");
    this.respage.ts.getInfoPROD_PV(this.infodata,this.res);
  }

  ngAfterViewInit() {
    this.slides.slidesPerView = 4;
    this.slides.centeredSlides=false;
    this.slides.pager=false;
    this.slides.zoom=true;
    this.slides.spaceBetween=5;
  }
}

@Component({  
  selector: 'page-resultado',
  templateUrl: 'resultado.html'
})
export class PaginaResultado implements ModalOptions{
 
  pos:any;
  limit: number = 10;
  offset: number = 0;
  item:any;
  resdata: ResultData ;
  constructor( public ts: TarefaService,public NP: NavParams,public popoverCtrl: ModalController, private geolocation: Geolocation) {
   this.item = NP.get('item');
   this.resdata = new ResultData(NP.get('tipobusca'));
   console.log(this.resdata);
   this.geolocation.getCurrentPosition().then((position) => {
     console.log(position);
     this.pos = position;
     ts.getPvByProdutoasync(this);
   }).catch((error) => {
     console.log('Error getting location', error);
   });

   /*const subscription = this.geolocation.watchPosition()
     .filter((p) => p.coords !== undefined) //Filter Out Errors
     .subscribe(position => {
       console.log(position.coords.longitude + ' ' + position.coords.latitude);
       subscription.unsubscribe();
     });

   let watch = this.geolocation.watchPosition();
   watch.subscribe((data) => {
     console.log(data);
   });*/

   
   
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

  pontovenda(res){
     let popover = this.popoverCtrl.create(Produtor_PV,{respage:this,res:res});
    popover.present();

  }

  alerta(res){
    

  }

  vermapa(){
     let popover = this.popoverCtrl.create(Mapa,{respage:this});
    popover.present();

  }
}