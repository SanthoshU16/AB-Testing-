import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHero3d]',
  standalone: true
})
export class Hero3dDirective {
  @Input() appHero3d: number | string = 8; // degrees of max tilt

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transform-style', 'preserve-3d');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();

    // Only animate if the element is in the viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');

    // Use window center to calculate tilt
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const tiltAmt = this.appHero3d === '' ? 8 : Number(this.appHero3d);
    const tiltX = ((centerY - mouseY) / centerY) * tiltAmt;
    const tiltY = ((mouseX - centerX) / centerX) * tiltAmt;

    // Apply the transform
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  }

  @HostListener('document:mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)');
    this.renderer.setStyle(this.el.nativeElement, 'transform', `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  }
}
