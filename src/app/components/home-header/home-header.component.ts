import { Component, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bagHandleOutline, searchOutline } from 'ionicons/icons';

@Component({
    selector: 'app-home-header',
    standalone: true,
    imports: [IonicModule],
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent {
    constructor() {
        addIcons({ bagHandleOutline, searchOutline })
    }

    openSearch = output<void>();

    onSearchClick() {
        this.openSearch.emit();
    }

}