import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PopularBooksComponent } from '../../components/popular-books/popular-books.component';
import { CategoryListComponent } from '../../components/category-list/category-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    PopularBooksComponent,
    CategoryListComponent,
  ],
})
export class HomePage {}
