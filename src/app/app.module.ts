import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BioatestApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { BuscaCEPPage } from '../pages/buscacep/buscacep';
import { Principal } from '../pages/principal/principal';
import { Page3 } from '../pages/page3/page3';
import { newNavbar} from '../pages/cabecalho/cabecalho';
import { Rodape } from '../pages/rodape/rodape'
import { TarefaService} from '../services/json.server';
import { CadastroPage } from '../pages/cadastrologin/cadastrologin';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { ElasticModule } from 'angular2-elastic';
import { ListaPage } from '../pages/listaprodutos/listaprodutos';
@NgModule({
  declarations: [
    BioatestApp,
    HomePage,
    Principal, 
    Page3,
    newNavbar,
    Rodape,
    CadastroPage,
    BuscaCEPPage,
    ListaPage
  ],
  imports: [
    IonicModule.forRoot(BioatestApp),ElasticModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    BioatestApp,
    HomePage,
    Principal,
    Page3,
    newNavbar,
    Rodape,
    CadastroPage,
    BuscaCEPPage,
    ListaPage
  ],
  providers: [
    SpeechRecognition,
    TextToSpeech,
    StatusBar,
    SplashScreen,
    newNavbar,
    Rodape,
    File,
    Transfer,
    Camera,
    FilePath,
    TarefaService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
