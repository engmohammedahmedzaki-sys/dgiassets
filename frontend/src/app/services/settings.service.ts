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

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;

  // Code injection
  headCode?: string;
  bodyCode?: string;
  footerCode?: string;

  // Marketplace economics
  commissionPercentage?: number;
  inspectionDays?: number;
  holdbackPercentage?: number;
}

export interface IntegrationSettings {
  moyasarEnabled: boolean;
  moyasarPublishableKey: string;
  moyasarSecretKey: string;
  hasMoyasarSecretKey: boolean;

  googleAuthEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  hasGoogleClientSecret: boolean;

  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  hasSmtpPass: boolean;
  smtpFrom: string;

  openaiEnabled: boolean;
  openaiApiKey: string;
  hasOpenaiApiKey: boolean;
  openaiModel: string;
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
      this.applySettingsToDocument(settings);
    });
  }

  private applySettingsToDocument(settings: SiteSettings) {
    this.updateFavicon(settings.faviconUrl);
    this.updateTitle(settings.metaTitle || settings.siteName);
    this.setMeta('description', settings.metaDescription || settings.siteDescription);
    this.setMeta('keywords', settings.metaKeywords || '');
    this.setMeta('og:title', settings.metaTitle || settings.siteName, 'property');
    this.setMeta('og:description', settings.metaDescription || settings.siteDescription, 'property');
    if (settings.ogImage) this.setMeta('og:image', settings.ogImage, 'property');
    this.injectCode('head-injection', settings.headCode, 'head');
    this.injectCode('body-injection', settings.bodyCode, 'body-start');
    this.injectCode('footer-injection', settings.footerCode, 'body-end');
  }

  private setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  private injectCode(slotId: string, code: string | undefined | null, position: 'head' | 'body-start' | 'body-end') {
    const existing = document.getElementById(slotId);
    if (existing) existing.remove();
    if (!code || !code.trim()) return;
    const container = document.createElement('div');
    container.id = slotId;
    container.innerHTML = code;
    const parent = position === 'head' ? document.head : document.body;
    if (position === 'body-start') parent.insertBefore(container, parent.firstChild);
    else parent.appendChild(container);
  }

  updateSettings(data: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.http.patch<SiteSettings>(this.apiUrl, data).pipe(
      tap(settings => {
        this.settingsSubject.next(settings);
        this.applySettingsToDocument(settings);
      })
    );
  }

  getIntegrations(): Observable<IntegrationSettings> {
    return this.http.get<IntegrationSettings>(`${this.apiUrl}/integrations`);
  }

  updateIntegrations(data: Partial<IntegrationSettings>): Observable<IntegrationSettings> {
    return this.http.patch<IntegrationSettings>(`${this.apiUrl}/integrations`, data);
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
