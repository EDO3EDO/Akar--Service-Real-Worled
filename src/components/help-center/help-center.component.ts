import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HelpCenterService } from '../../services/helpCenter.service';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  imports:[TranslateModule],
  styleUrls: ['./help-center.component.css']
})
export class HelpCenterComponent implements OnInit {

  constructor() {
  this.IsLoding.set(false)
  }
  private Router = inject(Router)
  private Auth = inject(Auth)
  private helpCenter = inject(HelpCenterService)

  IsLoding = signal<boolean>(true)
  lodingproblem = signal<boolean>(false)
  id = this.Auth.currentUser?.uid

  ngOnInit() {
  }


HelpSelect = signal([
    {id:1 , select:false},
    {id:2 , select:false},
    {id:3 , select:false},
    {id:4 , select:false},
])


check(id:number){
  this.HelpSelect.update(help => help.map(m => {
    const end = !m.select;
    if(m.id === id){
      return{...m , select:end}
    }else{
      return{...m , select:false}
    }
  }))
}

inputing(){
  event?.stopPropagation()
}

@Input() phoneNumber: string = '201553752617';
  @Input() defaultMessage: string = 'أهلاً بك، حابب أستفسر عن خدماتكم.';

  openWhatsApp(): void {
    const encodedMessage = encodeURIComponent(this.defaultMessage);
    const url = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }



  async help(problemInput: HTMLTextAreaElement){
    try{
      this.lodingproblem.set(true)
      const text = problemInput.value.trim()
      const id  = this.Auth.currentUser?.uid
      if(!id || !text) return ;
      await this.helpCenter.creatproblem({input:text , userId:id})
      problemInput.value = ''
      return this.lodingproblem.set(false);
    }catch{
      problemInput.value = ''
      console.log('erorr from help fun')
      return this.lodingproblem.set(false)
    }
  }



  ///// Routing for every catigorys

  system(){
    this.Router.navigate([(`/client/chat/${this.id}`)])
  }

follwoing(){
  this.Router.navigate([('/client/orders')])
}


history(){
  this.Router.navigate([('client/history')])
}

edit(){
  this.Router.navigate([(`client/profile/${this.id}`)])
}





}
