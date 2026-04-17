import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CampaignService } from '../../../../services/campaign.service';
import { Campaign } from '../../../../models/campaign.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css']
})
export class CampaignListComponent implements OnInit, OnDestroy {
  campaigns: Campaign[] = [];
  isLoading = true;
  private sub?: Subscription;

  constructor(private campaignService: CampaignService) {}

  async ngOnInit(): Promise<void> {
    await this.campaignService.loadCampaigns();
    this.sub = this.campaignService.campaigns$.subscribe(data => {
      this.campaigns = data;
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  getClickRate(campaign: Campaign): number {
    const sent = campaign.stats?.totalSent ?? 0;
    const clicked = campaign.stats?.clicked ?? 0;
    return sent > 0 ? Math.round((clicked / sent) * 100) : 0;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      draft: 'status-draft',
      scheduled: 'status-scheduled',
      active: 'status-active',
      completed: 'status-completed'
    };
    return map[status] ?? '';
  }

  async deleteCampaign(id: string | undefined): Promise<void> {
    if (!id) return;
    if (confirm('Delete this campaign? This cannot be undone.')) {
      await this.campaignService.deleteCampaign(id);
    }
  }
}
