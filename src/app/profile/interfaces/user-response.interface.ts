import type { Locality } from '../../shared/interfaces/locality.interface';
import type { Project } from '../../shared/interfaces/project.interface';
import type { Province } from '../../shared/interfaces/province.interface';

export interface UserResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  province?: Province;
  locality?: Locality;
  currentTechnology?: string;
  referent?: string;
  talentPartner?: string;
  projects?: Project[];
}
