import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProfileFormComponent } from '../../components/profile-form/profile-form';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import type { UserResponse } from '../../interfaces/user-response.interface';
@Component({
  selector: 'app-profile-page',
  imports: [ProfileFormComponent, BottomNavComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent {
  userService = inject(UserService);
  toastService = inject(ToastService); 
  isLoading = signal(false);
  editMode = signal(false);
  user = signal<UserResponse | null>(null);

  lastProject = computed(() => {
    const projects = this.user()?.projects;
    return projects ? projects[projects.length - 1] : undefined;
  });

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser() {
    //TODO:usuario harcodeado
    this.userService.getUser(5).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.user.set(user);
      },
      error: (err) => {
        this.isLoading.set(false);

        console.error('Error al traer usuario', err);
        this.toastService.error(
          'Ocurrio un error trayendo los datos del usuario'
        );
      },
    });
  }

  editProfile() {
    this.editMode.set(true);
  }
}
