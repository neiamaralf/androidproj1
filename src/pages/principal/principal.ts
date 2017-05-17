import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, NavParams, Content, ActionSheetController, ToastController, LoadingController, Loading } from 'ionic-angular';
import { DadosUsuario, TarefaService } from '../../services/json.server';
import { CadastroPage } from '../../pages/cadastrologin/cadastrologin';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
declare var cordova: any;
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
  items: Array<{
    cor: number, title: string, id: number, show: boolean,
    menuitems: Array<{
      title: string, tipo: number, showdados: boolean,
      linhas: Array<{
        title: string,
        info: string,
        imagem?: string
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
        password?: string,
        password2?: string,
        idmarca?: any,
        idcategoria?: any,
        imagem?: string
      }
    }>
  }>;

  limit: number = 10;
  offset: number = 0;
  cansearchProd: boolean = false;
  constructor(public platform: Platform, public navCtrl: NavController, public ts: TarefaService, public navParams: NavParams, private camera: Camera, private transfer: Transfer, private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
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
              { title: 'ENDEREÇO', info: ts.dadosUsuario.endereco + ',' + ts.dadosUsuario.numero + '-' + ts.dadosUsuario.bairro + '-' + ts.dadosUsuario.cidade + '-' + ts.dadosUsuario.estado },
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

        this.items.push({ cor: 4, title: 'PRODUTOS', id: 9, show: false, menuitems: [] });
        //ts.getProdList(this,this.items[8],"*"); 

      }
      setTimeout(() => { this.cont.resize(); }, 500);
    }, 500);
  }


  public uploadImage() {
    // Destination URL
    var url = "http://www.athena3d.com.br/bioatest/uploadimage.php";

    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);

    // File name only
    var filename = this.lastImage;

    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename }
    };

    const fileTransfer: TransferObject = this.transfer.create();

    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      console.log(data);
      this.loading.dismissAll()
      this.presentToast('Image succesful uploaded.');
    }, err => {
      this.loading.dismissAll()
      this.presentToast('Error while uploading file.');
    });
  }


  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
    }, error => {
      this.presentToast('Error while storing file.');
    });
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
      return cordova.file.dataDirectory + img;
    }
  }

  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
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
          this.ts.getProdList(this, this.items[8], "*");
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

  menuitemclick(item, menuitem) {
    if (item.title == "CERTIFICADORAS") {
      this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "certificadoras", idcert: menuitem.tipo, formvariables: menuitem.dbdata, menuitem: menuitem });
    }
    else if (item.title == "MEU BIOATEST") {
      if (menuitem.tipo == 0) {
        this.navCtrl.push(CadastroPage, { edit: true, getcep: false, tabela: "usuarios", formvariables: this.ts.dadosUsuario, menuitem: menuitem });
      }
    }
  }

  novacert(event, item) {
    this.navCtrl.push(CadastroPage, { edit: false, getcep: true, tabela: "certificadoras", formvariables: new DadosUsuario, item: item });
    event.stopPropagation();
  }

  deleteEntry(menuitem) {
    this.ts.tabela = "certificadoras";
    this.ts.deleteEntry(menuitem.tipo, menuitem.dbdata);
    event.stopPropagation();
  }

  itemTapped(event, item) {
    for (let data of this.items) {
      if (data != item)
        data.show = false;
    }
    item.show = !item.show;
    if (item.show) {
      if (item.id == 9) {
        this.cansearchProd = true;
        this.populateListProd();
      }
    }
    else {
      if (item.id == 9) {
        this.cansearchProd = false;
        this.offset = 0;
        item.menuitems = [];
      }
    }

    this.hasabaaberta = item.show;
    if (item.show && item.title == "CERTIFICADORAS") {
      this.ts.getCertList(this.items[7]);
    }
    event.stopPropagation();
  }
}
