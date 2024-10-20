export type user = {
  fullname: string;
  email: string;
  id: string;
  role: string;
};

export type SignUp = {
  fullname?: string;
  email: string;
  password: string;
};

export type SignIn = {
  email: string;
  password: string;
};
