import { AnalysisAdminComponent } from './../components/AnalysisAdmin/AnalysisAdmin.component';
import { AdminChatComponent } from './../components/adminChat/adminChat.component';
import { AddCatigoryAdminComponent } from './../components/add-catigory-admin/add-catigory-admin.component';
import { AdminComponent } from './../components/admin/admin.component';
import { Routes } from '@angular/router';
import { ClientHomeComponent } from '../components/client-home/client-home.component';
import { OrdersComponent } from '../components/orders/orders.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { adminGuard } from '../Guard/admin-guard';
import { clientGuard } from '../Guard/client-guard';
import { workerGuard } from '../Guard/worker-guard';
import { WorkerOrderComponent } from '../components/WorkerOrder/WorkerOrder.component';
import { WorkerProfitComponent } from '../components/WorkerProfit/WorkerProfit.component';
import { WorkerprofileComponent } from '../components/workerprofile/workerprofile.component';
import { AddLocationComponent } from '../components/AddLocation/AddLocation.component';
import { WorkerTaskComponent } from '../components/WorkerTask/WorkerTask.component';
import { OrdersbeforeDetilesComponent } from '../components/OrdersbeforeDetiles/OrdersbeforeDetiles.component';
import { SupscriptionComponent } from '../components/Supscription/Supscription.component';
import { ClientLocComponent } from '../components/client-loc/client-loc.component';
import { PaymentOnlinePageComponent } from '../components/PaymentOnlinePage/PaymentOnlinePage.component';
import { OrderHistoryComponent } from '../components/OrderHistory/OrderHistory.component';
import { HelpCenterComponent } from '../components/help-center/help-center.component';
import { EditProfileClientComponent } from '../components/editProfileClient/editProfileClient.component';
import { SupmonthComponent } from '../components/supmonth/supmonth.component';
import { SupyearComponent } from '../components/supyear/supyear.component';
import { PaySucComponent } from '../components/pay-suc/pay-suc.component';
import { ErrorComponent } from '../components/Error/Error.component';
import { ActiveAcountComponent } from '../components/activeAcount/activeAcount.component';
import { SystemChatComponent } from '../components/system-chat/system-chat.component';
import { ActiveWorkerAcountComponent } from '../components/activeWorkerAcount/activeWorkerAcount.component';
import { AddUserComponent } from '../components/add-user/add-user.component';
import { WorkerDataAdminComponent } from '../components/WorkerDataAdmin/WorkerDataAdmin.component';
import { WorkerDataDetilsAdminComponent } from '../components/workerDataDetilsAdmin/workerDataDetilsAdmin.component';
import { AdminCreatServiceComponent } from '../components/AdminCreatService/AdminCreatService.component';

export const routes: Routes = [




  // {path:'**' , component:ErrorComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('../components/LogIn/LogIn.component').then(m => m.LogInComponent)
  },

{
  path: 'admin',
  canActivate: [adminGuard],
  component: AdminComponent, // استيراد مباشر بدلاً من loadComponent
  children: [
    { path: 'adduser', canActivate: [adminGuard], component:AddUserComponent},
    { path: 'catigory', canActivate: [adminGuard], component: AddCatigoryAdminComponent},
    { path: 'adminchat', canActivate: [adminGuard], component: AdminChatComponent},
    { path: 'analysis', canActivate: [adminGuard], component: AnalysisAdminComponent},
    { path: 'workerdata', canActivate: [adminGuard], component:WorkerDataAdminComponent},
    { path: 'workerdetils/:id', canActivate: [adminGuard], component:WorkerDataDetilsAdminComponent},
    { path: 'service', canActivate: [adminGuard], component:AdminCreatServiceComponent},
  ]
},


  {
    path: 'client',
    canActivate:[clientGuard] ,
    loadComponent: () => import('../components/client-main/client-main.component').then(m => m.ClientMainComponent) ,
    children: [
      {path: '', redirectTo: 'home', pathMatch: 'full' },
      {path:'home' , canActivate:[clientGuard] ,   component:ClientHomeComponent},
      {path:'order/:id' , canActivate:[clientGuard] ,   component:OrdersComponent},
      {path:'orders', canActivate:[clientGuard] ,   component:OrdersbeforeDetilesComponent},
      {path:'addlocation' , canActivate:[clientGuard] ,   component:AddLocationComponent},
      {path:'payment-success' , canActivate:[clientGuard] ,   component:PaySucComponent},
      {path:'active' , canActivate:[clientGuard] ,   component:ActiveAcountComponent},
      {path:'chat/:id' , canActivate:[clientGuard] ,   component:SystemChatComponent},



      {path:'sup' ,
        canActivate:[clientGuard] ,
        loadComponent: () => import('../components/Supscription/Supscription.component').then(m => m.SupscriptionComponent),
        children:[
          {path:'' , redirectTo:'supmonth' ,  pathMatch:'full'},
          {path:'supmonth' , canActivate:[clientGuard] ,   component:SupmonthComponent},
          {path:'supyear' , canActivate:[clientGuard] ,   component:SupyearComponent},
        ]
      },


      {path:'profile' , canActivate:[clientGuard] ,   component:ProfileComponent},
      { path:'clientloc',canActivate:[clientGuard] ,  component:ClientLocComponent},
      { path:'payment',canActivate:[clientGuard] ,  component:PaymentOnlinePageComponent},
      { path:'history',canActivate:[clientGuard] ,  component:OrderHistoryComponent},
      { path:'helpcenter',canActivate:[clientGuard] ,  component:HelpCenterComponent},
      { path:'profile/:id',canActivate:[clientGuard] ,  component:EditProfileClientComponent},
    ]
  },



/////////////order/id inside orders not client !!


  {
    path: 'worker',
    canActivate:[workerGuard],
    loadComponent: () => import('../components/worker/worker.component').then(m => m.WorkerComponent),
    children: [
      {path:'workerprofile' , canActivate:[workerGuard] , component:WorkerprofileComponent},
      {path:'workerorder/:id' , canActivate:[workerGuard] , component:WorkerOrderComponent},
      {path:'workertask' , canActivate:[workerGuard] , component:WorkerTaskComponent},
      {path:'workerprofit' , canActivate:[workerGuard] , component:WorkerProfitComponent},
      {path:'active-w' , canActivate:[workerGuard] , component:ActiveWorkerAcountComponent},
    ]
  },

{
    path: '**',
    loadComponent: () => import('../components/Error/Error.component').then(m => m.ErrorComponent)
  }


];
