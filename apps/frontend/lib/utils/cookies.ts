export const setAuthCookie = (token?: string): void => {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
};

export const getAuthToken = (): string | undefined => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};

export const clearAuthCookie = (): void => {
  document.cookie = 'token=; path=/; max-age=0';
};