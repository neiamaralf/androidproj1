import { Component, ViewChild } from '@angular/core';
import {
  ModalController, AlertController, NavController, Platform, NavParams, Content,
  ActionSheetController, ToastController, LoadingController, Loading
} from 'ionic-angular';
import { DadosUsuario, TarefaService } from '../../services/json.server';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
declare var cordova: any;
export class DBData{
  constructor(){
    this.items = [];
  }
   public items: Array<{
    cor: number, title: string, id: number, show: boolean,
    menuitems: Array<{
      title: string, tipo: number, showdados: boolean,
      linhas: Array<{
        title: string,
        info: string,
        imagem?: string
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
        idcategoria?: any,
        imagem?: string
      }
    }>
  }>;
}
@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html'
})
export class Principal {
  lastImage: string = null;
  loading: Loading;
  @ViewChild('con1') cont: Content;
  selectedItem: any;
  hasabaaberta: boolean = false;
  menubuttons: string[];
  dbdata:DBData=new DBData();
  limit: number = 10;
  offset: number = 0;
  cansearchProd: boolean = false;
  constructor(public platform: Platform, public navCtrl: NavController, public ts: TarefaService, public navParams: NavParams,
    public modalCtrl: ModalController, private camera: Camera,
    private transfer: Transfer, private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    setTimeout(() => {
      ts.getUDfromstorage();

      this.selectedItem = navParams.get('item');
      this.dbdata.items.push({
        cor: 4, title: 'MEU BIOATEST', id: 1, show: false,
        menuitems: [
          {
            title: 'DADOS', tipo: 0, showdados: false, linhas: [
              { title: 'NOME', info: ts.dadosUsuario.nome },
              { title: 'EMAIL', info: ts.dadosUsuario.email },
              { title: 'ENDEREÇO', info: ts.dadosUsuario.endereco + ',' + ts.dadosUsuario.numero + '-' + ts.dadosUsuario.bairro + '-' + ts.dadosUsuario.cidade + '-' + ts.dadosUsuario.estado },
              { title: 'FONE', info: ts.dadosUsuario.fone }]
          },
          { title: 'COMPRAS', tipo: 1, showdados: false, linhas: [] },
          { title: 'MENSAGENS', tipo: 2, showdados: false, linhas: [] },
          { title: 'UPLOADS', tipo: 3, showdados: false, linhas: [] }]
      });
      this.dbdata.items.push({ cor: 4, title: 'BUSCAR PRODUTO', id: 2, show: false, menuitems: [] });
      this.dbdata.items.push({ cor: 4, title: 'BUSCAR PROPRIEDADE', id: 3, show: false, menuitems: [] });
      this.dbdata.items.push({ cor: 4, title: 'BUSCAR PONTO DE VENDA', id: 4, show: false, menuitems: [] });
      this.dbdata.items.push({ cor: 4, title: 'CONTEÚDO', id: 5, show: false, menuitems: [] });
      this.dbdata.items.push({ cor: 4, title: 'PREMIUM', id: 6, show: false, menuitems: [] });
      this.dbdata.items.push({ cor: 1, title: 'PROMOÇÕES DE HOJE', id: 7, show: false, menuitems: [] });
      if (ts.dadosUsuario.tipo == "3") {
         this.dbdata.items.push({ cor: 4, title: 'CERTIFICADORAS', id: 8, show: false, menuitems: [] });
         ts.getCertList(this.dbdata.items[7]);
         this.dbdata.items.push({ cor: 4, title: 'CATEGORIAS', id: 9, show: false, menuitems: [] });
         ts.getCategoriasList(this.dbdata.items[8]);
         this.dbdata.items.push({ cor: 4, title: 'MARCAS', id: 10, show: false, menuitems: [] });
         ts.getMarcasList(this.dbdata.items[9]);
        this.dbdata.items.push({ cor: 4, title: 'PRODUTOS', id: 11, show: false, menuitems: [] });
      }
      setTimeout(() => { this.cont.resize(); }, 500);
    }, 500);
  }


  public uploadImage(menuitem, linha) {
    var url = "http://www.athena3d.com.br/bioatest/uploadimage.php";
    var newfilename = this.createFileName();
    var targetPath = this.lastImage;
    var options = {
      fileKey: "file",
      fileName: newfilename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': newfilename, 'idprod': menuitem.dbdata.id }
    };
    const fileTransfer: TransferObject = this.transfer.create();
    this.loading = this.loadingCtrl.create({
      content: 'Enviando foto...',
    });
    this.loading.present();
    fileTransfer.upload(targetPath, url, options).then(data => {
      console.log(data);
      this.loading.dismissAll();
      setTimeout(() => { menuitem.dbdata.imagem = newfilename; linha.info = newfilename }, 500)

      this.presentToast('Imagem enviada com sucesso.');
    }, err => {
      this.loading.dismissAll();
      this.presentToast('Erro no envio da imagem.');
    });
  }

  deletaImagem(menuitem, linha) {
    this.ts.deleteIMG(menuitem, linha);
  }


