import { Component } from '@angular/core';
import { TarefaService } from '../../services/json.server';

@Component({
  selector: 'page-rodape',
  templateUrl: 'rodape.html'  
})
export class Rodape{
  
  constructor( public tarefaService:TarefaService) {
  }

  soundOnOff(event){
    this.tarefaService.sound=!this.tarefaService.sound;
  }

  micOnOff(event){
    this.tarefaService.mic=!this.tarefaService.mic;
  }

 
 
} 