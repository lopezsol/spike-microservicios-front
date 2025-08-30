import type { Locality } from '../../shared/interfaces/locality.interface';
import type { Project } from '../../shared/interfaces/project.interface';

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
