import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent implements OnInit {
  eventForm!: FormGroup;
  isSubmitting = false;
  submitted = false;
  error = '';
  
  // Mock categories data
  categories = [
    { id: 1, name: 'Conferencias', color: 'blue' },
    { id: 2, name: 'Música', color: 'purple' },
    { id: 3, name: 'Talleres', color: 'orange' },
    { id: 4, name: 'Deportes', color: 'green' },
    { id: 5, name: 'Cultura', color: 'red' }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      location: ['', Validators.required],
      address: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      categories: [[], Validators.required],
      image: ['']
    });
  }
  
  // Convenience getter for easy access to form fields
  get f() { return this.eventForm.controls; }
  
  toggleCategory(categoryId: number): void {
    const currentCategories = this.f['categories'].value as number[];
    const index = currentCategories.indexOf(categoryId);
    
    if (index > -1) {
      // Category already selected, remove it
      currentCategories.splice(index, 1);
    } else {
      // Category not selected, add it
      currentCategories.push(categoryId);
    }
    
    this.f['categories'].setValue(currentCategories);
  }
  
  isCategorySelected(categoryId: number): boolean {
    const currentCategories = this.f['categories'].value as number[];
    return currentCategories.includes(categoryId);
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.eventForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.error = '';
    
    // In a real app, this would call an API service
    console.log('Form Values:', this.eventForm.value);
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      
      // Simulate successful creation
      alert('Evento creado con éxito!');
      this.router.navigate(['/events']);
      
      // Or simulate an error
      // this.error = 'Error al crear el evento. Por favor, inténtelo de nuevo.';
    }, 1500);
  }
}