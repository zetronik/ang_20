import { InjectionToken } from '@angular/core';

/**
 * НОВОЕ (v14+, но в v16 мы всё ещё часто писали providers в NgModule):
 * `InjectionToken` с `providedIn: 'root'` + фабрикой — tree-shakable провайдер
 * без единой строчки в `providers: []`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://jsonplaceholder.typicode.com',
});
