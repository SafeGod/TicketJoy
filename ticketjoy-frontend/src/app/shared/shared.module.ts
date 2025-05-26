import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

@NgModule({
  declarations: [
    AppLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    AppLayoutComponent,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }