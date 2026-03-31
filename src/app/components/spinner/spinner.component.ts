import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrapper">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <div class="spinner-text">Loading data...</div>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 0;
    }

    .spinner {
      width: 70px;
      text-align: center;
    }

    .spinner > div {
      width: 18px;
      height: 18px;
      background-color: #600e6d;
      border-radius: 100%;
      display: inline-block;
      animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    }

    .spinner .bounce1 {
      animation-delay: -0.32s;
    }

    .spinner .bounce2 {
      animation-delay: -0.16s;
    }

    .spinner-text {
      margin-top: 12px;
      color: #6c757d;
      font-size: 0.875rem;
    }

    @keyframes sk-bouncedelay {
      0%, 80%, 100% { 
        transform: scale(0);
      } 40% { 
        transform: scale(1.0);
      }
    }
  `]
})
export class SpinnerComponent {}
