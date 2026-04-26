import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { TrackingService } from '../../services/tracking.service';

export interface SearchResult {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.css'],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class AdminTopbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  unreadCount = 0;

  pageTitle: string = 'Dashboard';
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  showResults: boolean = false;

  allFeatures: SearchResult[] = [
    { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: '/admin/dashboard' },
    { label: 'Campaigns', icon: 'bi-send-fill', route: '/admin/campaigns' },
    { label: 'New Campaign', icon: 'bi-plus-circle-fill', route: '/admin/campaigns/create' },
    { label: 'Employees', icon: 'bi-people-fill', route: '/admin/employees' },
    { label: 'Templates', icon: 'bi-file-earmark-richtext-fill', route: '/admin/templates' },
    { label: 'Analytics', icon: 'bi-graph-up', route: '/admin/analytics' },
    { label: 'Reports', icon: 'bi-clipboard2-data-fill', route: '/admin/reports' },
  ];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private trackingService: TrackingService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.updatePageTitle(this.router.url);
    this.trackingService.loadAllEvents();
    this.notificationService.unreadCount$.subscribe((count: number) => {
      this.unreadCount = count;
    });
  }

  updatePageTitle(url: string) {
    const path = url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(s => s);
    
    if (segments.length > 1) {
      const lastSegment = segments[segments.length - 1];
      const prevSegment = segments.length > 2 ? segments[segments.length - 2] : '';

      let singular = prevSegment;
      if (singular.endsWith('ies')) singular = singular.slice(0, -3) + 'y';
      else if (singular.endsWith('s')) singular = singular.slice(0, -1);
      
      const capitalizedSingular = singular.charAt(0).toUpperCase() + singular.slice(1);

      if (lastSegment.length >= 15 && segments.length >= 3) {
         // It's likely an ID (e.g., Firestore auto-id is 20 chars)
         this.pageTitle = capitalizedSingular + ' Details';
      } else if (lastSegment === 'create' && segments.length >= 3) {
         // Handle create paths
         this.pageTitle = 'Create ' + capitalizedSingular;
      } else {
         this.pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
      }
    } else {
      this.pageTitle = 'Dashboard'; // Fallback
    }
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (!query.trim()) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    this.searchResults = this.allFeatures.filter(f => {
      const words = f.label.toLowerCase().split(' ');
      return words.some(word => word.startsWith(lowerQuery));
    });
    this.showResults = this.searchResults.length > 0;
  }

  selectResult(result: SearchResult) {
    this.router.navigate([result.route]);
    this.searchQuery = '';
    this.showResults = false;
  }

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar-search')) {
      this.showResults = false;
    }
  }
}
