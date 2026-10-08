import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Chart, registerables } from 'chart.js';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { Auth } from '@angular/fire/auth';


Chart.register(...registerables)


@Component({
  selector: 'app-AnalysisAdmin',
  templateUrl: './AnalysisAdmin.component.html',
  styleUrls: ['./AnalysisAdmin.component.css']
})
export class AnalysisAdminComponent implements OnInit {

private following = inject(FolllowOrdersService)
private Auth = inject(Auth)

  Order = signal<any[]>([])

  constructor(private cd:ChangeDetectorRef){}

  data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  datasets: [{
    label: 'Totell Revenwe In This Month',
    data: [65, 59, 80, 81, 56, 55, 40 , 72 , 54 ],
    backgroundColor:(context:any) => {
      const chart = context.chart;
      const {ctx  , chartArea} = chart;
      if (!chartArea) return ;
      const gredient = ctx.createLinearGradient(0 , chartArea.bottom , 0 , chartArea.top)
      gredient.addColorStop(0 , "#22c55e");
      gredient.addColorStop(1 , "#0ea5e9");
      return gredient;
    },
    borderRadius: 5, // Rounded corners
    barThickness: 30,
  }]
};




  config :any = {
  type: 'bar',
  data: this.data,
  options: {
    responsive: true, // تفعيل التجاوب مع حجم الحاوية
    maintainAspectRatio: false, // يسمح للشارت بتغيير طوله وعرضه بحرية
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  },
};

HelloChart :any

  async ngOnInit(){
    const Auth = this.Auth.currentUser?.uid

    if(Auth){
      (await this.following.getClientOrders(Auth)).subscribe({
        next:(data) => {
          if(data){
            this.Order.set(data)
          }
        },
        error: (err) => {console.log(err)}
      })
    }




    this.HelloChart = new Chart("Chart" , this.config)
  }


}
