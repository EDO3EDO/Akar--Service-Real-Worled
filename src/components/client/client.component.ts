import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
  imports: [RouterOutlet]
})
export class ClientComponent implements OnInit {
  constructor() { }


  ngOnInit() {
  }

}
