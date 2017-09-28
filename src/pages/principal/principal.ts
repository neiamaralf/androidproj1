import { Component, ViewChild , OnDestroy} from '@angular/core';
import {
  ViewController,ModalController, AlertController, NavController, Platform, NavParams, Content,
  ActionSheetController, ToastController, LoadingController, Loading,Searchbar
} from 'ionic-angular';
import { DadosUsuario, TarefaService } from '../../services/json.server';
import { CadastroPage } from '../cadastrologin/cadastrologin';

import { PaginaResultado } from '../buscas/resultado';
import { ListaPage } from '../listaprodutos/listaprodutos';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import {Subscription} from "rxjs";
import {TimerObservable} from "rxjs/observable/TimerObservable";

declare var cordova: any;
export class DBData {
  constructor() {
    this.items = [];
    this.show=false;
   
  }
  public show:boolean;
  public items: Array<{
    cor?: number, title?: string, id?: number, show?: boolean,tabela?:string,
    menuitems: Array<{
      title: string, tipo?: number, showdados?: boolean, showeditbutton?: boolean,tabela?:string,
      linhas: Array<{
        title: string,
        info: string,
        imagem?: string,
        dbdata:DBData,
        tabela?:string
      }>,
      dbdata?: {
        id?: any,
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
        password?: string,
        password2?: string,
        idmarca?: any,
        idproduto?: any,
        idcategoria?: any,
        imagem?: string,
        descricao?: string,
        preco?:number
      }
    }>
  }>;
}

@Component({
  template: `
  <ion-header>
   <ion-toolbar color="cor1">
        <ion-title>
            Buscar
        </ion-title>
        <ion-buttons start>
            <button ion-button (click)="close(null)">
                  <span ion-text color="primary" showWhen="ios">Cancelar</span>
                  <ion-icon name="md-close" ></ion-icon>
                </button>
        </ion-buttons>
    </ion-toolbar>
     <ion-grid no-padding>
        <ion-row  align-items-center justify-content-center>
            <ion-col col-8>
             <ion-searchbar #sb placeholder="Buscar"  [(ngModel)]="sbvalue" (ionInput)="getItems($event)"></ion-searchbar>
            </ion-col>
             <ion-col col-4>
            <button ion-button icon-only clear (click)="getmic($event)"><ion-icon name="microphone" color="danger" ></ion-icon></button>
            </ion-col>
        </ion-row>
    </ion-grid>
   
   
   
  </ion-header>
  <ion-content ion-scroll>
 
    <ion-list>
    
      <button ion-item *ngFor="let item of dbdata.items[0].menuitems" (click)="close(item)">{{item.title}}</button>     
    </ion-list>
     <ion-infinite-scroll  (ionInfinite)="$event.waitFor(populate())">
            <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
    </ion-content>
  `
})
export class PopoverPage {
  @ViewChild('sb') _searchbar: Searchbar;
  dbdata: DBData = new DBData();
  public sbvalue:string;
  limit: number = 10;
  offset: number = 0;
  constructor(public viewCtrl: ViewController) {
    this.sbvalue="";
    this.dbdata.items.push({  menuitems: [] });
     setTimeout(() => {
       if(this._searchbar!=undefined)
        this._searchbar.setFocus();
      }, 150);
  }

  populate(): Promise<any> {
     return new Promise((resolve) => {
        setTimeout(() => {
          this.viewCtrl.data.principal.ts.getSearchByProd(this);
          resolve();
          this.viewCtrl.getContent().resize();
        }, 500);
      });   
  }

  close(item) {
    this.viewCtrl.dismiss().then(() => {
      if (item != null) {
       this.viewCtrl.data.principal.navCtrl.push(PaginaResultado,{item:item,tipobusca:this.viewCtrl.data.tipobusca});
      }
    })

  }

  getItems(event){
    this.offset=0;
    this.dbdata.items[0].menuitems=[];
   this.populate();
  }
}

