import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_BASE_URL } from '../../core/api.tokens';
import { Photo } from '../../core/models/jsonplaceholder';

/**
 * «Тяжёлый» компонент: сам ходит в сеть и рисует сетку картинок.
 * Используется только внутри @defer, поэтому попадает в отдельный чанк
 * и не увеличивает начальный бандл страницы.
 */
@Component({
  selector: 'app-photo-wall',
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (photos.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }

    <div class="wall">
      @for (photo of photos.value(); track photo.id) {
        <figure>
          <img [src]="photo.thumbnailUrl" [alt]="photo.title" width="150" height="150" loading="lazy" />
          <figcaption>{{ photo.title }}</figcaption>
        </figure>
      } @empty {
        <p>Фотографии не загружены.</p>
      }
    </div>
  `,
  styles: `
    .wall {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    figure {
      margin: 0;
      border-radius: 12px;
      overflow: hidden;
      background: var(--mat-sys-surface-container-high);
    }

    img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1;
      object-fit: cover;
    }

    figcaption {
      padding: 6px 8px;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
})
export class PhotoWall {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly albumId = input(1);

  protected readonly photos = httpResource<readonly Photo[]>(
    () => ({
      url: `${this.baseUrl}/photos`,
      params: { albumId: this.albumId(), _limit: 12 },
    }),
    { defaultValue: [] },
  );
}
