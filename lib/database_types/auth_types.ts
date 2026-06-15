export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
};

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    created_at?: string;
}