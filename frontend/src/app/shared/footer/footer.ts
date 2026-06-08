import { ComingSoonComponent } from '../coming-soon/coming-soon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [MatRippleModule, MatDialogModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Footer {
  constructor(public dialog: MatDialog) {}
  showComingSoon(feature: string, event: Event) {
    event.preventDefault();
    this.dialog.open(ComingSoonComponent, {
      width: '350px',
      data: { feature: feature }
    });
  }
}
