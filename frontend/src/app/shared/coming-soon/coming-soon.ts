import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './coming-soon.html'
})
export class ComingSoonComponent {
  constructor(
    public dialogRef: MatDialogRef<ComingSoonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { feature: string }
  ) {}
}
