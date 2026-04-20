import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  uploadedBy?: { fullName: string };
}

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.css']
})
export class MediaGalleryComponent implements OnInit {
  mediaFiles: Media[] = [];
  filteredMedia: Media[] = [];
  isLoading = true;
  error = '';
  successMsg = '';
  isUploading = false;
  uploadProgress = 0;
  
  // Detail panel (like WordPress)
  selectedMedia: Media | null = null;
  
  // Filter
  filterType = 'all'; // all, image, document, video
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Drag-and-drop
  isDragOver = false;
  
  private apiUrl = `${environment.apiUrl}/media`;
  private uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.isLoading = true;
    this.error = '';
    this.http.get<Media[]>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.mediaFiles = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading media', err);
        this.error = 'حدث خطأ أثناء تحميل الوسائط';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.mediaFiles];
    
    // Type filter
    if (this.filterType !== 'all') {
      result = result.filter(m => {
        if (this.filterType === 'image') return m.mimeType.startsWith('image/');
        if (this.filterType === 'video') return m.mimeType.startsWith('video/');
        if (this.filterType === 'document') return !m.mimeType.startsWith('image/') && !m.mimeType.startsWith('video/');
        return true;
      });
    }
    
    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m => m.originalName.toLowerCase().includes(q));
    }
    
    this.filteredMedia = result;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
  }

  uploadFiles(files: FileList) {
    this.isUploading = true;
    this.error = '';
    this.successMsg = '';
    this.uploadProgress = 0;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    this.http.post<any>(`${this.uploadUrl}/multiple`, formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadProgress = 100;
        this.successMsg = `تم رفع ${response.count || files.length} ملف بنجاح`;
        this.loadMedia();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        console.error('Error uploading files', err);
        this.error = err.error?.message || 'حدث خطأ أثناء رفع الملفات';
        this.isUploading = false;
      }
    });
  }

  selectMedia(media: Media) {
    this.selectedMedia = media;
  }

  closeDetail() {
    this.selectedMedia = null;
  }

  deleteMedia(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.selectedMedia = null;
          this.successMsg = 'تم حذف الملف بنجاح';
          this.loadMedia();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: (err) => {
          console.error('Error deleting media', err);
          this.error = 'حدث خطأ أثناء الحذف';
        }
      });
    }
  }

  copyUrl(url: string) {
    const fullUrl = this.getFullUrl(url);
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.successMsg = 'تم نسخ الرابط!';
      setTimeout(() => this.successMsg = '', 2000);
    });
  }

  getFullUrl(url: string): string {
    if (url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  }

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  getMediaCount(type: string): number {
    if (type === 'all') return this.mediaFiles.length;
    return this.mediaFiles.filter(m => {
      if (type === 'image') return m.mimeType.startsWith('image/');
      if (type === 'video') return m.mimeType.startsWith('video/');
      if (type === 'document') return !m.mimeType.startsWith('image/') && !m.mimeType.startsWith('video/');
      return true;
    }).length;
  }
}
