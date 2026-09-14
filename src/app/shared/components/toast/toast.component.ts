import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  notification = inject(NotificationService);

  iconFor(type: string): string {
    if (type === 'success') return 'check_circle';
    if (type === 'error') return 'error';
    return 'info';
  }
}
