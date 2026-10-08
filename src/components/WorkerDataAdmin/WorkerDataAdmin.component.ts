import { Component, inject, OnInit, Pipe, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthanticationService } from '../../services/Authantication.service';
import { UserData, workerData } from '../../interface/UserData';
import { pipe } from 'rxjs';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-EG';
import { Router, RouterLink } from '@angular/router';

registerLocaleData(localeAr, 'ar-EG');
@Component({
  selector: 'app-WorkerDataAdmin',
  templateUrl: './WorkerDataAdmin.component.html',
  imports: [DatePipe],
  styleUrls: ['./WorkerDataAdmin.component.css']
})
export class WorkerDataAdminComponent implements OnInit {

  constructor() { }

  private Auth = inject(Auth)
  private Authantication  = inject(AuthanticationService)
  private Router = inject(Router)
  uid = this.Auth.currentUser?.uid

  showDataWorker = signal<workerData[]>([])


  ngOnInit() {
    const role = 'worker'
    this.Authantication.getAllWorkerData(role).subscribe({
      next: (data) => {
        console.log(data)
        if(data){
          this.showDataWorker.set(data)
        }
      },error : (err) => {console.log(`error from the getuserData: ${err}`)}
    })
  }


  workerdetails(){
    this.Router.navigate(['/admin/workerdetils' , this.uid])
  }


}
