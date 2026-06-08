import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-pnr-enquiry',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './pnr-enquiry.html'
})
export class PnrEnquiryComponent implements OnInit {
  pnr: string = '';
  result: any = null;

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<PnrEnquiryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data && this.data.pnr) {
      this.pnr = this.data.pnr;
      this.checkPnr();
    }
  }

  checkPnr() {
    this.apiService.getPnrStatus(this.pnr).subscribe({
      next: (res) => {
        this.result = res;
      },
      error: (err) => {
        this.result = null;
        alert('PNR fetch failed: ' + (err.error?.message || 'Not found'));
      }
    });
  }
}
