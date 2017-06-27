import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { AlertController, ToastController, Platform } from 'ionic-angular';


//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

export class DadosUsuario {
    public nome: string = "";
    public email: string = "";
    public endereco: string = "";
    public estado: string = "";
    public cidade: string = "";
    public bairro: string = "";
    public password: string = "";
    public password2: string = "";
    public site: string = "";
    public numero: any;
    public complemento: string = " ";
    public fone: string = "";
    public cep: string = "";
    public tipo: string = "0";
    public idmarca?: any;
    public idcategoria?: any;
    public imagem?: string
}

export class BodyParams {
    constructor() {
        this.params = [];
    }

    add(nome: string, valor: string){
     this.params.push({nome:nome,valor:valor})
    }

    addfromformvariables(formvariables) {
        this.add("name", formvariables.nome);
        this.add("password", formvariables.password);
        this.add("email", formvariables.email);
        this.add("endereco", formvariables.endereco);
        this.add("estado", formvariables.estado);
        this.add("cidade", formvariables.cidade);
        this.add("bairro", formvariables.bairro);
        this.add("numero", formvariables.numero);
        this.add("complemento", formvariables.complemento);
        this.add("fone", formvariables.fone);
        this.add("cep", formvariables.cep);
        this.add("tipo", formvariables.tipo);
        this.add("site", formvariables.site);
        this.add("idmarca", formvariables.idmarca);
        this.add("idcategoria", formvariables.idcategoria);
    }

    public params: Array<{ nome: string, valor: string }>;
}

export class HtmlWrapper {
    public bodyparams:BodyParams;
    public body: string;
    public baseURI: string;
    public type: string ;
    public headers: any ;
    public options: any ;
    public urlpost: any ;
    public urlget: any ;
    public httpowner: any;

    constructor(_httpowner) {
        this.bodyparams = new BodyParams();
        this.baseURI = "http://www.athena3d.com.br/bioatest/";
        this.type = "application/x-www-form-urlencoded; charset=UTF-8";
        this.headers = new Headers({ 'Content-Type': this.type });
        this.options = new RequestOptions({ headers: this.headers });
        this.urlpost = this.baseURI + "manage-data.php";
        this.urlget = this.baseURI + "retrieve-data.php";
        this.httpowner=_httpowner;
    }

    

    dopost(callback) {
        this.preparabodypost();
        this.httpowner.http.post(this.urlpost, this.body, this.options).map(res => res.json()).subscribe(data => {
            callback(this.httpowner,data);
            console.log(data);
        });
    }

    doget(callback) {
        this.preparabodypost();
        let url: any = this.urlget + "?" + this.body;
        this.httpowner.http.get(url, this.options).map(res => res.json()).subscribe((data) => {
            callback(this.httpowner, data);
            console.log(data);
        });
    }

    
    dogetusrid(callback) {
        this.httpowner.storage.ready().then(() => {
            this.httpowner.storage.get('userid').then((idusuario) => {
                this.bodyparams.add("idusuario", idusuario);
                this.doget(callback);
            });
        });
    }

    sendNotification(message): void {
        let notification = this.httpowner.toastCtrl.create({ message: message, duration: 3000 });
        notification.present();
    }

    preparabodypost(){
        this.body="";
        var index=0;
        this.bodyparams.params.forEach(param => {
            this.body = this.body + param.nome + "=" + param.valor;
            if (index < this.bodyparams.params.length - 1)
                this.body = this.body + "&";
                index++;
        });      
    }
}

