import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  user = input.required<User>();

  provinces = [
    { id: 1, nombre: 'Ontario' },
    { id: 2, nombre: 'Quebec' },
    { id: 3, nombre: 'British Columbia' },
  ];

  localities = [
    { id: 1, nombre: 'Downtown' },
    { id: 2, nombre: 'Harbor District' },
    { id: 3, nombre: 'Old Town' },
  ];

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
    province: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(50)],
    ],
    locality: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
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
    this.setFormValue(this.user());
  }
  
  setFormValue(user: User) {
    this.profileForm.reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      technology: user.currentTechnology || '',
      project:
        user.projects && user.projects.length > 0 ? user.projects[0].name : '',
      province: user.province?.nombre || '',
      locality: user.locality?.nombre || '',
      talent_partner: user.talentPartner || '',
      referent: user.referent || '',
    });
  }

  onSubmit() {
    console.log('on submit');
    this.profileForm.markAllAsTouched();
    if (!this.profileForm.valid) return;
    console.log('finalizado onSubmit');
    // const newUser = this.createUser();
    // this.$newUser.set(newUser);
  }
}

/*
technology
locality
province -> La manejo objeto id + name o solo nombre?
project

*/
