import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-Error',
  templateUrl: './Error.component.html',
  styleUrls: ['./Error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor(private Router:Router) { }
  private Auth = inject(Auth)

  userid = this.Auth.currentUser?.uid

  ngOnInit() {
  }



  homePage(){
    this.Router.navigate([('/client/home')])
  }



  helpPage(){
    this.Router.navigate([(`/client/chat/${this.userid}`)])
  }

}
