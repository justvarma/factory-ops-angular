import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, UserPlus, Search, Edit2, Trash2, Filter, X, Save } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styles: [],
  animations: [
    trigger('modalScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  users: any[] = [];
  roles: any[] = [];
  loading = true;
  searchTerm = '';
  isModalOpen = false;
  editingUser: any = null;
  error: string | null = null;

  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile_no: [''],
    password: ['', Validators.required],
    role_id: ['', Validators.required],
    doj: [''],
    process: ['']
  });

  readonly UserPlus = UserPlus;
  readonly Search = Search;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly Filter = Filter;
  readonly X = X;
  readonly Save = Save;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    forkJoin({
      users: this.http.get<any[]>('/api/users'),
      roles: this.http.get<any[]>('/api/roles')
    }).subscribe({
      next: (data) => {
        this.users = data.users;
        this.roles = data.roles;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get filteredUsers() {
    return this.users.filter(u => 
      u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.process?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openAdd() {
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators(Validators.required);
    this.isModalOpen = true;
  }

  openEdit(user: any) {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      mobile_no: user.mobile_no,
      role_id: user.role_id,
      doj: user.doj ? new Date(user.doj).toISOString().split('T')[0] : '',
      process: user.process
    });
    // Password not required for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  handleSubmit() {
    if (this.userForm.invalid) return;

    this.error = null;
    const url = this.editingUser ? `/api/users/${this.editingUser.id}` : '/api/users';
    const method = this.editingUser ? 'patch' : 'post';

    const payload = { ...this.userForm.value };
    if (!payload.password) delete payload.password;

    (this.http as any)[method](url, payload).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.fetchData();
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Failed to save user';
      }
    });
  }

  handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`/api/users/${id}`).subscribe(() => this.fetchData());
  }
}
