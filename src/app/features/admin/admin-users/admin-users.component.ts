import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/models/models';
import { AdminUserService } from '../../../core/services/admin/admin-user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  admins = signal<User[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['admin' as 'admin' | 'superadmin', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminUserService.list().subscribe((res) => {
      this.admins.set(res.data);
      this.loading.set(false);
    });
  }

  create(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.adminUserService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ role: 'admin' });
        this.notification.success('Compte administrateur créé.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Impossible de créer ce compte.');
      }
    });
  }

  toggleRole(admin: User): void {
    const newRole = admin.role === 'superadmin' ? 'admin' : 'superadmin';
    if (!confirm(`Passer ${admin.email} en rôle "${newRole}" ?`)) return;
    this.adminUserService.updateRole(admin.id, newRole).subscribe(() => {
      this.notification.success('Rôle mis à jour.');
      this.load();
    });
  }
}
