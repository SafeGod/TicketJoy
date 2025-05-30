import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../core/services/event.service';
import { EventCategoryService } from '../../../../core/services/event-category.service';
import { ImageService } from '../../../../core/services/image.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Event } from '../../../../core/models/event.model';
import { EventCategory } from '../../../../core/models/event-category.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss']
})
export class EventEditComponent implements OnInit {
  eventId: number = 0;
  eventForm!: FormGroup;
  isSubmitting = false;
  submitted = false;
  error = '';
  isLoadingEvent = true;
  isLoadingCategories = true;
  categories: EventCategory[] = [];
  isUploadingImage = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  event: Event | null = null;
  isAdmin = false;
  isOrganizer = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private categoryService: EventCategoryService,
    private imageService: ImageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.eventId = +this.route.snapshot.paramMap.get('id')!;

    if (isNaN(this.eventId) || this.eventId <= 0) {
      this.router.navigate(['/events']);
      return;
    }

    this.initForm();
    this.loadCategories();
    this.loadEvent();
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
      image: [''],
      status: ['draft']
    });
  }

  loadEvent(): void {
    this.isLoadingEvent = true;
    this.error = '';

    this.eventService.getEvent(this.eventId)
      .pipe(
        finalize(() => {
          this.isLoadingEvent = false;
        })
      )
      .subscribe({
        next: (event) => {
          this.event = event;

          // Check permissions
          const currentUser = this.authService.currentUser;
          this.isOrganizer = currentUser?.id === event.organizer_id;

          if (!this.isAdmin && !this.isOrganizer) {
            this.router.navigate(['/events', this.eventId]);
            return;
          }

          // Populate form with event data
          this.populateForm(event);
        },
        error: (error) => {
          console.error('Error loading event:', error);
          if (error.status === 404) {
            this.error = 'El evento no existe o no tienes permisos para editarlo.';
          } else if (error.status === 403) {
            this.error = 'No tienes permisos para editar este evento.';
          } else {
            this.error = 'Error al cargar el evento. Por favor, intenta de nuevo.';
          }
        }
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
          // Don't show error for categories, not critical
        }
      });
  }

  populateForm(event: Event): void {
    // Format dates for datetime-local input
    const startDate = this.formatDateForInput(event.start_date);
    const endDate = this.formatDateForInput(event.end_date);

    // Get category IDs
    const categoryIds = event.categories?.map(cat => cat.id) || [];

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      start_date: startDate,
      end_date: endDate,
      location: event.location,
      address: event.address,
      capacity: event.capacity,
      price: event.price,
      categories: categoryIds,
      image: event.image || '',
      status: event.status
    });

    // Set image preview if exists
    if (event.image) {
      this.imagePreview = event.image;
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Convenience getter for easy access to form fields
  get f() { return this.eventForm.controls; }

  toggleCategory(categoryId: number): void {
    const currentCategories = this.f['categories'].value as number[];
    const index = currentCategories.indexOf(categoryId);

    if (index > -1) {
      currentCategories.splice(index, 1);
    } else {
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

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.f['image'].setValue('');
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

    // Prepare form data
    const eventData = { ...this.eventForm.value };

    // Call service to update the event
    this.eventService.updateEvent(this.eventId, eventData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Redirect to event detail with success message
          this.router.navigate(['/events', response.id], {
            queryParams: { message: 'Evento actualizado correctamente' }
          });
        },
        error: (error) => {
          console.error('Error updating event:', error);
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.error && error.error.errors) {
            // Handle validation errors
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
            this.error = errorMessages.join(', ');
          } else {
            this.error = 'Error al actualizar el evento. Por favor, inténtelo de nuevo.';
          }
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/events', this.eventId]);
  }
}
