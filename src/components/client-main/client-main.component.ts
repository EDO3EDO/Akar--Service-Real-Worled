import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
@Component({
  selector: 'app-client-main',
  templateUrl: './client-main.component.html',
  imports: [TranslateModule, RouterLink, RouterLinkActive, RouterOutlet],
  styleUrls: ['./client-main.component.css']
})
export class ClientMainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
