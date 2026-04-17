import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Plus, ShieldCheck, Trash2, Edit2, X, Save } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
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
export class RolesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  roles: any[] = [];
  loading = true;
  isModalOpen = false;
  editingRole: any = null;
  error: string | null = null;

  roleForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  readonly Plus = Plus;
  readonly ShieldCheck = ShieldCheck;
  readonly Trash2 = Trash2;
  readonly Edit2 = Edit2;
  readonly X = X;
  readonly Save = Save;

  ngOnInit() {
    this.fetchRoles();
  }

  fetchRoles() {
    this.loading = true;
    this.http.get<any[]>('/api/roles').subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openAdd() {
    this.editingRole = null;
    this.roleForm.reset();
    this.isModalOpen = true;
  }

  openEdit(role: any) {
    this.editingRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.isModalOpen = true;
  }

  handleSubmit() {
    if (this.roleForm.invalid) return;

    this.error = null;
    const url = this.editingRole ? `/api/roles/${this.editingRole.id}` : '/api/roles';
    const method = this.editingRole ? 'patch' : 'post';

    this.http[method](url, this.roleForm.value).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.fetchRoles();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save role';
      }
    });
  }

  handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this role?')) return;
    this.http.delete(`/api/roles/${id}`).subscribe(() => this.fetchRoles());
  }
}
