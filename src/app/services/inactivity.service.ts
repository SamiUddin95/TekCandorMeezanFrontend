import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {
  private readonly TIMEOUT_DURATION = environment.inactivityTimeout || 60 * 1000;      // 1 minute
  private readonly WARNING_BEFORE   = environment.inactivityWarningBefore || 30 * 1000; // warn at 30s remaining

  private inactivityTimer: any = null;
  private warningTimer: any   = null;
  private warningShown        = false;
  private isActive            = false;

  private readonly ACTIVITY_EVENTS = [
    'mousemove', 'mousedown', 'click',
    'keydown', 'scroll', 'touchstart', 'wheel'
  ];

  private boundResetTimer = this.resetTimer.bind(this);

  constructor(private authService: AuthService, private ngZone: NgZone) {}

  /** Call this after the user logs in */
  start(): void {
    if (this.isActive) return;
    this.isActive = true;

    this.ngZone.runOutsideAngular(() => {
      this.ACTIVITY_EVENTS.forEach(event =>
        document.addEventListener(event, this.boundResetTimer, { passive: true })
      );
    });

    this.resetTimer();
  }

  /** Call this when the user logs out */
  stop(): void {
    this.isActive = false;
    this.clearTimers();
    this.ACTIVITY_EVENTS.forEach(event =>
      document.removeEventListener(event, this.boundResetTimer)
    );
  }

  private resetTimer(): void {
    this.clearTimers();

    if (!this.authService.isAuthenticated()) {
      this.stop();
      return;
    }

    // Close any open warning when user resumes activity
    if (this.warningShown) {
      this.warningShown = false;
      Swal.close();
    }

    this.ngZone.runOutsideAngular(() => {
      // Warning timer – fires at (TIMEOUT - WARNING_BEFORE)
      this.warningTimer = setTimeout(() => {
        this.ngZone.run(() => this.showWarning());
      }, this.TIMEOUT_DURATION - this.WARNING_BEFORE);

      // Logout timer
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => this.performAutoLogout());
      }, this.TIMEOUT_DURATION);
    });
  }

  private showWarning(): void {
    if (!this.authService.isAuthenticated()) return;

    this.warningShown = true;
    let secondsLeft  = Math.round(this.WARNING_BEFORE / 1000);

    Swal.fire({
      icon: 'warning',
      title: 'Session Expiring Soon',
      html: `You will be automatically logged out in <strong>${secondsLeft}</strong> seconds due to inactivity.<br><br>Click <b>Stay Logged In</b> to continue.`,
      confirmButtonText: 'Stay Logged In',
      confirmButtonColor: '#1a73e8',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCancelButton: false,
      didOpen: () => {
        const interval = setInterval(() => {
          secondsLeft--;
          const htmlEl = Swal.getHtmlContainer();
          if (htmlEl) {
            const strong = htmlEl.querySelector('strong');
            if (strong) strong.textContent = String(secondsLeft);
          }
          if (secondsLeft <= 0 || !Swal.isVisible()) {
            clearInterval(interval);
          }
        }, 1000);
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.warningShown = false;
        this.resetTimer();
      }
    });
  }

  private performAutoLogout(): void {
    this.stop();
    Swal.close();

    Swal.fire({
      icon: 'info',
      title: 'Session Expired',
      text: 'You have been logged out due to inactivity.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1a73e8',
      allowOutsideClick: false,
      timer: 5000,
      timerProgressBar: true
    }).then(() => {
      this.authService.logout();
    });
  }

  private clearTimers(): void {
    if (this.inactivityTimer) { clearTimeout(this.inactivityTimer); this.inactivityTimer = null; }
    if (this.warningTimer)    { clearTimeout(this.warningTimer);    this.warningTimer    = null; }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
