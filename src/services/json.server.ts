import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ToastController ,Platform } from 'ionic-angular';

interface DadosUsuario {

     nome: string;
     email: string;
}

@Injectable()
export class TarefaService {
    public speechtext: string;
    public dadosUsuario: DadosUsuario ;
    public logged: boolean = false;
    public sound: boolean = true;
    public mic: boolean = true;
    public searchbar: boolean = false;
    public storage: Storage = new Storage();
    public footer: string = "";

    constructor(public plt: Platform,public toastCtrl: ToastController, public speechRecognition: SpeechRecognition, public tts: TextToSpeech, public http: Http) {
        //this.cleanstorage();        
        this.assertlogin();
        this.getUDfromstorage();

       if(plt.is('android')||plt.is('ios')){
        speechRecognition.isRecognitionAvailable()
            .then((available: boolean) => this.sendNotification(available))
        speechRecognition.startListening()
            .subscribe(
            (matches: Array<string>) => this.sendNotification(matches),
            (onerror) => this.sendNotification('error:' + onerror)
            )
        if(plt.is('ios'))
         speechRecognition.stopListening()

        speechRecognition.getSupportedLanguages()
            .then(
            (languages: Array<string>) => this.sendNotification(languages),
            (error) => this.sendNotification(error)
            )
        speechRecognition.hasPermission()
            .then((hasPermission: boolean) => this.sendNotification(hasPermission))

        speechRecognition.requestPermission()
            .then(
            () => this.sendNotification('Granted'),
            () => this.sendNotification('Denied')
            )
       }
    
    
    }

    sendNotification(message): void {
        let notification = this.toastCtrl.create({ message: message, duration: 3000 });
        notification.present();
    }

    async getfala() {
        this.speechRecognition.startListening({
            language: 'pt-BR',
            matches: 1,
            prompt: "",      // Android only 
            showPopup: true,  // Android only 
            showPartial: false // iOS only 
        }).subscribe(
            (matches: Array<string>) => this.speechtext = matches[0],
            (onerror) => this.sendNotification('error:' + onerror)
            )

    }

    async falatexto(): Promise<any> {
        try {
            await this.tts.speak({
                text: this.speechtext,
                locale: 'pt-BR',
                rate: 0.75
            });
        }
        catch (e) {

        }
    }

    getUDfromstorage() {
        this.storage.ready().then(() => {
            this.storage.get('username').then((nome) => {
                this.dadosUsuario.nome = nome;
            });
            this.storage.get('email').then((email) => {
                this.dadosUsuario.email = email;
            });
        });
    }

    assertlogin() {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                this.storage.get('token').then((token) => {
                    this.verificatoken(token, userid);
                })
            })
        });
    }

    verificatoken(token, userid) {
        let body: string = "key=asserttoken&token=" + token + "&userid=" + userid,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/manage-data.php";
        this.http.post(url, body, options)
            .map(res => res.json())
            .subscribe((data) => {
                console.log('goodtoken=' + data[0].goodtoken);
                if (data[0].goodtoken == "true") {
                    this.logged = true;
                    this.storage.set('username', data[0].nome);
                    this.storage.set('email', data[0].email);
                    this.dadosUsuario.nome = data[0].nome;
                    this.dadosUsuario.email = data[0].email;

                    console.log('username=' + this.dadosUsuario.nome);
                    console.log('logged 2=' + this.logged);
                }
            });

    }

    dologin(email, password) {
        let device: string = "test";
        let body: string = "key=login&email=" + email + "&password=" + password + "&device=" + device,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/manage-data.php";
        let obs = this.http.post(url, body, options);

        obs.map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                if (data[0].token != "") {
                    this.logged = true;
                    this.setstorage(data[0].token, data[0].id, data[0].nome, password, data[0].admin, email);
                }
                else {
                    alert('erro :' + data[0].nome);
                }
            });
    }

    logout() {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                this.storage.get('token').then((token) => {
                    let body: string = "key=logout&token=" + token + "&userid=" + userid,
                        type: string = "application/x-www-form-urlencoded; charset=UTF-8",
                        headers: any = new Headers({ 'Content-Type': type }),
                        options: any = new RequestOptions({ headers: headers }),
                        url: any = "http://www.athena3d.com.br/bioatest/manage-data.php";
                    this.http.post(url, body, options)
                        .map(res => res.json())
                        .subscribe((data) => {
                            console.log('logout=' + data[0].logout);
                            if (data[0].logout == "ok") {
                                this.logged = false;
                                this.cleanstorage();
                            }
                        });
                })
            })
        });
    }

    setstorage(token, userid, username, senha, admin, email) {
        this.storage.set('token', token);
        this.storage.set('userid', userid);
        this.storage.set('username', username);
        this.storage.set('email', email);
        this.storage.set('senha', senha);
        this.storage.set('admin', admin);
        this.dadosUsuario.nome = username;
        this.dadosUsuario.email = email;
    }

    cleanstorage() {
        this.storage.remove('userid');
        this.storage.remove('username');
        this.storage.remove('token');
        this.storage.remove('senha');
        this.storage.remove('admin');
        this.storage.remove('email');
    }

}

