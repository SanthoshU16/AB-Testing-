import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 🔥 ADD THIS

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule], // 🔥 IMPORTANT
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  submitForm(form: any) {

    if (form.invalid) {
      alert("Fill all fields properly ⚠️");
      return;
    }

    console.log(form.value);
    alert("Message Sent ✅");

    form.resetForm();
  }
}