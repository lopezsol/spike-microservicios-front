import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserResponse } from '../../interfaces/user-response.interface';
import { UserService } from '../../services/user.service';
import { switchMap, tap } from 'rxjs';
import { Locality } from '../../../shared/interfaces/locality.interface';
import { GeorefService } from '../../../shared/services/georef.service';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../shared/interfaces/project.interface';

@Component({
  selector: 'profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  georefService = inject(GeorefService);
  projectService = inject(ProjectService);
  userService = inject(UserService);

  user = input.required<UserResponse>();
  isLoading = signal(false);
  editMode = signal(false);
  updatedUser = signal<UserResponse | null>(null);
  provinces = signal<Province[]>([]);
  localitiesByProvince = signal<Locality[]>([]);
  projects = signal<Project[]>([]);
  lastProject = computed(() => {
    const projects = this.user()?.projects;
    return projects ? projects[projects.length - 1] : undefined;
  });

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
    project: [''],
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
    this.fetchProjects();
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
    console.log('proyecto en el form: ', this.lastProject()?.id || '');
    this.profileForm.reset(
      {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        technology: user.currentTechnology || '',
        project: this.lastProject()?.id.toString() || '',
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
    console.log(this.profileForm.errors);
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
      idsProject: this.getProjectsId(),
      idProvince: this.profileForm.value.province
        ? +this.profileForm.value.province
        : undefined,
      referent: referent ?? undefined,
      talentPartner: talent_partner ?? undefined,
      currentTechnology: technology ?? undefined,
    };
    return user;
  }

  getProjectsId() {
    const selectedProject = this.profileForm.get('project')?.value;
    const userProjects =
      this.user().projects?.map((project) => project.id) || [];
    if (selectedProject && !userProjects.includes(+selectedProject)) {
      userProjects.push(+selectedProject);
    }

    return userProjects;
  }
  fetchProvinces() {
    this.georefService.getAllProvinces().subscribe(this.provinces.set);
  }

  fetchProjects() {
    this.projectService.getAllProjects().subscribe(this.projects.set);
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
        tap(() => this.profileForm.get('locality')!.setValue('')),
        tap(() => this.localitiesByProvince.set([])),
        switchMap((province) => {
          if (!province) {
            return [];
          }
          return this.georefService.getLocalitiesByProvinceId(+province);
        })
      )
      .subscribe((localities) => {
        this.localitiesByProvince.set(localities);
      });
  }
}
