import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SiteSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  contactEmail: string;
  facebookLink: string;
  twitterLink: string;
  instagramLink: string;
  linkedinLink: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;
  private settingsSubject = new BehaviorSubject<SiteSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchSettings();
  }

  fetchSettings() {
    return this.http.get<SiteSettings>(this.apiUrl).subscribe(settings => {
      this.settingsSubject.next(settings);
      this.updateFavicon(settings.faviconUrl);
      this.updateTitle(settings.siteName);
    });
  }

  updateSettings(data: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.http.patch<SiteSettings>(this.apiUrl, data).pipe(
      tap(settings => {
        this.settingsSubject.next(settings);
        this.updateFavicon(settings.faviconUrl);
        this.updateTitle(settings.siteName);
      })
    );
  }

  private updateFavicon(url: string) {
    if (!url) return;
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  private updateTitle(title: string) {
    if (title) {
      document.title = title;
    }
  }
}
