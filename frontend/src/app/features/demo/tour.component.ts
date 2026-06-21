import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';

interface Rect { top: number; left: number; width: number; height: number; }

/** Coach-mark tour: dims the screen, spotlights the step target, shows a tooltip card. */
@Component({
  selector: 'tt-tour',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TPipe],
  template: `
    @if (demo.tourActive()) {
      <div class="fixed inset-0 z-[1000]">
        @if (rect(); as r) {
          <div class="absolute rounded-2xl transition-all duration-200 pointer-events-none ring-2 ring-terra-500"
            [style.top.px]="r.top - 6" [style.left.px]="r.left - 6"
            [style.width.px]="r.width + 12" [style.height.px]="r.height + 12"
            style="box-shadow: 0 0 0 9999px rgba(58,44,36,.62)"></div>
        } @else {
          <div class="absolute inset-0" style="background: rgba(58,44,36,.66)"></div>
        }

        <div class="absolute w-[300px] max-w-[calc(100vw-24px)] rounded-3xl bg-creamy-50 shadow-2xl p-5"
          [style.top.px]="cardPos().top" [style.left.px]="cardPos().left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] num font-bold text-terra-600">{{ demo.stepIndex() + 1 }} / {{ demo.steps().length }}</span>
            <button (click)="demo.endTour()" class="text-xs font-semibold text-cocoa-400">{{ 'demo.skip' | t }}</button>
          </div>
          <h3 class="serif3 text-lg font-semibold text-cocoa-900">{{ es() ? step().title.es : step().title.en }}</h3>
          <p class="text-sm text-cocoa-600 mt-1.5 leading-relaxed">{{ es() ? step().body.es : step().body.en }}</p>
          <div class="flex items-center gap-2 mt-4">
            @if (demo.stepIndex() > 0) {
              <button (click)="demo.prev()" class="text-sm font-semibold text-cocoa-600 rounded-full px-3 py-1.5">{{ 'demo.back' | t }}</button>
            }
            <span class="flex-1"></span>
            <button (click)="demo.next()" class="rounded-full bg-terra-600 text-white text-sm font-bold px-5 py-2 active:scale-95 transition-transform">
              {{ last() ? ('demo.finish' | t) : ('demo.next' | t) }}
            </button>
          </div>
          <div class="flex justify-center gap-1.5 mt-4">
            @for (s of demo.steps(); track $index) {
              <span class="w-1.5 h-1.5 rounded-full" [class]="$index === demo.stepIndex() ? 'bg-terra-600' : 'bg-creamy-200'"></span>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class TourComponent {
  readonly demo = inject(DemoService);
  private readonly i18n = inject(I18nService);

  readonly rect = signal<Rect | null>(null);
  readonly cardPos = signal<{ top: number; left: number }>({ top: 80, left: 12 });

  readonly step = computed(() => this.demo.steps()[this.demo.stepIndex()]);
  readonly last = computed(() => this.demo.stepIndex() === this.demo.steps().length - 1);
  readonly es = () => this.i18n.lang() === 'es';

  constructor() {
    effect(() => {
      this.demo.tourActive();
      this.demo.stepIndex();
      setTimeout(() => this.measure(), 80);
    });
  }

  @HostListener('window:resize')
  onResize(): void { if (this.demo.tourActive()) this.measure(); }

  private measure(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const target = this.step()?.target;
    const el = target ? (document.querySelector(target) as HTMLElement | null) : null;

    if (!el) {
      this.rect.set(null);
      this.cardPos.set({ top: Math.max(24, vh / 2 - 120), left: Math.max(12, vw / 2 - 150) });
      return;
    }

    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
    const b = el.getBoundingClientRect();
    this.rect.set({ top: b.top, left: b.left, width: b.width, height: b.height });

    const cardW = 300, cardH = 210;
    let top = b.bottom + 14;
    if (top + cardH > vh - 12) top = Math.max(14, b.top - cardH - 14);
    let left = b.left + b.width / 2 - cardW / 2;
    left = Math.max(12, Math.min(left, vw - cardW - 12));
    this.cardPos.set({ top, left });
  }
}
