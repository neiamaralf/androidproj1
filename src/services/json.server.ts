import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import {AlertController,  ToastController, Platform } from 'ionic-angular';

//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

class DadosUsuario {
    public nome: string = "";
    public email: string = "";
    public endereco: string = "";
    public estado: string = "";
    public cidade: string = "";
    public bairro: string = "";
    public password: string = "";
    public password2: string = "";
    public site:string="";
    public numero: any;
    public complemento: string = " ";
    public fone: string = "";
    public cep: string = "";
    public tipo: string = "0";
}

@Injectable()
export class TarefaService {
    public speechtext: string;
    public dadosUsuario: DadosUsuario = new DadosUsuario();
    public logged: boolean = false;
    public sound: boolean = true;
    public mic: boolean = true;
    public searchbar: boolean = false;
    public storage: Storage = new Storage();
    public footer: string = "";
    private baseURI: string = "http://www.athena3d.com.br/bioatest/";
    public mostraCep: boolean = false;
    public hideForm: boolean = false;
    public isEdited: boolean = false;
    public tabela: string = "usuarios";

    constructor(/*private fb: Facebook,*/public plt: Platform, public toastCtrl: ToastController, public speechRecognition: SpeechRecognition, 
    public tts: TextToSpeech, public http: Http,public alertCtrl: AlertController) {
        //this.cleanstorage();         
       this.getUDfromstorage();

        if (plt.is('android') || plt.is('ios')) {
            speechRecognition.isRecognitionAvailable().then((available: boolean) => this.sendNotification(available))
            /*speechRecognition.startListening()
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
                )*/
            speechRecognition.hasPermission().then((hasPermission: boolean) => this.sendNotification(hasPermission))
            speechRecognition.requestPermission().then(() => this.sendNotification('Granted'),() => this.sendNotification('Denied'));
        }
    }

    sendNotification(message): void {
        let notification = this.toastCtrl.create({ message: message, duration: 3000 });
        notification.present();
    }

    async getfala() {
        this.speechRecognition.startListening({
            language: 'pt-BR', matches: 1, prompt: ""/*Android only*/, showPopup: true/*Android only*/, showPartial: false/*iOS only */
        }).
            subscribe((matches: Array<string>) => this.speechtext = matches[0], (onerror) => this.sendNotification('erro:' + onerror))
    }

    async falatexto(): Promise<any> {
        try {
            await this.tts.speak({ text: this.speechtext, locale: 'pt-BR', rate: 0.75 });
        }
        catch (e) {

        }
    }

