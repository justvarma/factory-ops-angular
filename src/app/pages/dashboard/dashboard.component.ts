import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule, Users, ShieldCheck, Cpu, Clock, ChevronRight, Activity, Bell, UserPlus } from 'lucide-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  public http = inject(HttpClient);
  public router = inject(Router);

  readonly Users = Users;
  readonly Cpu = Cpu;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly Activity = Activity;
  readonly Bell = Bell;
  readonly UserPlus = UserPlus;

  stats = [
    { name: 'Total Users', value: '0', icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2', status: 'Active' },
    { name: 'Active Shifts', value: '0', icon: 'Clock', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Current', status: 'Live' },
    { name: 'Total Machines', value: '0', icon: 'Cpu', color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Stable', status: 'Online' },
  ];

  recentActivity: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    forkJoin({
      users: this.http.get<any[]>('/api/users'),
      shifts: this.http.get<any[]>('/api/shifts'),
      machines: this.http.get<any[]>('/api/machines')
    }).subscribe({
      next: (data) => {
        this.stats[0].value = data.users.length.toString();
        this.stats[1].value = data.shifts.length.toString();
        this.stats[2].value = data.machines.length.toString();

        // Create mock/derived activity
        const activities: any[] = [];

        data.users.slice(0, 3).forEach(u => {
          activities.push({
            type: 'user',
            title: 'New user registered',
            description: `${u.username} joined as ${u.role?.name || 'User'}`,
            time: 'Recently',
            icon: 'UserPlus',
            color: 'text-blue-500',
            bg: 'bg-blue-50'
          });
        });

        data.machines.slice(0, 2).forEach(m => {
          activities.push({
            type: 'machine',
            title: 'Machine updated',
            description: `${m.type} configuration changed`,
            time: 'Today',
            icon: 'Cpu',
            color: 'text-amber-500',
            bg: 'bg-amber-50'
          });
        });

        this.recentActivity = activities;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch dashboard data', err);
        this.loading = false;
      }
    });
  }

  viewAll() {
    this.router.navigate(['/dashboard/users']);
  }
}
