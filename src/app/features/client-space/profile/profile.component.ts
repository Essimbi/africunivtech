import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ClientProfileComponent {
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  savingProfile = signal(false);
  savingPassword = signal(false);

  profileForm = this.fb.nonNullable.group({
    firstName: [this.authService.currentUser?.firstName || '', Validators.required],
    lastName: [this.authService.currentUser?.lastName || '', Validators.required],
    phone: [this.authService.currentUser?.phone || ''],
    company: [this.authService.currentUser?.company || '']
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.notification.success('Profil mis à jour.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.notification.error('Impossible de mettre à jour le profil.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.notification.success('Mot de passe modifié.');
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.notification.error(err?.error?.message || 'Mot de passe actuel incorrect.');
      }
    });
  }
}
