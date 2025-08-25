import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  public toasts$ = this.toasts.asReadonly();

  private nextId = 0;

  showToast(message: string, type: Toast['type'] = 'info', duration: number = 5000) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.hideToast(id), duration);
    }
  }


  hideToast(id: number) {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  showSuccess(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }

  showError(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }

  showInfo(message: string, duration?: number) {
    this.showToast(message, 'info', duration);
  }

  showWarning(message: string, duration?: number) {
    this.showToast(message, 'warning', duration);
  }
}