@Injectable()
export class TarefaService  {
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
        public tts: TextToSpeech, public http: Http, public alertCtrl: AlertController) {
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
            speechRecognition.requestPermission().then(() => this.sendNotification('Granted'), () => this.sendNotification('Denied'));
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

    assertlogin(nav: any, page: any) {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                this.storage.get('token').then((token) => {
                    this.verificatoken(token, userid, nav, page);
                })
            })
        });
    }

    createEntry(principal, item, nav: any, page: any, formvariables) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "create");
        htmlwrapper.bodyparams.addfromformvariables(formvariables);
        htmlwrapper.bodyparams.add("tabela", this.tabela);
        htmlwrapper.dopost(function (ts, data) {
            if (data.insert === "ok") {
                if (ts.tabela == "usuarios") {
                    ts.dologin(formvariables.email, formvariables.password, false, nav, page);
                    ts.sendNotification(`O usuário: ${name} foi cadastrado com sucesso!`);
                }
                else if (ts.tabela == "certificadoras") {
                    ts.sendNotification(`A certificadora ${name} foi cadastrada com sucesso!`);
                    principal.updatemenuitemslist(item);
                    nav.pop();
                }
                else if (ts.tabela == "produtos") {
                    ts.sendNotification(`O produto ${name} foi inserido com sucesso!`);
                    principal.offset = 0;
                    item.menuitems = [];
                    principal.updatemenuitemslist(item);
                    nav.pop();
                }
            }
            else {
                if (data.insert === "23000")
                    ts.sendNotification('Email já cadastrado');
                else
                    ts.sendNotification('Algo deu errado! ' + data.insert);
            }
        });
    }

    updateSoumcampo(principal, insert: boolean, recordid, nomecampo, novovalor, item, menuitem) {
        var tabela: string = item.title.toLowerCase();
        var htmlwrapper:HtmlWrapper=new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key",insert?"insertum":"updateum");
        htmlwrapper.bodyparams.add("campo",nomecampo);
        htmlwrapper.bodyparams.add("tabela",tabela);
        htmlwrapper.bodyparams.add("recordid",recordid);
        htmlwrapper.bodyparams.add("valor",novovalor);
        htmlwrapper.dopost(function (ts,data) {
            if (data.update == "ok") {
                ts.sendNotification('tabela ' + tabela + ' atualizada com sucesso.');
                principal.updatemenuitemslist(item);
                if (menuitem != null) {
                    menuitem.title = novovalor;
                    menuitem.linhas[0].info = novovalor;
                    menuitem.dbdata.nome = novovalor;
                }
            }
        });       
    }

     updateInfoUsuario(itemlinha, texto) {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                var campo: string;
                if (itemlinha.title == 'HISTÓRICO') campo = "historico";
                else if (itemlinha.title == 'VALORES') campo = "valores";
                else if (itemlinha.title == 'MISSÃO') campo = "missao";
                var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
                htmlwrapper.bodyparams.add("key", "updateinfousuario");
                htmlwrapper.bodyparams.add("campo", campo);
                htmlwrapper.bodyparams.add("userid", userid);
                htmlwrapper.bodyparams.add("texto", texto);
                htmlwrapper.dopost(function (ts, data) {
                    if (data.update == "ok") ts.sendNotification(campo + " atualizado com sucesso.");
                    else ts.sendNotification("Algo deu errado, verifique a conexão com a internet.");
                });               
            });
        });
    }

    constroiendereco(formvariables) {
        return formvariables.endereco + ',' + formvariables.numero + '-' + formvariables.complemento + '-' + formvariables.bairro + '-'
            + formvariables.cidade + '-' + formvariables.estado + '-' + formvariables.cep;
    }

    updateEntry(principal, item, userid, formvariables, menuitem) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "update");
        htmlwrapper.bodyparams.add("recordID", userid);
        htmlwrapper.bodyparams.add("tabela", this.tabela);
        htmlwrapper.bodyparams.addfromformvariables(formvariables);
        htmlwrapper.dopost(function (ts, data) {
            if (ts.tabela == "usuarios") {
                if (data[0].id != "") {
                    ts.setstorage(data[0]);
                    ts.sendNotification(`Cadastro atualizado com sucesso`);
                    menuitem.linhas[0].info = data[0].nome;
                    menuitem.linhas[1].info = data[0].email;
                    menuitem.linhas[2].info = ts.constroiendereco(data[0]);
                    menuitem.linhas[3].info = data[0].fone;
                }
                else {
                    ts.getUDfromstorage();
                    if (data.update === "23000")
                        ts.sendNotification('Email já cadastrado');
                    else
                        ts.sendNotification('Algo deu errado: ' + data.update);
                }
            }
            else if (ts.tabela == "certificadoras") {
                ts.getUDfromstorage();
                if (data.update == "ok") {
                    ts.sendNotification(`Cerfificadora atualizada com sucesso.`);
                    menuitem.title = formvariables.nome;
                    menuitem.linhas[0].info = formvariables.nome;
                    menuitem.linhas[1].info = formvariables.email;
                    menuitem.linhas[2].info = formvariables.site;
                    menuitem.linhas[3].info = ts.constroiendereco(formvariables);
                    menuitem.linhas[4].info = formvariables.fone;
                }
            }
            else if (ts.tabela == "produtos") {
                ts.getUDfromstorage();
                if (data.update == "ok") {
                    ts.sendNotification(`Produto atualizado com sucesso.`);
                    menuitem.title = formvariables.nome;
                    menuitem.linhas[0].info = formvariables.nome;
                    menuitem.linhas[1].info = data.marca;
                    menuitem.linhas[2].info = data.categoria;
                }
            }
        });  
    }

    deleteEntry(principal, item, userid, formvariables) {
        var name: string = formvariables.nome;
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "delete");
        htmlwrapper.bodyparams.add("recordID", userid);
        htmlwrapper.bodyparams.add("tabela", this.tabela);
        htmlwrapper.dopost(function (ts, data) {
            if (data.delete === "ok") {
                if (ts.tabela == "usuarios") {
                    ts.logout();
                    ts.sendNotification(`O usuário: ${name} foi excluído do sistema`);
                }
                else if (ts.tabela == "certificadoras")
                    ts.sendNotification(`A certificadora ${name} foi excluída do sistema`);
                else if (ts.tabela == "produtos") {
                    principal.offset = 0;
                    item.menuitems = [];
                    ts.sendNotification(`O produto ${name} foi excluído do sistema`);
                }
                else if (ts.tabela == "listaprodutos") {
                    principal.offset = 0;
                    item.menuitems = [];
                    ts.sendNotification(`O produto ${name} foi excluído do sistema`);
                }
                else if (ts.tabela == "userimages") {
                    principal.offset2 = 0;
                    item.menuitems = [];
                    ts.sendNotification(`Imagem excluída com sucesso!`);
                }
                principal.updatemenuitemslist(item);
            }
            else
                ts.sendNotification('Algo deu errado! Tente novamente.');
        });
    }

    pesquisaCep(formvariables) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "buscacep");
        htmlwrapper.bodyparams.add("cep", formvariables.cep);
        htmlwrapper.bodyparams.add("tabela", this.tabela);
        htmlwrapper.dopost(function (ts, data) {
            if (data[0].cepok == "true") {
                ts.mostraCep = false;
                formvariables.endereco = data[0].endereco;
                formvariables.cidade = data[0].cidade;
                formvariables.bairro = data[0].bairro;
                formvariables.estado = data[0].estado;
            }
            else {
                ts.sendNotification('CEP inválido!');
                ts.getUDfromstorage();
            }
        });
    }

    verificatoken(token, userid, nav: any, page: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "asserttoken");
        htmlwrapper.bodyparams.add("token", token);
        htmlwrapper.bodyparams.add("userid", userid);
        htmlwrapper.dopost(function (ts, data) {
            if (data[0].goodtoken == "true") {
                ts.logged = true;
                ts.storage.set('username', data[0].nome);
                ts.storage.set('email', data[0].email);
                ts.dadosUsuario.nome = data[0].nome;
                ts.dadosUsuario.email = data[0].email;
                ts.getUDfromstorage();
                nav.push(page);                
            }
        });      
    }

    loginprompt(nav: any, page: any) {
        let prompt = this.alertCtrl.create({
            inputs: [{ type: 'email', name: 'email', placeholder: 'digite seu email' },
            { type: 'password', name: 'senha', placeholder: 'digite sua senha' }],
            buttons: [
                { text: 'Cancelar' },
                {
                    text: 'Entrar',
                    handler: data => {
                        this.dologin(data.email, data.senha, true, nav, page);
                    }
                }
            ]
        });
        prompt.present();
    }

    dologin(email, password, showprompt: boolean, nav: any, page: any) {
        var device: string = "test";
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "login");
        htmlwrapper.bodyparams.add("email", email);
        htmlwrapper.bodyparams.add("password", password);        
        htmlwrapper.bodyparams.add("device", device);
        htmlwrapper.dopost(function (ts, data) {
            if (data[0].token != "") {
                ts.logged = true;
                ts.setstorage(data[0]);
                if (nav != null) {
                    if (nav.first() != nav.getActive())
                        nav.popTo(nav.first());
                    nav.push(page);
                }
            }
            else {
                alert('erro :' + data[0].nome);
                if (showprompt) ts.loginprompt(nav, page);
            }
        });       
    }

    insertParceiroLista(principal, item, menuitems) {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((idusuario) => {
                let jsonlist: Array<{ idparceiro: number }> = [];
                menuitems.forEach(mn => {
                    if (mn.showdados)
                        jsonlist.push({ idparceiro: mn.dbdata.id })
                });
                var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
                htmlwrapper.bodyparams.add("key", "insparceirolist");
                htmlwrapper.bodyparams.add("idusuario", idusuario);
                htmlwrapper.bodyparams.add("json", JSON.stringify(jsonlist));
                htmlwrapper.dopost(function (ts, data) {
                    if (data.insert === "ok") {
                        ts.sendNotification(jsonlist.length + ' parceiro(s) inseridos com sucesso!');
                        principal.offset3 = 0;
                        principal.dbdata.items[0].menuitems[1].linhas[3].dbdata.items[0].menuitems = [];
                        principal.updatemenuitemslist(principal.dbdata.items[0].menuitems[1].linhas[3].dbdata.items[0]);
                    }
                    else
                        ts.sendNotification('Algo deu errado! ' + data.insert);
                });
            });
        });
    }

    insertProdLista(principal, item, menuitems) {        
        this.storage.ready().then(() => {
            this.storage.get('userid').then((idusuario) => {
                let jsonlist: Array<{ idproduto: number, preco: number }> = [];
                menuitems.forEach(mn => {
                    if (mn.showdados)
                        jsonlist.push({ idproduto: mn.dbdata.id, preco: mn.dbdata.preco })
                });
                var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
                htmlwrapper.bodyparams.add("key", "insprodlist");
                htmlwrapper.bodyparams.add("idusuario", idusuario);
                htmlwrapper.bodyparams.add("json", JSON.stringify(jsonlist));
                htmlwrapper.dopost(function (ts, data) {
                    if (data.insert === "ok") {
                        ts.sendNotification(jsonlist.length + ' produto(s) inseridos com sucesso!');
                        principal.offset = 0;
                        principal.dbdata.items[0].menuitems[1].linhas[1].dbdata.items[0].menuitems = [];
                        principal.updatemenuitemslist(principal.dbdata.items[0].menuitems[1].linhas[1].dbdata.items[0]);
                    }
                    else
                        ts.sendNotification('Algo deu errado! ' + data.insert);
                });
            });
        });
    }

    addImagetoDB(id, tabela, imgdata, fnome) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "salvaimagem");
        htmlwrapper.bodyparams.add("recordID", id);
        htmlwrapper.bodyparams.add("tabela", tabela);
        htmlwrapper.bodyparams.add("imgdata", encodeURIComponent(imgdata));
        htmlwrapper.bodyparams.add("fnome", fnome);
        htmlwrapper.dopost(function (ts, data) {
            if (data.insert === "ok") ts.sendNotification(`Imagem enviada com sucesso!`);
            else ts.sendNotification('Algo deu errado! Tente novamente.');
        });        
    }

    deleteIMG(principal, menuitem, linha) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "deleteimg");
        htmlwrapper.bodyparams.add("prodid", menuitem.dbdata.id);
        htmlwrapper.bodyparams.add("imagem", menuitem.dbdata.imagem);
        htmlwrapper.bodyparams.add("tabela", this.tabela);
        htmlwrapper.dopost(function (ts, data) {
            if (data.delete === "ok") {
                menuitem.dbdata.imagem = null;
                linha.info = "Por Favor selecione uma imagem!";
                ts.sendNotification(`A imagem foi excluída do sistema`);
                principal.offset2 = 0;
                linha.menuitems = [];
                principal.updatemenuitemslist(linha);
            }
            else
                ts.sendNotification('Algo deu errado! Tente novamente.');
        });
    }

    logout() {
        this.storage.ready().then(() => {
            this.storage.get('userid').then((userid) => {
                this.storage.get('token').then((token) => {
                    var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
                    htmlwrapper.bodyparams.add("key", "logout");
                    htmlwrapper.bodyparams.add("token", token);
                    htmlwrapper.bodyparams.add("userid", userid);
                    htmlwrapper.dopost(function (ts, data) {
                        if (data[0].logout == "ok") {
                            ts.logged = false;
                            ts.mostraCep = true;
                            ts.cleanstorage();
                        }
                    });
                });
            });
        });
    }

    getInfoUsuario(historico, valores, missao) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "infousuario");
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].id != "null") {
                historico.menuitems[0].dbdata.nome = data[0].historico;
                valores.menuitems[0].dbdata.nome = data[0].valores;
                missao.menuitems[0].dbdata.nome = data[0].missao;
            }
        });        
    }

    getProdListUsr(page: any, mn: any, categoria: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "getprodlist");
        htmlwrapper.bodyparams.add("categoria", categoria);
        htmlwrapper.bodyparams.add("offset", page.offset);
        htmlwrapper.bodyparams.add("limit", page.limit);
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].id != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: false,tabela:"produtos", linhas: [],
                        dbdata: {
                            nome: row.nome,
                            id: row.id,
                            idproduto: row.idproduto,
                            preco: row.preco,
                            idmarca: row.idmarca,
                            idcategoria: row.idcategoria,
                            imagem: row.imagem
                        }
                    });
                });
                page.offset += page.limit;
            }
        });      
    }

    getImgsListUsr(page: any, mn: any, categoria: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "getimgslist");
        htmlwrapper.bodyparams.add("offset", page.offset2);
        htmlwrapper.bodyparams.add("limit", page.limit);
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].id != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.texto, tipo: row.id, showdados: false,tabela:"userimages", linhas: [],
                        dbdata: {
                            nome: row.texto,
                            id: row.id,
                            imagem: row.imagem
                        }
                    });
                });
                page.offset2 += page.limit;
            }
        });
    }

    getParceirosListUsr(page: any, mn: any, categoria: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "getparceiroslistusr");
        htmlwrapper.bodyparams.add("offset", page.offset3);
        htmlwrapper.bodyparams.add("limit", page.limit);
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].id != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: false, linhas: [],
                        dbdata: {
                            nome: row.nome,
                            id: row.id,
                            email: row.email
                        }
                    });
                });
                page.offset3 += page.limit;
            }
        });
    }

    getProdList(page: any, mn: any, categoria: any, _showdados: boolean) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "prodlist");
        htmlwrapper.bodyparams.add("categoria", categoria);
        htmlwrapper.bodyparams.add("offset", page.offset);
        htmlwrapper.bodyparams.add("limit", page.limit);
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].nome != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: _showdados, showeditbutton: true, linhas: [
                            { title: 'NOME', info: row.nome, dbdata: null },
                            { title: 'MARCA', info: row.marca, dbdata: null },
                            { title: 'CATEGORIA', info: row.categoria, dbdata: null },
                            { title: 'IMAGEM', info: row.imagem, dbdata: null }
                        ],
                        dbdata: {
                            id: row.id,
                            nome: row.nome,
                            idmarca: row.idmarca,
                            idcategoria: row.idcategoria,
                            imagem: row.imagem
                        }
                    });
                });
                page.offset += page.limit;
            }
            else page.cansearchProd = false;
        });            
    }

    getParceirosList(page: any, mn: any, categoria: any, _showdados: boolean) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "parceiroslist");
        htmlwrapper.bodyparams.add("categoria", categoria);
        htmlwrapper.bodyparams.add("offset", page.offset);
        htmlwrapper.bodyparams.add("limit", page.limit);
        htmlwrapper.dogetusrid(function (ts, data) {
            if (data[0].nome != "null") {
                //mn.menuitems = [];
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: _showdados, linhas: [
                            { title: 'NOME', info: row.nome, dbdata: null },
                            { title: 'EMAIL', info: row.email, dbdata: null }
                        ],
                        dbdata: {
                            id: row.id,
                            nome: row.nome,
                            email: row.email
                        }
                    });
                });
                page.offset += page.limit;
            }
            else page.cansearchProd = false;
        });
    }

    getCertList(mn: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "cert");
        htmlwrapper.doget(function (ts, data) {
            mn.menuitems = [];
            if (data[0].nome != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: false, showeditbutton: true,tabela:"certificadoras", linhas: [
                            { title: 'NOME', info: row.nome, dbdata: null },
                            { title: 'EMAIL', info: row.email, dbdata: null },
                            { title: 'WEBSITE', info: row.site, dbdata: null },
                            { title: 'ENDEREÇO', info: ts.constroiendereco(row), dbdata: null },
                            { title: 'FONE', info: row.fone, dbdata: null },
                            { title: 'IMAGEM', info: row.imagem, dbdata: null }
                        ],
                        dbdata: {
                            id: row.id,
                            nome: row.nome,
                            email: row.email,
                            endereco: row.endereco,
                            estado: row.estado,
                            cidade: row.cidade,
                            bairro: row.bairro,
                            site: row.site,
                            numero: row.numero,
                            complemento: row.complemento,
                            fone: row.fone,
                            cep: row.cep,
                            imagem: row.imagem
                        }
                    });
                });
            }

        });       
    }

    getCategoriasList(mn: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "categ");
        htmlwrapper.doget(function (ts, data) {
            mn.menuitems = [];
            if (data[0].nome != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: false, showeditbutton: true, linhas: [
                            { title: 'NOME', info: row.nome, dbdata: null }
                        ],
                        dbdata: {
                            nome: row.nome
                        }
                    });
                });
            }
        });        
    }

    getMarcasList(mn: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "marcas");
        htmlwrapper.doget(function (ts, data) {
            mn.menuitems = [];
            if (data[0].nome != "null") {
                data.forEach(row => {
                    mn.menuitems.push({
                        title: row.nome, tipo: row.id, showdados: false, showeditbutton: true, linhas: [
                            { title: 'NOME', info: row.nome, dbdata: null }
                        ],
                        dbdata: {
                            nome: row.nome
                        }
                    });
                });
            }

        });      
    }

    getUFList(ceppage: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "uf");
        htmlwrapper.doget(function (ts, data) {
            ceppage.UFList.ufs = [];
            if (data[0].uf != "null") {
                data.forEach(row => {
                    ceppage.UFList.ufs.push({ id: row.id, sigla: row.uf });
                });
            }
        });       
    }

    getCEPList(ceppage: any) {
        var htmlwrapper: HtmlWrapper = new HtmlWrapper(this);
        htmlwrapper.bodyparams.add("key", "buscacep");
        htmlwrapper.bodyparams.add("uf", ceppage.UF);
        htmlwrapper.bodyparams.add("cidade", ceppage.cidade);
        htmlwrapper.bodyparams.add("endereco", ceppage.endereco);
        htmlwrapper.bodyparams.add("offset", ceppage.offset);
        htmlwrapper.bodyparams.add("limit", ceppage.limit);
        htmlwrapper.doget(function (ts, data) {
            if (data[0].endereco != "null") {
                data.forEach(row => {
                    ceppage.CEPList.push({
                        endereco: row.endereco, bairro: row.bairro, cidade: row.cidade,
                        estado: row.uf, cep: row.cep
                    });
                });
                ceppage.offset += ceppage.limit;
            }
            else ceppage.cansearchCEP = false;
        });        
    }
   
    setstorage(jsonresult: any) {
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
        this.dadosUsuario.fone = jsonresult.fone;
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

