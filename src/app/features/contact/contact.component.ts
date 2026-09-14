import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  offices = [
    { city: 'Douala (Siège)', address: 'Boulevard de la Liberté, Akwa', phone: '+237 233 42 00 00' },
    { city: 'Yaoundé', address: 'Avenue Kennedy, Immeuble Tech', phone: '+237 690 12 34 56' },
    { city: 'Bafoussam', address: 'Carrefour Total, Agence Ouest', phone: '+237 699 00 56 78' }
  ];
}
