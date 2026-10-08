import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthanticationService } from '../../services/Authantication.service';
import { workerData } from '../../interface/UserData';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-EG';

registerLocaleData(localeAr, 'ar-EG');
@Component({
  selector: 'app-workerDataDetilsAdmin',
  templateUrl: './workerDataDetilsAdmin.component.html',
  imports:[DatePipe],
  styleUrls: ['./workerDataDetilsAdmin.component.css']
})
export class WorkerDataDetilsAdminComponent implements OnInit {

  constructor() { }
  private Auth = inject(Auth)
  private Authantication = inject(AuthanticationService)


  showDataWorker  = signal<workerData[]>([])

  ngOnInit() {
    const role = 'worker'
    this.Authantication.getAllWorkerData(role).subscribe({
      next:(data) => {
        if(data){
          this.showDataWorker.set(data)
        }
      },error: (err) => {console.log(`can not get worker data: ${err}`)}
    })
  }

}
