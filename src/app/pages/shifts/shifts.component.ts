import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Plus, Trash2, Edit2, Clock, X, Coffee, AlertCircle, Info } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shifts.component.html',
  styles: [],
  animations: [
    trigger('modalScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }))
      ])
    ])
  ]
})
export class ShiftsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  shifts: any[] = [];
  loading = true;
  isModalOpen = false;
  editingShift: any = null;
  error: string | null = null;

  shiftForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    start_time: ['', Validators.required],
    end_time: ['', Validators.required],
    breaks: this.fb.array([])
  });

  BREAK_TYPES = [
    { label: 'Lunch', value: 'Lunch', emoji: '🍱' },
    { label: 'Tea', value: 'Tea', emoji: '🍵' },
    { label: 'Snacks', value: 'Snacks', emoji: '🥨' },
    { label: 'Toilet', value: 'Toilet', emoji: '🚻' },
    { label: 'Other', value: 'Other', emoji: '📝' },
  ];

  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit2 = Edit2;
  readonly Clock = Clock;
  readonly X = X;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;

  ngOnInit() {
    this.fetchData();
  }

  get breaks() {
    return this.shiftForm.get('breaks') as FormArray;
  }

  fetchData() {
    this.loading = true;
    this.http.get<any[]>('/api/shifts').subscribe({
      next: (data) => {
        this.shifts = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        this.loading = false;
        this.checkTotalDuration();
      },
      error: () => this.loading = false
    });
  }

  totalHours = 0;
  checkTotalDuration() {
    let totalMinutes = 0;
    this.shifts.forEach(shift => {
      if (shift.start_time && shift.end_time) {
        const start = new Date(`1970-01-01T${this.formatTime(shift.start_time)}`);
        let end = new Date(`1970-01-01T${this.formatTime(shift.end_time)}`);
        if (end <= start) end.setDate(end.getDate() + 1);
        totalMinutes += (end.getTime() - start.getTime()) / 60000;
      }
    });
    this.totalHours = totalMinutes / 60;
  }

  formatTime(timeStr: string) {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
    return timeStr.substring(0, 5);
  }

  openAdd() {
    this.editingShift = null;
    const lastShift = this.shifts[this.shifts.length - 1];
    const nextNum = this.shifts.length + 1;
    
    this.shiftForm.reset({
      name: `Shift ${nextNum}`,
      start_time: lastShift ? this.formatTime(lastShift.end_time) : '',
      end_time: ''
    });
    this.breaks.clear();
    this.isModalOpen = true;
  }

  openEdit(shift: any) {
    this.editingShift = shift;
    
    // Find previous shift in sequence
    const currentIndex = this.shifts.findIndex(s => s.id === shift.id);
    const prevShift = currentIndex > 0 ? this.shifts[currentIndex - 1] : null;

    this.shiftForm.reset({
      name: shift.name,
      start_time: prevShift ? this.formatTime(prevShift.end_time) : this.formatTime(shift.start_time),
      end_time: this.formatTime(shift.end_time)
    });

    this.breaks.clear();
    (shift.renamedbreak || []).forEach((b: any) => {
      this.breaks.push(this.fb.group({
        break_start: [this.formatTime(b.break_start)],
        break_end: [this.formatTime(b.break_end)],
        break_type: [this.BREAK_TYPES.some(bt => bt.value === b.break_type) ? b.break_type : 'Other'],
        custom_reason: [this.BREAK_TYPES.some(bt => bt.value === b.break_type) ? '' : b.break_type]
      }));
    });

    this.isModalOpen = true;
  }

  addBreak() {
    this.breaks.push(this.fb.group({
      break_start: ['', Validators.required],
      break_end: ['', Validators.required],
      break_type: ['', Validators.required],
      custom_reason: ['']
    }));
  }

  removeBreak(index: number) {
    this.breaks.removeAt(index);
  }

  handleSubmit() {
    if (this.shiftForm.invalid) return;

    this.error = null;
    const url = this.editingShift ? `/api/shifts/${this.editingShift.id}` : '/api/shifts';
    const method = this.editingShift ? 'patch' : 'post';

    const payload = {
      ...this.shiftForm.value,
      breaks: this.shiftForm.value.breaks.map((b: any) => ({
        ...b,
        break_type: b.break_type === 'Other' ? b.custom_reason : b.break_type
      }))
    };

    (this.http as any)[method](url, payload).subscribe({
      next: (saved: any) => {
        // Handle next shift update in DB if we edited this one
        if (this.editingShift) {
          const currentIndex = this.shifts.findIndex(s => s.id === this.editingShift.id);
          const nextShift = this.shifts[currentIndex + 1];
          if (nextShift) {
            const nextPayload = {
              ...nextShift,
              start_time: payload.end_time,
              // We must format existing breaks for the update
              breaks: (nextShift.renamedbreak || []).map((b: any) => ({
                id: b.id,
                break_start: this.formatTime(b.break_start),
                break_end: this.formatTime(b.break_end),
                break_type: b.break_type
              }))
            };
            this.http.patch(`/api/shifts/${nextShift.id}`, nextPayload).subscribe({
              next: () => {
                this.isModalOpen = false;
                this.fetchData();
              },
              error: () => {
                // Even if next shift fails, we at least saved this one
                this.isModalOpen = false;
                this.fetchData();
              }
            });
            return;
          }
        }
        this.isModalOpen = false;
        this.fetchData();
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Failed to save shift';
      }
    });
  }

  handleDelete(id: number, name: string) {
    const shiftNumbers = this.shifts.map(s => {
      const match = s.name?.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }).filter(n => n > 0);

    const currentShiftNumber = name.match(/\d+/) ? parseInt(name.match(/\d+/)![0]) : 0;
    const maxShiftNumber = Math.max(...shiftNumbers);

    if (currentShiftNumber > 0 && currentShiftNumber < maxShiftNumber) {
      alert(`You can only delete Shift ${maxShiftNumber} first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    this.http.delete(`/api/shifts/${id}`).subscribe(() => this.fetchData());
  }

  getBreakEmoji(type: string) {
    const found = this.BREAK_TYPES.find(b => b.value === type);
    return found ? found.emoji : '📝';
  }
}
