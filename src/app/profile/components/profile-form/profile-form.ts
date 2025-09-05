import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../services/user.service';
import { GeorefService } from '../../../shared/services/georef.service';
import { ProjectService } from '../../../shared/services/project.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import type { Project } from '../../../shared/interfaces/project.interface';
import type { User } from '../../interfaces/user.interface';
import type { UserResponse } from '../../interfaces/user-response.interface';
import type { Locality } from '../../../shared/interfaces/locality.interface';
import type { Province } from '../../../shared/interfaces/province.interface';

@Component({
  selector: 'profile-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    Select,
    ButtonModule,
    BottomNavComponent,
    ProgressSpinner,
  ],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  georefService = inject(GeorefService);
  projectService = inject(ProjectService);
  userService = inject(UserService);
  toastService = inject(ToastService);

  user = input.required<UserResponse>();
  isLoading = signal(false);
  editMode = signal(false);
  cancelEditMode = output();
  updateUserEmit = output();
  updatedUser = signal<UserResponse | null>(null);
  provinces = signal<Province[]>([]);
  localitiesByProvince = signal<Locality[]>([]);
  projects = signal<Project[]>([]);
  lastProject = computed(() => {
    const projects = this.user()?.projects;
    return projects ? projects[projects.length - 1] : undefined;
  });
  isLoadingProvince = signal<boolean>(false);
  isLoadingLocality = signal<boolean>(false);
  isLoadingProjects = signal<boolean>(false);

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
    ],
    project: this.fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
    province: this.fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
    locality: this.fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
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
    this.fetchProjects();
    const user = this.user();
    if (user.province?.id) {
      this.fetchLocalities(user.province.id).subscribe((locs) => {
        this.localitiesByProvince.set(locs);
      });
    }
    this.setFormValue(user);
  }

  setFormValue(user: UserResponse) {
    console.log('proyecto en el form: ', this.lastProject()?.id || '');
    this.profileForm.reset(
      {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        technology: user.currentTechnology || '',
        project: this.lastProject()?.id ?? null,
        talent_partner: user.talentPartner || '',
        referent: user.referent || '',
        province: user.province?.id ?? null,
        locality: user.locality?.id ?? null,
      },
      { emitEvent: false }
    );
  }

  onSubmit() {
    console.log('on submit');
    this.profileForm.markAllAsTouched();
    console.log(this.profileForm.errors);
    if (!this.profileForm.valid) {
      this.toastService.error('Hay campos incompletos o erróneos');
      return;
    }
    console.log('finalizado onSubmit');
    const updatedUser = this.createUserForm();
    console.log(updatedUser);
    if (updatedUser) this.updateUser(updatedUser, updatedUser.id);
  }

  updateUser(user: User, id: number) {
    this.isLoading.set(true);
    this.userService.updateUser(user, id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.updatedUser.set(user);
        this.toastService.success('Usuario editado con éxito');
        this.cancelEditMode.emit();
        this.updateUserEmit.emit();
      },
      error: (err) => {
        this.isLoading.set(false);

        console.error('Error al actualizar el usuario', err);
        this.toastService.error('Ocurrio un error editando los datos');
      },
    });
  }

  createUserForm(): User {
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
        ? this.profileForm.value.locality
        : undefined,
      idsProject: this.getProjectsId(),
      idProvince: this.profileForm.value.province
        ? this.profileForm.value.province
        : undefined,
      referent: referent ?? undefined,
      talentPartner: talent_partner ?? undefined,
      currentTechnology: technology ?? undefined,
    };
    return user;
  }

  getProjectsId() {
    const selectedProject = this.profileForm.get('project')?.value;
    let userProjects = this.user().projects?.map((project) => project.id) || [];

    if (selectedProject) {
      if (userProjects.includes(selectedProject)) {
        userProjects = userProjects.filter(
          (projectId) => projectId !== selectedProject
        );
      }
      userProjects.push(selectedProject);
    }
    return userProjects;
  }

  fetchProvinces() {
    this.isLoadingProvince.set(true);
    this.georefService.getAllProvinces().subscribe({
      next: (provinces) => {
        this.isLoadingProvince.set(false);
        this.provinces.set(provinces);
      },
      error: (err) => {
        this.isLoadingProvince.set(false);

        console.error('Error al traer las provincias', err);
        this.toastService.error('Ocurrio un error trayendo las provincias');
      },
    });
  }

  fetchLocalities(id: number) {
    this.isLoadingLocality.set(true);
    return this.georefService.getLocalitiesByProvinceId(id).pipe(
      tap(() => this.isLoadingLocality.set(false)),
      catchError((err) => {
        this.isLoadingLocality.set(false);
        this.toastService.error('Ocurrió un error trayendo las localidades');
        console.error(err);
        return of([]);
      })
    );
  }

  fetchProjects() {
    this.isLoadingProjects.set(true);
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.isLoadingProjects.set(false);
        this.projects.set(projects);
      },
      error: (err) => {
        this.isLoadingProjects.set(false);

        console.error('Error al traer los proyectos', err);
        this.toastService.error('Ocurrio un error trayendo los proyectos');
      },
    });
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
        tap(() => this.profileForm.get('locality')!.setValue(null)),
        tap(() => this.localitiesByProvince.set([])),
        switchMap((province) => {
          if (!province) {
            return of([]);
          }
          return this.fetchLocalities(province!);
        })
      )
      .subscribe((localities) => {
        this.localitiesByProvince.set(localities);
      });
  }
}
