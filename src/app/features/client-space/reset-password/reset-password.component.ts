import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = signal(false);
  token = signal('');

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.token.set(this.route.snapshot.queryParamMap.get('token') || '');
  }

  submit(): void {
    if (this.form.invalid || !this.token()) return;
    this.submitting.set(true);
    this.authService.resetPassword(this.token(), this.form.getRawValue().newPassword).subscribe({
      next: () => {
        this.notification.success('Mot de passe réinitialisé. Connectez-vous.');
        this.router.navigateByUrl('/compte/connexion');
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(err?.error?.message || 'Lien invalide ou expiré.');
      }
    });
  }
}
