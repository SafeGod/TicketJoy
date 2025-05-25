import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;
  allowedEmailDomain = environment.allowedEmailDomain;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.institutionalEmailValidator()]],
      institutional_id: ['', [Validators.required]],
      phone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  // Custom validator for institutional email
  institutionalEmailValidator() {
    return (control: any) => {
      const email = control.value;
      if (!email) {
        return null;
      }

      const domain = email.split('@')[1];
      if (domain !== this.allowedEmailDomain) {
        return { invalidDomain: true };
      }

      return null;
    };
  }

  // Custom validator for password matching
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else if (error.error && error.error.errors) {
            // Handle validation errors
            const validationErrors = error.error.errors;
            const errorMessages = Object.keys(validationErrors).map(key => validationErrors[key][0]);
            this.error = errorMessages.join(', ');
          } else {
            this.error = 'Error al registrarse. Por favor, intenta de nuevo.';
          }
        }
      });
  }
}
