import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MemeUploadService } from '../services/meme-upload.service';

@Component({
  selector: 'app-meme-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meme-upload.html',
  styleUrls: ['./meme-upload.scss'],
})
export class MemeUploadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly memeUploadService = inject(MemeUploadService);
  private readonly router = inject(Router);

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = signal(false);
  uploadError = signal<string | null>(null);
  uploadSuccess = signal<string | null>(null);

  maxFileSize = 5 * 1024 * 1024;
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      tags: [''],
      image: [null, Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!this.acceptedFileTypes.includes(file.type)) {
        this.uploadError.set(
          'Only JPEG, PNG, GIF, and WebP images are accepted'
        );
        this.resetFileInput();
        return;
      }

      if (file.size > this.maxFileSize) {
        this.uploadError.set('File size exceeds 5MB limit');
        this.resetFileInput();
        return;
      }

      this.selectedFile = file;
      this.uploadError.set(null);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);

      this.uploadForm.patchValue({ image: file });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isUploading.set(true);
      this.uploadError.set(null);
      this.uploadSuccess.set(null);

      const title = this.uploadForm.get('title')?.value;
      const tagsString = this.uploadForm.get('tags')?.value;

      let tags: string[] = [];
      if (tagsString && typeof tagsString === 'string') {
        tags = tagsString
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      this.memeUploadService
        .uploadMeme(title, this.selectedFile, tags)
        .subscribe({
          next: () => {
            this.isUploading.set(false);
            this.uploadSuccess.set('Meme uploaded successfully!');

            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          error: (error) => {
            this.isUploading.set(false);
            this.uploadError.set(error.message || 'Failed to upload meme');
          },
        });
    } else {
      this.uploadError.set(
        'Please fill all required fields and select a valid image'
      );
    }
  }

  resetFileInput(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadForm.patchValue({ image: null });

    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
