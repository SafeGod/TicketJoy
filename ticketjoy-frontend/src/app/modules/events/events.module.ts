// events.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventCreateComponent } from './components/event-create/event-create.component';

const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'create', component: EventCreateComponent },
  { path: ':id', component: EventDetailComponent }
];

@NgModule({
  declarations: [
    EventListComponent,
    EventDetailComponent,
    EventCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Añade esta línea
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class EventsModule { }