  public takePicture(menuitem, sourceType, linha) {
    var options = {
      allowEdit:true,
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      targetWidth: 150,
      targetHeight: 150
    };

    this.camera.getPicture(options).then((imagePath) => {
      console.log("imagePath:" + imagePath);
      let newFileName = this.createFileName();
      if (!this.platform.is("mobile") || this.platform.is("mobileweb")) {
        let base64Image = //'data:image/jpeg;base64,' + 
          imagePath;
        menuitem.dbdata.imagem = newFileName;
        this.ts.addImagetoDB("0", "produtos", base64Image, newFileName);
      }
      else {
        if (this.platform.is("Win32NT") || this.platform.is("windows")) {
          cordova.file = {
            dataDirectory: 'ms-appdata:///local/'
          }
        }
        this.lastImage
        if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
            .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.lastImage = correctPath + currentName;
              this.deletaImagem(menuitem, linha);
              this.uploadImage(menuitem, linha);
            });
        } else {
          //console.log("cordova.file.dataDirectory:" + cordova.file.dataDirectory);
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.lastImage = correctPath + currentName;
          this.deletaImagem(menuitem, linha);
          this.uploadImage(menuitem, linha);
        }
      }

    }, (err) => {
      this.presentToast('Erro ao selecionar imagem.');
    });
  }

  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return "http://athena3d.com.br/bioatest/imagens/" + img;
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


  populateListProd(): Promise<any> {
    if (this.cansearchProd) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.ts.getProdList(this, this.dbdata.items[10], "*");
          resolve();
        }, 500);
      });
    }
    else return null;
  }

  showhideclick(event, item, menuitem) {
    menuitem.showdados = !menuitem.showdados;
    if (menuitem.showdados) {

    }

    event.stopPropagation();
  }

  editaNome(insert,item, menuitem) {
    let alert = this.alertCtrl.create({
      title: insert?'Inserir '+item.title:'Editar '+item.title,
      inputs: [
        {
          name: 'nome',
          label:"NOME",
          placeholder: 'Digite o nome',
          value:menuitem!=null?menuitem.dbdata.nome:''
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
              this.ts.updateSoumcampo(this,insert,menuitem!=null?menuitem.tipo:-1,"nome",data.nome,item,menuitem);
            } else {
              
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  menuitemclick(event,item, menuitem) {
    if (item.title == "CERTIFICADORAS") {
      this.navCtrl.push(CadastroPage, {principal:this, edit: true, getcep: false, tabela: "certificadoras", idcert: menuitem.tipo, formvariables: menuitem.dbdata, item: { title: "certificadora" }, menuitem: menuitem });
    }
    else if (item.title == "PRODUTOS") {
      this.navCtrl.push(CadastroPage, {principal:this, edit: true, getcep: false, tabela: "produtos", idcert: menuitem.tipo, formvariables: menuitem.dbdata, item: { title: "produtos" }, menuitem: menuitem });
    }
    else if (item.title == "MEU BIOATEST") {
      if (menuitem.tipo == 0) {
        this.navCtrl.push(CadastroPage, {principal:this, edit: true, getcep: false, tabela: "usuarios", formvariables: this.ts.dadosUsuario, item: { title: "meu cadastro" }, menuitem: menuitem });
      }
    }
    else
     this.editaNome(false,item, menuitem); 
     event.stopPropagation();
  }

  novacert(event, item) {
    if (item.title == "CERTIFICADORAS" || item.title == 'PRODUTOS') {
      let proddados = new DadosUsuario;
      proddados.idcategoria = "22";
      proddados.idmarca = "0";
      let modal = this.modalCtrl.create(CadastroPage, {principal:this, edit: false, getcep: item.title == "PRODUTOS" ? false : true, tabela: item.title.toLowerCase(), formvariables: proddados, item: item });
      modal.present();
    }
    else
     this.editaNome(true,item, null); 
    event.stopPropagation();
  }

  deleteEntry(event, item, menuitem) {
    this.ts.tabela = item.title.toLowerCase();
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
            this.ts.deleteEntry(this,item,menuitem.tipo, menuitem.dbdata);
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
          this.ts.getCertList(this.dbdata.items[7]);
          break;
        case 9:
          this.ts.getCategoriasList(this.dbdata.items[8]);
          break;
        case 10:
          this.ts.getMarcasList(this.dbdata.items[9]);
          break;
        case 11:
          this.cansearchProd = true;
          this.populateListProd();
          break;
      }
    }
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
      item.menuitems = [];
    }
    else 
      this.updatemenuitemslist(item);        
   

    this.hasabaaberta = item.show;
    if (item.show && item.title == "CERTIFICADORAS") {
      this.ts.getCertList(this.dbdata.items[7]);
    }
    else if (item.show && item.title == "CATEGORIAS") {
      this.ts.getCategoriasList(this.dbdata.items[8]);
    }
    else if (item.show && item.title == "MARCAS") {
      this.ts.getMarcasList(this.dbdata.items[9]);
    }
    event.stopPropagation();
  }
}
