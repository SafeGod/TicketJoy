import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/services/event.service';
import { EventCategoryService } from '../../../../core/services/event-category.service';
import { ImageService } from '../../../../core/services/image.service';
import { EventCategory } from '../../../../core/models/event-category.model';
import { finalize } from 'rxjs/operators';

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
  isLoadingCategories = true;
  categories: EventCategory[] = [];
  isUploadingImage = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private eventService: EventService,
    private categoryService: EventCategoryService,
    private imageService: ImageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
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
  
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getCategories()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
        })
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.error = 'No se pudieron cargar las categorías. Por favor, intente de nuevo.';
        }
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
  
  onFileChange(event: any): void {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.selectedFile = files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  uploadImage(): void {
    if (!this.selectedFile) {
      return;
    }
    
    this.isUploadingImage = true;
    this.imageService.uploadImage(this.selectedFile)
      .pipe(
        finalize(() => {
          this.isUploadingImage = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.f['image'].setValue(response.url);
          console.log('Image uploaded successfully', response.url);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.error = 'Error al subir la imagen. Por favor, intente de nuevo.';
        }
      });
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    // Stop here if form is invalid
    if (this.eventForm.invalid) {
      return;
    }
    
    // If there's a selected file but it hasn't been uploaded yet, upload it first
    if (this.selectedFile && !this.f['image'].value) {
      this.uploadImage();
      return;
    }
    
    this.isSubmitting = true;
    this.error = '';
    
    // Preparar los datos del formulario
    const eventData = {
      ...this.eventForm.value,
      status: 'draft' // Por defecto, el evento se crea como borrador
    };
    
    // Llamar al servicio para crear el evento
    this.eventService.createEvent(eventData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Redireccionar a la lista de eventos o al detalle del evento creado
          this.router.navigate(['/events', response.id]);
        },
        error: (error) => {
          console.error('Error creating event:', error);
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.error && error.error.errors) {
            // Manejar errores de validación
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
            this.error = errorMessages.join(', ');
          } else {
            this.error = 'Error al crear el evento. Por favor, inténtelo de nuevo.';
          }
        }
      });
  }
}