export type TUpdateProfile = {
  name?: string;
  phone?: string;
  address?: string;
};

export type TUpdateUserStatus = {
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
};
