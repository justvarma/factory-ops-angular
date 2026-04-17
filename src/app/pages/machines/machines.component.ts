import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Plus, Cpu, Trash2, Edit2, X, Save } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './machines.component.html',
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
export class MachinesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  machines: any[] = [];
  loading = true;
  isModalOpen = false;
  editingMachine: any = null;
  error: string | null = null;

  machineForm: FormGroup = this.fb.group({
    type: ['', Validators.required],
    description: ['']
  });

  readonly Plus = Plus;
  readonly CpuIcon = Cpu;
  readonly Trash2 = Trash2;
  readonly Edit2 = Edit2;
  readonly X = X;
  readonly Save = Save;

  ngOnInit() {
    this.fetchMachines();
  }

  fetchMachines() {
    this.loading = true;
    this.http.get<any[]>('/api/machines').subscribe({
      next: (data) => {
        this.machines = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openAdd() {
    this.editingMachine = null;
    this.machineForm.reset();
    this.isModalOpen = true;
  }

  openEdit(machine: any) {
    this.editingMachine = machine;
    this.machineForm.patchValue({
      type: machine.type,
      description: machine.description
    });
    this.isModalOpen = true;
  }

  handleSubmit() {
    if (this.machineForm.invalid) return;

    this.error = null;
    const url = this.editingMachine ? `/api/machines/${this.editingMachine.id}` : '/api/machines';
    const method = this.editingMachine ? 'patch' : 'post';

    this.http[method](url, this.machineForm.value).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.fetchMachines();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save machine';
      }
    });
  }

  handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this machine?')) return;
    this.http.delete(`/api/machines/${id}`).subscribe(() => this.fetchMachines());
  }
}