@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html'
})
export class Principal  implements OnDestroy{
  lastImage: string = null;
  loading: Loading;
  @ViewChild('con1') cont: Content;
  selectedItem: any;
  tipobuscaproduto:string="porproduto";
  hasabaaberta: boolean = false;
  menubuttons: string[];
  dbdata: DBData = new DBData();
  limit: number = 10;
  offset: number = 0;
  offset2: number = 0;
  offset3: number = 0;
  cansearchProd: boolean = false;
  private subscription: Subscription;

  presentPopover(myEvent) {
    let popover = this.modalCtrl.create(PopoverPage, {principal:this,tipobusca:this.tipobuscaproduto});
    popover.present({
      ev: myEvent
    });
    popover.onDidDismiss((popoverData) => {
     
    })
  }

  getItems(event) {
    this.presentPopover(event);
  }

  constructor(public platform: Platform, public navCtrl: NavController, public ts: TarefaService, public navParams: NavParams,
    public modalCtrl: ModalController, private camera: Camera,
    private transfer: Transfer, private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    setTimeout(() => {
      ts.getUDfromstorage();

      this.selectedItem = navParams.get('item');
      this.dbdata.items.push({
        cor: 4, title: 'MEU BIOATEST', id: 1, show: false,tabela:"usuarios",
        menuitems: [
          {
            title: (ts.dadosUsuario.tipo == "1" || ts.dadosUsuario.tipo == "2") ? 'DADOS CADASTRAIS' : 'DADOS', tipo: 0, showdados: false,
            showeditbutton: true,
            linhas: [
              { title: 'NOME', info: ts.dadosUsuario.nome,dbdata:null },
              { title: 'EMAIL', info: ts.dadosUsuario.email,dbdata:null },
              { title: 'ENDEREÇO', info: ts.constroiendereco(ts.dadosUsuario),dbdata:null },
              { title: 'FONE', info: ts.dadosUsuario.fone,dbdata:null }]
          },
          { title: 'COMPRAS', tipo: 1, showdados: false, showeditbutton: false, linhas: [] },
          { title: 'MENSAGENS', tipo: 2, showdados: false, showeditbutton: true, linhas: [] },
          { title: 'UPLOADS', tipo: 3, showdados: false, showeditbutton: true, linhas: [] }]
      });
      if ((ts.dadosUsuario.tipo == "1" || ts.dadosUsuario.tipo == "2")) {
        this.dbdata.items[0].menuitems = [];
        this.dbdata.items[0].menuitems.push(
          {
            title: 'DADOS CADASTRAIS', tipo: 0, showdados: false, showeditbutton: true, linhas: [
              { title: 'NOME', info: ts.dadosUsuario.nome,dbdata:null },
              { title: 'EMAIL', info: ts.dadosUsuario.email,dbdata:null },
              { title: 'WEBSITE', info: ts.dadosUsuario.site,dbdata:null },
              { title: 'ENDEREÇO', info: ts.constroiendereco(ts.dadosUsuario),dbdata:null },
              { title: 'FONE', info: ts.dadosUsuario.fone,dbdata:null }]
          }
        );
        this.dbdata.items[0].menuitems.push(
          {
            title: 'DADOS DE REGISTRO', tipo: 2, showdados: false, showeditbutton: false, linhas: [
              { title: 'SOBRE', info: " ",dbdata:new DBData },
              { title: 'PRODUTOS', info: " ",dbdata:new DBData  },
              { title: 'IMAGENS', info: " ",tabela:"userimages",dbdata:new DBData  }
            ]
          },
          { title: 'UPLOADS', tipo: 3, showdados: false,showeditbutton:false, linhas: [] },
          { title: 'VENDAS REGISTRADAS', tipo: 4, showdados: false,showeditbutton:false, linhas: [] }
        );
        this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items.push({
          cor: 2, title: 'HISTÓRICO', id: 1, show: false, menuitems: [
            {
              title: 'HISTÓRICO', tipo: 2, showdados: false, showeditbutton: false,dbdata:new DBData , linhas: [{ title: '', info: "", dbdata: null }]
            }
          ]
        });
        this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items.push({
          cor: 2, title: 'VALORES', id: 1, show: false,menuitems: [
             {
              title: 'VALORES', tipo: 2, showdados: false, showeditbutton: false,dbdata:new DBData , linhas: [{ title: '', info: "", dbdata: null }]
            }
          ]
        });
        this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items.push({
          cor: 2, title: 'MISSÃO', id: 1, show: false,menuitems: [
             {
              title: 'MISSÃO', tipo: 2, showdados: false, showeditbutton: false,dbdata:new DBData , linhas: [{ title: '', info: "", dbdata: null }]
            }
          ]
        });
        this.dbdata.items[0].menuitems[1].linhas[1].dbdata.items.push({
          cor: 2, title: 'MEUS PRODUTOS', id: 1, show: false,tabela:"listaprodutos",menuitems: []
        });
        this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items.push({
          cor: 2, title: 'MINHAS IMAGENS', id: 1, show: false,menuitems: []
        });
       
        
        ts.getImgsListUsr(this, this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items[0], "*");
        ts.getProdListUsr(this, this.dbdata.items[0].menuitems[1].linhas[1].dbdata.items[0], "*");
        ts.getInfoUsuario(this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items[0],
        this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items[1],
        this.dbdata.items[0].menuitems[1].linhas[0].dbdata.items[2]);
        if (ts.dadosUsuario.tipo == "2") {
          this.dbdata.items[0].menuitems[1].linhas.push(
            { title: 'CERTIFICADORAS', info: " ", tabela: "certusr", dbdata: new DBData }
          );
          this.dbdata.items[0].menuitems[1].linhas[3].dbdata.items.push({
            cor: 2, title: 'MINHAS CERTIFICAÇÕES', id: 1, tabela: "certusr", show: false, menuitems: []
          });
          ts.getCertListUsr(this, this.dbdata.items[0].menuitems[1].linhas[3].dbdata.items[0], "*");

          this.dbdata.items[0].menuitems[1].linhas.push(
            { title: 'PONTOS DE VENDA', info: " ", dbdata: new DBData }
          );
          this.dbdata.items[0].menuitems[1].linhas[4].dbdata.items.push({
            cor: 2, title: 'MEUS PARCEIROS', id: 1, show: false, tabela: "parceiros", menuitems: []
          });
          ts.getParceirosListUsr(this, this.dbdata.items[0].menuitems[1].linhas[4].dbdata.items[0], "*");

        }
      }
      else {

      }
      if (ts.dadosUsuario.tipo == "0") {
        this.dbdata.items.push({ cor: 4, title: 'BUSCAR PRODUTO', id: 2, show: false, menuitems: [] });
        this.dbdata.items.push({ cor: 4, title: 'BUSCAR PROPRIEDADE', id: 3, show: false, menuitems: [] });
        this.dbdata.items.push({ cor: 4, title: 'BUSCAR PONTO DE VENDA', id: 4, show: false, menuitems: [] });
        this.dbdata.items.push({ cor: 4, title: 'CONTEÚDO', id: 5, show: false, menuitems: [] });
        this.dbdata.items.push({ cor: 4, title: 'PREMIUM', id: 6, show: false, menuitems: [] });
        this.dbdata.items.push({ cor: 1, title: 'PROMOÇÕES DE HOJE', id: 7, show: false, menuitems: [] });
      }
      if (ts.dadosUsuario.tipo == "3") {
        this.dbdata.items.push({ cor: 4, title: 'CERTIFICADORAS', id: 8, show: false,tabela:"certificadoras", menuitems: [] });
        ts.getCertList(this.dbdata.items[1]);
        this.dbdata.items.push({ cor: 4, title: 'CATEGORIAS', id: 9, show: false,tabela:"categorias", menuitems: [] });
        ts.getCategoriasList(this.dbdata.items[2]);
        this.dbdata.items.push({ cor: 4, title: 'MARCAS', id: 10, show: false,tabela:"marcas", menuitems: [] });
        ts.getMarcasList(this.dbdata.items[3]);
        this.dbdata.items.push({ cor: 4, title: 'PRODUTOS', id: 11, show: false,tabela:"produtos", menuitems: [] });
      }
      setTimeout(() => { this.cont.resize(); }, 500);
    }, 500);
     let timer = TimerObservable.create(2000, 3000);
        this.subscription = timer.subscribe(t => {
            console.log(t);
        });
  }

  

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  public uploadImage(menuitem, linha) {
    this.ts.storage.ready().then(() => {
      this.ts.storage.get('userid').then((idusuario) => {
        var url = "http://www.athena3d.com.br/bioatest/uploadimage.php";
        var newfilename = this.createFileName(true);
        var targetPath = this.lastImage;
        var tabela=menuitem.tabela;
        var options = {
          fileKey: "file",
          fileName: newfilename,
          chunkedMode: false,
          mimeType: "multipart/form-data",
          params: { 'tabela': tabela, 'fileName': newfilename, 'id': menuitem.dbdata.id,'idusuario':idusuario,'texto':linha.info }
        };
        console.log(options);
        console.log("targetPath="+targetPath);
        const fileTransfer: TransferObject = this.transfer.create();
        this.loading = this.loadingCtrl.create({
          content: 'Enviando foto...',
        });
        this.loading.present();
        fileTransfer.upload(targetPath, url, options).then(data => {
          console.log(data);
          this.loading.dismissAll();
          setTimeout(() => {
            menuitem.dbdata.imagem = newfilename;
            linha.info = newfilename;
          }, 500)

          this.presentToast('Imagem enviada com sucesso.');
          if (tabela == "userimages") {
            this.offset2 = 0;
            this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items[0].menuitems = [];
            this.ts.getImgsListUsr(this, this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items[0], "*");
          }
          
        }, err => {
          this.loading.dismissAll();
          this.presentToast('Erro no envio da imagem.');
        });
      });
    });
  }

