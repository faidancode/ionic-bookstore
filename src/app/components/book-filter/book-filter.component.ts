import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { debounceTime } from 'rxjs';
import { Category } from 'src/app/core/models';

export interface FilterPayload {
  sort: string;
  minPrice: number | null;
  maxPrice: number | null;
  categories: string[];
}

@Component({
  selector: 'app-book-filter',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
  templateUrl: './book-filter.component.html',
})
export class BookFilterComponent implements OnInit {
  filterForm!: FormGroup;
  filterChanged = output<FilterPayload>();
  categories = input<Category[]>([]); // Ambil dari service

  private fb = inject(FormBuilder);

  ngOnInit() {
    this.filterForm = this.fb.group({
      sort: ['createdAt:desc'],
      minPrice: [null],
      maxPrice: [null],
      categories: [[]],
    });

    // Auto-fetch saat ada perubahan value
    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe((val) => {
      this.filterChanged.emit(val);
    });
  }

  toggleCategory(slug: string) {
    const control = this.filterForm.get('categories');
    const current = [...control?.value];
    const index = current.indexOf(slug);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(slug);
    }

    control?.setValue(current);
  }
}
