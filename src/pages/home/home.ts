import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import { TarefaService } from '../../services/json.server';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor( public tarefaService: TarefaService) {
   
  
  }

  
}
