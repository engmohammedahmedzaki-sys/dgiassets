import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  success = false;
  error = '';

  onSubmit() {
    // Validate
    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
      this.error = 'الرجاء ملء جميع الحقول المطلوبة';
      return;
    }

    // TODO: Send to backend
    console.log('Contact form submitted:', this.contactData);
    
    // Show success
    this.success = true;
    this.error = '';
    
    // Reset form
    setTimeout(() => {
      this.contactData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      this.success = false;
    }, 3000);
  }
}
