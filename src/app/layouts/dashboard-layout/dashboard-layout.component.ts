import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-layout.component.html',
  styles: [],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardLayoutComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  isSidebarOpen = true;

  navItems = [
    { name: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { name: 'Users', icon: 'Users', href: '/dashboard/users' },
    { name: 'Machines', icon: 'Cpu', href: '/dashboard/machines' },
    { name: 'Shifts', icon: 'Clock', href: '/dashboard/shifts' },
    { name: 'Roles', icon: 'ShieldCheck', href: '/dashboard/roles' },
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  
  logout() {
    this.router.navigate(['/login']);
  }
}
