export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  idProvince?: number;
  idLocality?: number;
  currentTechnology?: string;
  referent?: string;
  talentPartner?: string;
  idsProject?: number[];
}
