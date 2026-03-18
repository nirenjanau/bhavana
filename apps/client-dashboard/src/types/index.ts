export interface Photo {
  id: string;
  thumbnail_url: string;
  preview_url: string;
  original_url: string;
  original_key: string;
  filename: string;
  width: number;
  height: number;
  is_liked: boolean;
  is_selected: boolean;
}

export interface GalleryStats {
  total: number;
  liked: number;
  selected: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GalleryResponse {
  photos: Photo[];
  pagination: Pagination;
}

export interface Client {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  total_photos: number;
  selected_photos: number;
}

export type Filter = "all" | "liked" | "selected";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      accessToken: string;
    };
  }

  interface User {
    id: string;
    role: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    accessToken: string;
  }
}
