import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-experimental',
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.css'
})
export class ExperimentalComponent implements OnInit {
  // WARNING: SPAGHETTI CODE, PREPARE YOUR EYEBALLS
  // I AM NOT JOKING
  track: HTMLElement | null = null;
  ngOnInit() {
    this.track = document.getElementById("image-track")
  }

  // set mouseDownAt (stored in html) to track where X cord of cursor is
  // todo: figure out how to make this shit work with touch events
  handleOnDown(e: MouseEvent | Touch) {
    if (this.track) {
      this.track.dataset['mouseDownAt'] = e instanceof MouseEvent ? e.clientX.toString() : (e as unknown as TouchEvent).touches[0].clientX.toString();
    }
  }

  // mouse release
  handleOnUp() {
    if (this.track) {
      this.track.dataset['mouseDownAt'] = "0";
      // set to 0 if hndefined
      this.track.dataset['prevPercentage'] = this.track.dataset['percentage'] || "0";
    }
  }

  // image track movement
  handleOnMove(e: MouseEvent | Touch) {
    if (this.track && this.track.dataset['mouseDownAt'] !== "0") {
      // more spaghetti... 
      // calculate distance between first click => current cords
      const mouseDelta = parseFloat(this.track.dataset['mouseDownAt']!) - (e instanceof MouseEvent ? e.clientX : (e as unknown as TouchEvent).touches[0].clientX);
      
      // max drag (dragging across more than half of the window makes image track stop)
      const maxDelta = window.innerWidth / 2;

      // * -100 gives percentage
      const percentage = (mouseDelta / maxDelta) * -100;
      // console.log(percentage)

      // keeping track of percentage because otherwise it will just keep resetting back to default position every click
      const nextPercentageUnconstrained = parseFloat(this.track.dataset['prevPercentage']!) + percentage;
      // limit percentage from 0 to -100
      const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

      // this is so fucking dumb
      // this.track.dataset.percentage = nextPercentage;
      this.track.dataset['percentage'] = nextPercentage.toString();

      // this is how the sliding "animation" works
      this.track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
      }, { duration: 1200, fill: "forwards" });

      // store all images in array
      const images = Array.from(this.track.getElementsByClassName("image"));
      for (const image of images) {
        // i spent an hour and 45 minutes trying to figure this out
        (image as HTMLElement).animate({
          objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
      }
    }
  }
  // https://angular.io/api/core/HostListener
  // "mouse" is desktop, "touch" is mobile
  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.handleOnDown(event);
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.handleOnDown(event.touches[0]);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.handleOnUp();
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.handleOnUp();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.handleOnMove(event);
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.handleOnMove(event.touches[0]);
  }
}