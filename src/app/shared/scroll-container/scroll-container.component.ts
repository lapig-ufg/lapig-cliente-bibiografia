import { Component, OnInit, OnChanges, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { throttle as _throttle, noop as _noop } from "lodash-es";

enum ScrollDirection {
  UP = 'up',
  DOWN = 'down'
}

enum ScrollListener {
  HOST = 'scroll',
  WINDOW = 'window:scroll'
}

@Component({
  selector: 'app-scroll-container',
  standalone: true,
  templateUrl: './scroll-container.component.html',
  styleUrls: ['./scroll-container.component.css']
})
export class ScrollContainerComponent implements OnInit, OnChanges {

  private _element: Element;
  private _window: Element;
  public scrollTop = 0;
  @Input() more:boolean = true;
  @Input() scrollDelay: number = 500;
  @Input() scrollOffset:number = 1000;
  @Output() scrolled: EventEmitter<boolean> = new EventEmitter<boolean>();
  @HostListener('scroll') _scroll!: Function;
  @HostListener('window:scroll') _windowScroll!: Function;

  constructor(private elRef: ElementRef) {
    this._element = this.elRef.nativeElement;
    this._window = document.documentElement as Element;
  }

  ngOnInit() {
    this.setThrottle();
  }

  ngOnChanges(changes: any) {
    
    if (changes.scrollDelay) this.setThrottle();
  }

  setThrottle() {
    console.log('setThrottl', this.scrollDelay);
    this._scroll = this._windowScroll = _throttle(this.handleScroll, this.scrollDelay);
  }

  getListener(){ 
    console.log('getListener', this.elRef.nativeElement.clientHeight === this.elRef.nativeElement.scrollHeight)
    return this.elRef.nativeElement.clientHeight === this.elRef.nativeElement.scrollHeight
    ? ScrollListener.WINDOW
    : ScrollListener.HOST
  }

  roundTo = (from: number, to: number = this.scrollOffset) => Math.floor(from / to) * to;
  getScrollDirection(st: number){
    console.log(st)
    return this.scrollTop <= st ? ScrollDirection.DOWN : ScrollDirection.UP
  }

  canScroll(e: Element): boolean {
    const scrolled = this.more
      && this.getScrollDirection(e.scrollTop) === ScrollDirection.DOWN
      && this.roundTo(e.clientHeight) === this.roundTo(e.scrollHeight - e.scrollTop);
    this.scrollTop = e.scrollTop;
    return scrolled;
  }

  handleScroll(){
    console.log(this.getListener())
  return this.getListener() === ScrollListener.HOST
    ? this.scrolled.emit( this.canScroll(this._element) )
    : this.scrolled.emit( this.canScroll(this._window) )
}
}
