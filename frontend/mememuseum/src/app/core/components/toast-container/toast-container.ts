import { Component, inject, OnInit, Signal } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { ToastComponent } from '../toast/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.scss']
})
export class ToastContainerComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  toasts$: Signal<Toast[]> = this.toastService.toasts$;

  ngOnInit() {
    // no logic here, template subscribes on toasts$
  }

  closeToast(toastId: number) {
    this.toastService.hideToast(toastId);
  }
}