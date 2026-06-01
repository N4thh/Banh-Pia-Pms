import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isAdmin';
export const isAdmin = () => SetMetadata(IS_ADMIN_KEY, true);
export const IsAdmin = isAdmin;
