import { Component, OnInit } from '@angular/core';
import { AddUserComponent } from "../add-user/add-user.component";
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive]
})
export class AdminComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
