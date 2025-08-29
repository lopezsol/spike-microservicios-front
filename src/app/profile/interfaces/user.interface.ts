export interface User {
  id: number;               
  first_name: string;
  last_name: string;
  email?: string;
  technology?: string;

//TODO:revisar
  locality?: string;
  province?: string;
  supervisor?: string;     
  talent_partner?: string; 
}
