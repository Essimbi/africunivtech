import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  submitting = signal(false);
  sent = signal(false);
  demoResetToken = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.authService.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.sent.set(true);
        this.demoResetToken.set(res.data?.resetToken || null);
      },
      error: () => {
        this.submitting.set(false);
        this.notification.error('Une erreur est survenue.');
      }
    });
  }
}
