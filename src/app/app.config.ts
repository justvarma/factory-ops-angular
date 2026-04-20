import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LucideAngularModule, Users, Clock, Cpu, LayoutDashboard, LogOut, ChevronRight, Menu, X, Activity, ShieldCheck, UserPlus, Eye, EyeOff, Calendar, Phone, Mail, Bell, Save } from 'lucide-angular';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(LucideAngularModule.pick({
      Users, Clock, Cpu, LayoutDashboard, LogOut, ChevronRight, Menu, X, Activity,
      ShieldCheck, UserPlus, Eye, EyeOff, Calendar, Phone, Mail, Bell, Save
    }))
  ]
};
