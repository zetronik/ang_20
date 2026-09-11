import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DEMO_LINKS, NAV_GROUPS } from '../../core/nav';
import { VersionChip } from '../../shared/ui/version-chip';
import { RELEASE_HIGHLIGHTS } from './release-notes';

/**
 * Обзорная страница: карта релизов 16 -> 20 и каталог демо.
 */
@Component({
  selector: 'app-overview-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    VersionChip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
})
export class OverviewPage {
  protected readonly releases = RELEASE_HIGHLIGHTS;
  protected readonly groups = NAV_GROUPS;

  /** Фильтр каталога по версии появления фичи. */
  protected readonly versionFilter = signal<string | null>(null);

  protected readonly availableVersions = ['v17', 'v17.1', 'v17.2', 'v18', 'v19', 'v20'];

  protected readonly catalogue = computed(() => {
    const filter = this.versionFilter();
    return this.groups
      .map((group) => ({
        group,
        links: DEMO_LINKS.filter(
          (link) => link.group === group && (!filter || link.since === filter),
        ),
      }))
      .filter((section) => section.links.length > 0);
  });

  protected toggleVersion(version: string): void {
    this.versionFilter.update((current) => (current === version ? null : version));
  }
}
