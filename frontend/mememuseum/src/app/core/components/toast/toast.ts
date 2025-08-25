import { Component, inject, Input } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  
  @Input() toast!: Toast;


  closeToast() {
    this.toastService.hideToast(this.toast.id);
  }
}

