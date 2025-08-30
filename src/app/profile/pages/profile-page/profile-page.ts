import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ProfileFormComponent } from '../../components/profile-form/profile-form';
import userResponse from '../../mocks/user-response.json';
import { UserResponse } from '../../interfaces/user-response.interface';
@Component({
  selector: 'app-profile-page',
  imports: [ProfileFormComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent {
  userService = inject(UserService);
  isLoading = signal(false);
  editMode = signal(false);
  user = signal<UserResponse | null>(null);
  firstProject = computed(() => this.user()?.projects?.[0]);

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser() {
    //TODO:usuario harcodeado
    this.userService.getUser(5).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.user.set(user);
        // this.showSuccess();
      },
      error: (err) => {
        this.isLoading.set(false);

        console.error('Error al traer usuario', err);
        // this.showError();
      },
    });
  }

  editProfile() {
    this.editMode.set(true);
  }
}
