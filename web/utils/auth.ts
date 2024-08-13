export interface CredentialsInterface {
  userEmail: string;
  userPassword: string;
}

export function isCredentials(arg: any): arg is CredentialsInterface {
  return arg && arg.userEmail && arg.userPassword;
}

export interface LoginResponseInterface {
  [x: string]: any;
  access_token: string;
}

export function isLoginResponse(arg: any): arg is LoginResponseInterface {
  console.log(arg);
  return arg && arg.access_token && arg.user;
}

export interface JwtPayloadInterface {
  sub: string;
}

export function isJwtPayload(arg: any): arg is JwtPayloadInterface {
  return arg && arg.sub;
}
