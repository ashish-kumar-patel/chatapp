import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/servics/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
 standalone: true,
  imports: [
    CommonModule,
    FormsModule  ,
    ReactiveFormsModule,
    RouterLink           // ✅ add this — fixes [(ngModel)]
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

 form: FormGroup;
  error = '';
  loading = false;

  constructor(fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
