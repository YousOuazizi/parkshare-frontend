import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features: Feature[] = [
    {
      icon: 'location_on',
      title: 'Find Parking Anywhere',
      description: 'Access thousands of verified parking spaces in your city. Book instantly and park with confidence.'
    },
    {
      icon: 'attach_money',
      title: 'Earn Extra Income',
      description: 'List your unused parking space and turn it into a steady income stream. Set your own prices and availability.'
    },
    {
      icon: 'verified_user',
      title: 'Secure & Verified',
      description: 'All users and spaces are verified. Park with peace of mind knowing your vehicle is in a safe location.'
    },
    {
      icon: 'schedule',
      title: 'Flexible Booking',
      description: 'Book by the hour, day, week, or month. Cancel or modify your reservation anytime with ease.'
    },
    {
      icon: 'notifications_active',
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications about bookings, availability, and account activity.'
    },
    {
      icon: 'eco',
      title: 'Eco-Friendly',
      description: 'Reduce traffic congestion and emissions by sharing parking spaces efficiently in your community.'
    }
  ];

  howItWorksSteps: HowItWorksStep[] = [
    {
      icon: 'search',
      title: 'Search & Discover',
      description: 'Browse available parking spaces in your desired location using our interactive map and filters.'
    },
    {
      icon: 'event',
      title: 'Book Instantly',
      description: 'Select your preferred space, choose your dates and times, and complete your booking in seconds.'
    },
    {
      icon: 'directions_car',
      title: 'Park & Go',
      description: 'Arrive at your reserved spot, scan the QR code, and enjoy hassle-free parking.'
    },
    {
      icon: 'star',
      title: 'Review & Earn',
      description: 'Share your experience and earn rewards. Space owners get paid automatically after each booking.'
    }
  ];

  stats: Stat[] = [
    {
      value: '50,000+',
      label: 'Active Users',
      icon: 'people'
    },
    {
      value: '10,000+',
      label: 'Parking Spaces',
      icon: 'local_parking'
    },
    {
      value: '25+',
      label: 'Cities',
      icon: 'location_city'
    },
    {
      value: '98%',
      label: 'Satisfaction Rate',
      icon: 'thumb_up'
    }
  ];

  constructor(private router: Router) {}

  navigateToFindParking(): void {
    this.router.navigate(['/parkings']);
  }

  navigateToListSpace(): void {
    this.router.navigate(['/parkings/create']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/auth/register']);
  }
}
