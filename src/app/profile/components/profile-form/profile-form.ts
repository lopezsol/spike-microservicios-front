import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserResponse } from '../../interfaces/user-response.interface';
import { UserService } from '../../services/user.service';
import { switchMap, tap } from 'rxjs';
import { Locality } from '../../../shared/interfaces/locality.interface';
import { GeorefService } from '../../../shared/services/georef.service';

@Component({
  selector: 'profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  georefService = inject(GeorefService);
  user = input.required<UserResponse>();
  userService = inject(UserService);
  isLoading = signal(false);
  editMode = signal(false);
  updatedUser = signal<UserResponse | null>(null);
  provinces = signal<Province[]>([]);
  localitiesByProvince = signal<Locality[]>([]);

  profileForm = this.fb.group({
    firstName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
    lastName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
    technology: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      // technology: this.fbarray([])
    ],
    project: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(75)],
    ],
    province: [''],
    locality: [''],
    talent_partner: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
    referent: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
  });

  ngOnInit() {
    this.fetchProvinces();

    const user = this.user();
    if (user.province?.id) {
      this.georefService
        .getLocalitiesByProvinceId(user.province.id)
        .subscribe((locs) => {
          this.localitiesByProvince.set(locs);
        });
    }

    this.setFormValue(user);
  }

  setFormValue(user: UserResponse) {
    this.profileForm.reset(
      {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        technology: user.currentTechnology || '',
        project:
          user.projects && user.projects.length > 0
            ? user.projects[0].name
            : '',
        talent_partner: user.talentPartner || '',
        referent: user.referent || '',
        province: user.province?.id.toString() || '',
        locality: user.locality?.id.toString() || '',
      },
      { emitEvent: false }
    );
  }

  onSubmit() {
    console.log('on submit');
    this.profileForm.markAllAsTouched();
    if (!this.profileForm.valid) return;
    console.log('finalizado onSubmit');
    const updatedUser = this.createUserForm();
    console.log(updatedUser);
    if (updatedUser) this.updateUser(updatedUser, updatedUser.id);
  }

  updateUser(user: User, id: number) {
    this.userService.updateUser(user, id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.updatedUser.set(user);
        // this.showSuccess();
      },
      error: (err) => {
        this.isLoading.set(false);

        console.error('Error al actualizar el usuario', err);
        // this.showError();
      },
    });
  }

  createUserForm(): User {
    // const formValue = this.profileForm.getRawValue();

    const {
      firstName = '',
      lastName = '',
      project = '',
      referent = '',
      talent_partner = '',
      technology = '',
    } = this.profileForm.value;

    const user: User = {
      id: this.user().id,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      idLocality: this.profileForm.value.locality
        ? +this.profileForm.value.locality
        : undefined,
      //TODO: GRAVE PROBLEMA UWU
      // idsProject: project ?? undefined,
      idsProject: [1, 2],
      idProvince: this.profileForm.value.province
        ? +this.profileForm.value.province
        : undefined,
      referent: referent ?? undefined,
      talentPartner: talent_partner ?? undefined,
      currentTechnology: technology ?? undefined,
    };
    return user;
  }

  fetchProvinces() {
    this.georefService.getAllProvinces().subscribe(this.provinces.set);
  }

  onFormChanged = effect((onCleanup) => {
    const provinceSubscription = this.onProvinceChanged();
    onCleanup(() => {
      provinceSubscription.unsubscribe();
    });
  });

  onProvinceChanged() {
    return this.profileForm
      .get('province')!
      .valueChanges.pipe(
        tap((province) => console.log('valor province:', province)),
        tap(() => this.profileForm.get('locality')!.setValue('')),
        tap(() => this.localitiesByProvince.set([])),
        switchMap((province) => {
          if (!province) {
            console.log('province vacío, no llamo al back');
            return [];
          }
          console.log('voy a llamar al back con id:', province);
          return this.georefService.getLocalitiesByProvinceId(+province);
        })
      )
      .subscribe((localities) => {
        console.log('localidades recibidas:', localities);
        this.localitiesByProvince.set(localities);
      });
  }
}
