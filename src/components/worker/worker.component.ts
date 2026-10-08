import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css'],
  imports: [RouterOutlet, TranslateModule, RouterLinkWithHref, RouterLinkActive]
})
export class WorkerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
