import { UserStatus } from 'src/components/models'

export interface ApiToken {
    type: 'bearer'
    token: string
    expires_at?: string
    expires_in?: number
  }
  
  export interface RegisterData {
    first_name: string;
    last_name: string;
    nickname: string;
    email: string;
    password: string;
  }
  
  export interface LoginCredentials {
    email: string
    password: string
  }
  
  export interface User {
    id: number;
    email: string;
    nickname: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
  }