    assertlogin(nav:any,page:any) {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                this.storage.get('token').then((token) => {
                    this.verificatoken(token, userid,nav,page);
                })
            })
        });
    }

    createEntry(nav:any,page:any) {
        let body: string =
            "key=create&name=" + this.dadosUsuario.nome +
            "&password=" + this.dadosUsuario.password +
            "&email=" + this.dadosUsuario.email +
            "&endereco=" + this.dadosUsuario.endereco +
            "&estado=" + this.dadosUsuario.estado +
            "&cidade=" + this.dadosUsuario.cidade +
            "&bairro=" + this.dadosUsuario.bairro +
            "&numero=" + this.dadosUsuario.numero +
            "&complemento=" + this.dadosUsuario.complemento +
            "&fone=" + this.dadosUsuario.fone +
            "&cep=" + this.dadosUsuario.cep +
            "&tipo=" + this.dadosUsuario.tipo +
            "&site=" + this.dadosUsuario.site +
            "&tabela=" + this.tabela,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = this.baseURI + "manage-data.php";
        let obs = this.http.post(url, body, options);
        obs.map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                if (data.insert === "ok") {      
                    if (this.tabela == "usuarios") {
                        this.dologin(this.dadosUsuario.email, this.dadosUsuario.password, false, nav, page);
                        this.sendNotification(`O usuário: ${name} foi cadastrado com sucesso!`);
                    }
                    else if (this.tabela == "certificadoras"){
                        this.sendNotification(`A certificadora ${name} foi cadastrada com sucesso!`);
                         
                        nav.pop();
                    }
                }
                else {
                    if (data.insert === "23000")
                        this.sendNotification('Email já cadastrado');
                    else
                        this.sendNotification('Algo deu errado! ' + data.insert);
                }
            });
    }

    updateEntry(userid) {
        let body: string =
            "key=update&username=" + this.dadosUsuario.nome +
            "&recordID=" + userid +
            "&password=" + this.dadosUsuario.password +
            "&email=" + this.dadosUsuario.email +
            "&endereco=" + this.dadosUsuario.endereco +
            "&estado=" + this.dadosUsuario.estado +
            "&cidade=" + this.dadosUsuario.cidade +
            "&bairro=" + this.dadosUsuario.bairro +
            "&numero=" + this.dadosUsuario.numero +
            "&complemento=" + this.dadosUsuario.complemento +
            "&site=" + this.dadosUsuario.site +
            "&fone=" + this.dadosUsuario.fone +
            "&cep=" + this.dadosUsuario.cep +
            "&tipo=" + this.dadosUsuario.tipo +
            "&tabela=" + this.tabela,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = this.baseURI + "manage-data.php";

        this.http.post(url, body, options).map(res => res.json()).subscribe(data => {
            if (this.tabela == "usuarios") {
                if (data[0].id != "") {
                    this.setstorage(data[0]);
                    this.sendNotification(`Cadastro atualizado com sucesso`);
                }
                else {
                    this.getUDfromstorage();
                    if (data.update === "23000")
                        this.sendNotification('Email já cadastrado');
                    else
                        this.sendNotification('Algo deu errado: ' + data.update);
                }
            }
            else if (this.tabela == "certificadoras") {
                this.getUDfromstorage();
                if(data.update=="ok")
                 this.sendNotification(`Cerfificadora atualizada com sucesso.`);
            }
        });
    }

    deleteEntry(userid) {            
        let name: string = this.dadosUsuario.nome,
            body: string = "key=delete&recordID=" + userid +
                "&tabela=" + this.tabela,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = this.baseURI + "manage-data.php";

        this.http.post(url, body, options).map(res => res.json()).subscribe(data => {
            if (data.delete === "ok") {
                if (this.tabela == "usuarios") {
                    this.logout();
                    this.sendNotification(`O usuário: ${name} foi excluído do sistema`);
                }
                else if (this.tabela == "certificadoras") {
                    this.sendNotification(`A certificadora ${name} foi excluída do sistema`);
                }
            }
            else {
                this.sendNotification('Algo deu errado! Tente novamente.');
            }
        });
    }


    pesquisaCep() {
        let body: string = "key=buscacep&cep=" + this.dadosUsuario.cep,
            type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = this.baseURI + "manage-data.php";
        let obs = this.http.post(url, body, options);
        obs.map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                if (data[0].cepok == "true") {
                    this.mostraCep = false;
                    this.dadosUsuario.endereco = data[0].endereco;
                    this.dadosUsuario.cidade = data[0].cidade;
                    this.dadosUsuario.bairro = data[0].bairro;
                    this.dadosUsuario.estado = data[0].estado;
                }
                else {
                    this.sendNotification('CEP inválido!');
                    this.getUDfromstorage();
                }
            });
    }


    verificatoken(token, userid,nav:any,page:any) {
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
                    this.getUDfromstorage();
                    nav.push(page);
                    console.log('username=' + this.dadosUsuario.nome);
                    console.log('logged 2=' + this.logged);
                }
            });
    }

    permissoes = ['public_profile', 'user_friends', 'email', 'user_about_me'];
    //loginResponse: FacebookLoginResponse;
    perfil: any;

    loginprompt(nav:any,page:any) {
        if (0) {
            /*this.fb.login(this.permissoes)
              .then((res: FacebookLoginResponse) => {
                this.loginResponse = res;
                this.fb.api('/me?fields=picture,name', this.permissoes).then((o) => {
                  this.perfil = o;
                });
              }).catch(e => console.log('Erro', e));*/
        }
        else if (1) {
            let prompt = this.alertCtrl.create({

                inputs: [{ type: 'email', name: 'email', placeholder: 'digite seu email' },
                { type: 'password', name: 'senha', placeholder: 'digite sua senha' }],
                buttons: [
                    { text: 'Cancelar' },
                    {
                        text: 'Entrar',
                        handler: data => {
                            this.dologin(data.email, data.senha,true,nav,page);   
                        }
                    }
                ]
            });

            prompt.present();
        }
    }


    dologin(email, password,showprompt:boolean,nav:any,page:any) {
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
                    this.setstorage(data[0]);
                   
                    if (nav != null){
                        if (nav.first() != nav.getActive())
                            nav.popTo(nav.first());
                        nav.push(page);
                    }
                }
                else {
                    alert('erro :' + data[0].nome);
                    if(showprompt) this.loginprompt(nav,page);
                }
            });
    }

    
       public retdata=[];

    getCertList(mn:any) {
        let type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/retrieve-data.php?key=cert";
        let obs = this.http.get(url, options);

        obs.map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                mn.menuitems=[];
                this.retdata=data;
                console.log(this.retdata);
                if(this.retdata[0].nome!="null"){
                 this.retdata.forEach(element => {
                  mn.menuitems.push({title:element.nome,tipo:element.id,showdados:false});
                 });
                }                
            });
    }

    getCertDados(idcert) {
        let type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/retrieve-data.php?key=certdados&idcert="+idcert;
        let obs = this.http.get(url, options);

        obs.map(res => res.json())
            .subscribe((data) => {               
                if (data[0].nome != "null") {
                    this.dadosUsuario.nome = data[0].nome;
                    this.dadosUsuario.email = data[0].email;
                    this.dadosUsuario.endereco =data[0].endereco;
                    this.dadosUsuario.estado = data[0].estado;
                    this.dadosUsuario.cidade = data[0].cidade;
                    this.dadosUsuario.bairro = data[0].bairro;
                    this.dadosUsuario.numero = data[0].numero;
                    this.dadosUsuario.site = data[0].site;
                    this.dadosUsuario.complemento = data[0].complemento;
                    this.dadosUsuario.fone = data[0].fone;
                    this.dadosUsuario.cep = data[0].cep;
                }                
            });
    }

    getUFList(ceppage:any) {
        let type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/retrieve-data.php?key=uf";
        let obs = this.http.get(url, options);

        obs.map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                ceppage.UFList.ufs=[];
                this.retdata=data;
                console.log(this.retdata);
                if(this.retdata[0].uf!="null"){
                 this.retdata.forEach(element => {
                  ceppage.UFList.ufs.push({id:element.id,sigla:element.uf});
                 });
                 //ceppage.UF=ceppage.UFList.ufs[0].sigla;
                 //console.log(ceppage.UF);
                }                
            });
    }

    getCEPList(ceppage:any) {
        let type: string = "application/x-www-form-urlencoded; charset=UTF-8",
            headers: any = new Headers({ 'Content-Type': type }),
            options: any = new RequestOptions({ headers: headers }),
            url: any = "http://www.athena3d.com.br/bioatest/retrieve-data.php?key=buscacep&uf="+
            ceppage.UF+"&cidade="+ceppage.cidade+"&endereco="+ceppage.endereco
            +"&offset="+ceppage.offset+"&limit="+ceppage.limit;
        

        this.http.get(url, options).map(res => res.json())
            .subscribe((data) => {
                console.log(data);
                //ceppage.CEPList=[];
                this.retdata=data;
                console.log(this.retdata);
                if(this.retdata[0].endereco!="null"){
                 this.retdata.forEach(element => {
                  ceppage.CEPList.push({endereco: element.endereco,bairro: element.bairro,cidade: element.cidade,
                      estado: element.uf,cep: element.cep});
                 });
                 ceppage.offset+=ceppage.limit;
                 console.log(ceppage.CEPList);
                } 
                else ceppage.cansearchCEP=false  ;            
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
                                this.mostraCep=true;
                                this.cleanstorage();
                            }
                        });
                })
            })
        });
    }

    setstorage(jsonresult:any) {
        if (jsonresult.token != "null") this.storage.set('token', jsonresult.token);
        if (jsonresult.id != "null") this.storage.set('userid', jsonresult.id);
        this.storage.set('username', jsonresult.nome);
        this.storage.set('email', jsonresult.email);
        this.storage.set('senha', jsonresult.senha);
        if (jsonresult.admin != "null") this.storage.set('admin', jsonresult.admin);

        this.storage.set('endereco', jsonresult.endereco);
        this.storage.set('estado', jsonresult.estado);
        this.storage.set('cidade', jsonresult.cidade);
        this.storage.set('bairro', jsonresult.bairro);
        this.storage.set('numero', jsonresult.numero);
        this.storage.set('complemento', jsonresult.complemento);
        this.storage.set('fone', jsonresult.fone);
        this.storage.set('cep', jsonresult.cep);
        this.storage.set('tipo', jsonresult.tipo);

        this.dadosUsuario.nome = jsonresult.nome;
        this.dadosUsuario.email = jsonresult.email;
        this.dadosUsuario.password = jsonresult.senha;
        this.dadosUsuario.password2 = jsonresult.senha;
        this.dadosUsuario.endereco = jsonresult.endereco;
        this.dadosUsuario.estado = jsonresult.estado;
        this.dadosUsuario.cidade = jsonresult.cidade;
        this.dadosUsuario.bairro = jsonresult.bairro;
        this.dadosUsuario.numero = jsonresult.numero;
        this.dadosUsuario.complemento = jsonresult.complemento;
        this.dadosUsuario.fone =jsonresult. fone;
        this.dadosUsuario.cep = jsonresult.cep;
        this.dadosUsuario.tipo = jsonresult.tipo;
    }

    getUDfromstorage() {
        this.storage.ready().then(() => {
            this.storage.get('username').then((nome) => { this.dadosUsuario.nome = nome; });
            this.storage.get('email').then((email) => { this.dadosUsuario.email = email; });
            this.storage.get('senha').then((password) => { this.dadosUsuario.password2 = this.dadosUsuario.password = password; });
            this.storage.get('endereco').then((endereco) => { this.dadosUsuario.endereco = endereco; });
            this.storage.get('estado').then((estado) => { this.dadosUsuario.estado = estado; });
            this.storage.get('cidade').then((cidade) => { this.dadosUsuario.cidade = cidade; });
            this.storage.get('bairro').then((bairro) => { this.dadosUsuario.bairro = bairro; });
            this.storage.get('numero').then((numero) => { this.dadosUsuario.numero = numero; });
            this.storage.get('complemento').then((complemento) => { this.dadosUsuario.complemento = complemento; });
            this.storage.get('fone').then((fone) => { this.dadosUsuario.fone = fone; });
            this.storage.get('cep').then((cep) => { this.dadosUsuario.cep = cep; });
            this.storage.get('tipo').then((tipo) => { this.dadosUsuario.tipo = tipo; });
        });
    }


    resetFields(): void {
        this.dadosUsuario.nome = "";
        this.dadosUsuario.password = "";
        this.dadosUsuario.email = "";      
        this.dadosUsuario.password2 = "";
        this.dadosUsuario.endereco = "";
        this.dadosUsuario.estado = "";
        this.dadosUsuario.cidade = "";
        this.dadosUsuario.bairro = "";
        this.dadosUsuario.numero = "";
        this.dadosUsuario.site = "";
        this.dadosUsuario.complemento = " ";
        this.dadosUsuario.fone = "";
        this.dadosUsuario.cep = "";
        this.dadosUsuario.tipo = "0";
    }

    cleanstorage() {
        this.storage.remove('userid');
        this.storage.remove('username');
        this.storage.remove('token');
        this.storage.remove('senha');
        this.storage.remove('admin');
        this.storage.remove('email');
        this.storage.remove('endereco');
        this.storage.remove('estado');
        this.storage.remove('cidade');
        this.storage.remove('bairro');
        this.storage.remove('numero');
        this.storage.remove('complemento');
        this.storage.remove('fone');
        this.storage.remove('cep');
        this.storage.remove('tipo');
        this.resetFields();
    }

}

