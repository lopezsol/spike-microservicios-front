import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  messageService = inject(MessageService);

  success(detail: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail });
  }

  error(detail: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
