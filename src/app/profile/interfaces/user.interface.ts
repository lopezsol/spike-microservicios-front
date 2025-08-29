interface Province {
  nombre: string;
}

interface Locality {
  nombre: string;
}

interface Project {
  id: number;
  name: string;
}

export interface User {
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