  deletaImagem(menuitem, linha) {
    this.ts.tabela=menuitem.tabela;
    this.ts.deleteIMG(this,menuitem, linha);
  }

  base64MimeType(encoded) {
    var result = null;

    if (typeof encoded !== 'string') {
      return result;
    }

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) {
      result = mime[1];
    }

    return result;
  }

  public takePicture(menuitem, sourceType, linha) {
    var options = {
      allowEdit: true,
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 700,
      targetHeight: 525
    };
    console.log(menuitem);
    this.camera.getPicture(options).then((imagePath) => {
      if (!this.platform.is("mobile") || this.platform.is("mobileweb")) {
        let newFileName = this.createFileName(false);
        let base64Image =imagePath.replace(" ", "+");
        console.log(this.base64MimeType(base64Image));
        menuitem.dbdata.imagem = newFileName;
        this.ts.addImagetoDB(menuitem.dbdata.id,this, menuitem.tabela, base64Image, newFileName);
      }
      else {
        let newFileName = this.createFileName(true);
        if (this.platform.is("Win32NT") || this.platform.is("windows")) {
          cordova.file = {
            dataDirectory: 'ms-appdata:///local/'
          }
        }
        
        if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
            .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.lastImage = correctPath + currentName;
              if(menuitem.tabela=="produtos")
               this.deletaImagem(menuitem, linha);
              this.uploadImage(menuitem, linha);
            });
        } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.lastImage = correctPath + currentName;
          if (menuitem.tabela == "produtos")
            this.deletaImagem(menuitem, linha);
          this.uploadImage(menuitem, linha);
        }
      }
    }, (err) => {
      this.presentToast('Erro ao selecionar imagem.');
    });
  }

  private createFileName(addext:Boolean) {
    var d = new Date(), n = d.getTime(), newFileName = n +".";
    if(addext)newFileName=newFileName+ "jpg";
    return newFileName;
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({message: text,duration: 3000,position: 'top'});
    toast.present();
  }

  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return "http://athena3d.com.br/bioatest/" + img;
    }
  }

  public presentActionSheet(menuitem, linha) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Selecione a origem da imagem',
      buttons: [
        {
          text: 'Carregar arquivo',
          handler: () => {
            this.takePicture(menuitem, this.camera.PictureSourceType.PHOTOLIBRARY, linha);
          }
        },
        {
          text: 'Usar Câmera',
          handler: () => {
            this.takePicture(menuitem, this.camera.PictureSourceType.CAMERA, linha);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  addimagem(event,linha){
     this.presentActionSheet(linha,linha);
     event.stopPropagation();
   }

  populateListProd(): Promise<any> {
    if (this.cansearchProd) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getProdList(this, this.dbdata.items[4], "*",false);
          resolve();
        }, 500);
      });
    }
    else return null;
  }

  populateListProdUsr(): Promise<any> {
     return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getProdListUsr(this, this.dbdata.items[0].menuitems[1].linhas[1].dbdata.items[0], "*");
          resolve();
        }, 500);
      });   
  }

  populateListImgsUsr(): Promise<any> {
     return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getImgsListUsr(this, this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items[0], "*");
          resolve();
        }, 500);
      });   
  }

  populateListParceirosUsr(): Promise<any> {
     return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getParceirosListUsr(this, this.dbdata.items[0].menuitems[1].linhas[4].dbdata.items[0], "*");
          resolve();
        }, 500);
      });   
  }

  showhideclick(event, item, menuitem) {
    menuitem.showdados = !menuitem.showdados;
    if (menuitem.showdados) {

    }

    event.stopPropagation();
  }

  editaNome(insert, item, menuitem) {
    let alert = this.alertCtrl.create({
      title: insert ? 'Inserir ' + item.title : 'Editar ' + item.title,
      inputs: [
        {
          name: 'nome',
          label: "NOME",
          type:'text',
          placeholder: 'Digite o nome',
          value: menuitem != null ? menuitem.dbdata.nome : ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Salvar',
          handler: data => {
            if (data.nome) {
              this.ts.updateSoumcampo(this, insert, menuitem != null ? menuitem.tipo : -1, "nome", data.nome, item, menuitem);
            } else {

              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  menuitemclick(event, item, menuitem) {
    if (item.title == "CERTIFICADORAS") {
      this.navCtrl.push(CadastroPage, { principal: this, edit: true, getcep: false, tabela: "certificadoras", idcert: menuitem.tipo, formvariables: menuitem.dbdata, item: { title: "certificadora" }, menuitem: menuitem });
    }
    else if (item.title == "PRODUTOS") {
      this.navCtrl.push(CadastroPage, { principal: this, edit: true, getcep: false, tabela: "produtos", idcert: menuitem.tipo, formvariables: menuitem.dbdata, item: { title: "produtos" }, menuitem: menuitem });
    }
    else if (item.title == "MEU BIOATEST") {
      if (menuitem.tipo == 0) {
        this.navCtrl.push(CadastroPage, { principal: this, edit: true, getcep: false, tabela: "usuarios", formvariables: this.ts.dadosUsuario, item: { title: "meu cadastro" }, menuitem: menuitem });
      }
    }
    else
      this.editaNome(false, item, menuitem);
    event.stopPropagation();
  }

  novacert(event, item) {
    if (item.title == "CERTIFICADORAS" || item.title == 'PRODUTOS') {
      let proddados = new DadosUsuario;
      proddados.idcategoria = "22";
      proddados.idmarca = "0";
      let modal = this.modalCtrl.create(CadastroPage, { principal: this, edit: false, getcep: item.title == "PRODUTOS" ? false : true, tabela: item.title.toLowerCase(), formvariables: proddados, item: item });
      modal.present();
    }
    else
      this.editaNome(true, item, null);
    event.stopPropagation();
  }

  addproduto(event,linha){
     let modal = this.modalCtrl.create(ListaPage, {alvo:"produtos",principal: this, item: linha });
      modal.present();
      event.stopPropagation();
  }

  addpontodevenda(event,linha){
     let modal = this.modalCtrl.create(ListaPage, {alvo:"parceiros",principal: this, item: linha });
      modal.present();
      event.stopPropagation();
  } 

  addusrcert(event,linha){
     let modal = this.modalCtrl.create(ListaPage, {alvo:"certusr",principal: this, item: linha });
      modal.present();
      event.stopPropagation();
  } 

  deleteEntry(event, item, menuitem) {
    let alert = this.alertCtrl.create({
      title: 'Confirmar exclusão',
      message: 'Tem certeza que quer excluir ' + menuitem.title + '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Excluir',
          handler: () => {
            this.ts.deleteEntry(this, item, menuitem.tipo, menuitem.dbdata);
          }
        }
      ]

    });
    alert.present();
    event.stopPropagation();
  }

  updatemenuitemslist(item) {
    if (item.show) {
      switch (item.id) {
        case 8:
          this.ts.getCertList(this.dbdata.items[1]);
          break;
        case 9:
          this.ts.getCategoriasList(this.dbdata.items[2]);
          break;
        case 10:
          this.ts.getMarcasList(this.dbdata.items[3]);
          break;
        case 11:
          this.cansearchProd = true;
          this.populateListProd();
          break;
      }
      if(item.title=="MEUS PRODUTOS"){
         this.ts.getProdListUsr(this, this.dbdata.items[0].menuitems[1].linhas[1].dbdata.items[0], "*");
      }
      else if(item.title=="MINHAS IMAGENS"){
         this.ts.getImgsListUsr(this, this.dbdata.items[0].menuitems[1].linhas[2].dbdata.items[0], "*");
      }
      else if(item.title=="MEUS PARCEIROS"){
         this.ts.getParceirosListUsr(this, this.dbdata.items[0].menuitems[1].linhas[4].dbdata.items[0], "*");
      }
      else if(item.title=="MINHAS CERTIFICAÇÕES"){
         this.ts.getCertListUsr(this, this.dbdata.items[0].menuitems[1].linhas[3].dbdata.items[0], "*");
      }
     
    }
  }

  itemCreateClick(event, itemlinha){
    if(itemlinha.title=='HISTÓRICO'||itemlinha.title=='VALORES'||itemlinha.title=='MISSÃO'){
      let modal = this.modalCtrl.create(CadastroPage, { principal: this, edit: true, getcep:  false, tabela: "infousuario",
       formvariables: itemlinha.menuitems[0].dbdata,
       item:itemlinha
      });
      modal.present();
    }
    event.stopPropagation();
  }

  itemClick(event, dbdata) {
    dbdata.show = !dbdata.show;
    event.stopPropagation();
  }

  itemTapped(event, item) {
    for (let data of this.dbdata.items) {
      if (data != item)
        data.show = false;
    }
    item.show = !item.show;
    if (!item.show) {
      if (item.id == 11) {
        this.cansearchProd = false;
        this.offset = 0;
      }
      if(item.id==8||item.id==9||item.id==10||item.id==11)
      item.menuitems = [];
    }
    else{
      this.updatemenuitemslist(item);
    }


    this.hasabaaberta = item.show;
    if (item.show && item.title == "CERTIFICADORAS") {
      this.ts.getCertList(this.dbdata.items[1]);
    }
    else if (item.show && item.title == "CATEGORIAS") {
      this.ts.getCategoriasList(this.dbdata.items[2]);
    }
    else if (item.show && item.title == "MARCAS") {
      this.ts.getMarcasList(this.dbdata.items[3]);
    }
    event.stopPropagation();
  }
}
