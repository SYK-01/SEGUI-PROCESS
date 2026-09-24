import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MATERIAL_MODULES } from '../../../material/material.imports';
import { AuthService } from '../../../services/Auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = false;
  ocultarPassword = true;

  form = this.fb.group({
    Nom_Usuario: ['', Validators.required],
    Pwd_Usuario: ['', Validators.required]
  });


  onMouseMove(e: MouseEvent): void {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
}
   
  onMouseLeave(e: MouseEvent): void {
  (e.currentTarget as HTMLElement).style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
}

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    

    this.cargando = true;

    this.authService.login({
      Nom_Usuario: this.form.value.Nom_Usuario!,
      Pwd_Usuario: this.form.value.Pwd_Usuario!
    }).subscribe({
      next: (res) => {
        this.cargando = false;

        if (res.Codigo === 1) {
          this.router.navigate(['/', 'pages', 'tablero']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: res.Mensaje || 'Usuario o contraseña incorrectos.',
            confirmButtonColor: '#8f2121'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar sesión',
          text: err.message || 'Usuario o contraseña incorrectos.',
          confirmButtonColor: '#8f2121'
        });
      }
    });
  }
}

