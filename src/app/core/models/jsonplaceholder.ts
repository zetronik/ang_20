/**
 * Модели данных публичного тестового API https://jsonplaceholder.typicode.com/
 * Используются во всех демо, где нужен реальный HTTP-запрос.
 */

export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface PostComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface Album {
  userId: number;
  id: number;
  title: string;
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}
