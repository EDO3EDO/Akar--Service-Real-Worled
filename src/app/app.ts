import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../components/Navbar/Navbar.component";
import { LogInComponent } from "../components/LogIn/LogIn.component";
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [ MatIconModule, TranslateModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('app');
  constructor(private Translate:TranslateService){
    this.CurrntLang = localStorage.getItem('lang') || 'ar' ;
    this.Translate.setDefaultLang(this.CurrntLang);
    this.Translate.use(this.CurrntLang)
    this.UpdateLang(this.CurrntLang)
  }

  CurrntLang!:string






SwitchLang(){
  this.CurrntLang = this.CurrntLang === 'ar' ? 'en' : 'ar' ;
  this.Translate.use(this.CurrntLang);
  localStorage.setItem('lang' , this.CurrntLang)
  this.UpdateLang(this.CurrntLang)
}



UpdateLang(lang:string){
const HtmlLang = document.documentElement

  if(lang === 'ar'){
    HtmlLang.dir = 'rtl'
    HtmlLang.lang = 'ar'
  }else if(lang === 'en'){
    HtmlLang.dir = 'ltr'
    HtmlLang.lang = 'en'
  }

}








}
