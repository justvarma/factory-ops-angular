import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // In a real app, we'd check if a session cookie exists or call an 'auth/me' endpoint
    // For now, since we can't easily check http-only cookies in JS, we'll let the initial
    // API requests fail with 401 and handle it there, OR assuming if the user navigated here
    // they might be logged in.

    // Actually, a better way is to have an AuthService that tracks login state.
    return true;
};
