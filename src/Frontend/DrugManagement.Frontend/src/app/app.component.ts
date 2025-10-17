import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppointmentFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DrugManagement-tool';
}
