export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  PRACTICEADMIN = 'practice admin',
}
export default interface IJwtPayload {
  email: string;
  role: UsersRole;
}
