import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DataViewComponent } from "./components/data-view/data-view.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, DataViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('spike-microservicios-front');
}
