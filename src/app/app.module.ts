import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BioatestApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Principal } from '../pages/principal/principal';
import { Page3 } from '../pages/page3/page3';
import { newNavbar} from '../pages/cabecalho/cabecalho';
import { Rodape } from '../pages/rodape/rodape'
import { TarefaService} from '../services/json.server';
import { CadastroPage } from '../pages/cadastrologin/cadastrologin';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';

@NgModule({
  declarations: [
    BioatestApp,
    HomePage,
    Principal, 
    Page3,
    newNavbar,
    Rodape,
    CadastroPage
  ],
  imports: [
    IonicModule.forRoot(BioatestApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    BioatestApp,
    HomePage,
    Principal,
    Page3,
    newNavbar,
    Rodape,
    CadastroPage
  ],
  providers: [SpeechRecognition,TextToSpeech,StatusBar,SplashScreen,newNavbar,Rodape,TarefaService,{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
