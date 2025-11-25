export interface PostAuthor {
  id: string;
  displayName: string;
}

export interface PostDto {
  id: string;
  title: string;
  content: string;
  summary: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor | null;
  tags: string[];
}

export interface PostListQuery {
  onlyPublished?: boolean;
  authorId?: string;
  search?: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  summary: string;
  isPublished?: boolean;
  tags?: string[];
}

export interface EditPostPayload {
  title?: string;
  content?: string;
  summary?: string;
  isPublished?: boolean;
  tags?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  bio?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  token: string;
}

export interface Tag {
  id: string;
  name: string;
}

