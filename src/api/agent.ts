import axios, { AxiosResponse } from "axios";
import {
  CreatePostPayload,
  EditPostPayload,
  LoginPayload,
  PostDto,
  PostListQuery,
  RegisterPayload,
  Tag,
  User,
} from "./models";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
});

let authToken: string | null = null;

export const setAgentAuthToken = (token: string | null | undefined) => {
  // Ensure we only store valid tokens, not "undefined" strings
  authToken = token && token !== "undefined" ? token : null;
};

client.interceptors.request.use((config) => {
  if (authToken && authToken !== "undefined") {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const mapPostDto = (post: any): PostDto => ({
  id: post?.id ?? post?.Id ?? "",
  title: post?.title ?? post?.Title ?? "",
  content: post?.content ?? post?.Content ?? "",
  summary: post?.summary ?? post?.Summary ?? "",
  isPublished: post?.isPublished ?? post?.IsPublished ?? false,
  createdAt: post?.createdAt ?? post?.CreatedAt ?? "",
  updatedAt: post?.updatedAt ?? post?.UpdatedAt ?? "",
  author: post?.author
    ? {
        id: post.author.id ?? post.author.Id ?? "",
        displayName: post.author.displayName ?? post.author.DisplayName ?? "",
      }
    : post?.Author
      ? {
          id: post.Author.id ?? post.Author.Id ?? "",
          displayName: post.Author.displayName ?? post.Author.DisplayName ?? "",
        }
      : null,
  tags: post?.tags ?? post?.Tags ?? [],
});

const mapPostArray = (posts: any[] | undefined | null) =>
  Array.isArray(posts) ? posts.map(mapPostDto) : [];

const requests = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    client.get<T>(url, { params }).then(responseBody),
  post: <T>(url: string, body?: object) =>
    client.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body?: object) =>
    client.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => client.delete<T>(url).then(responseBody),
};

const Posts = {
  list: (query?: PostListQuery) =>
    requests
      .get<PostDto[]>("/posts", {
        onlyPublished: query?.onlyPublished,
        authorId: query?.authorId,
        search: query?.search,
      })
      .then(mapPostArray),
  details: (id: string) => requests.get<PostDto>(`/posts/${id}`).then(mapPostDto),
  create: (payload: CreatePostPayload) =>
    requests.post<PostDto>("/posts", payload).then(mapPostDto),
  update: (id: string, payload: EditPostPayload) =>
    requests.put<PostDto>(`/posts/${id}`, payload).then(mapPostDto),
  delete: (id: string) => requests.delete<void>(`/posts/${id}`),
};

const Accounts = {
  login: (payload: LoginPayload) =>
    requests.post<User>("/accounts/login", payload),
  register: (payload: RegisterPayload) =>
    requests.post<User>("/accounts/register", payload),
  current: () => requests.get<User>("/accounts/current"),
};

const Tags = {
  list: () => requests.get<Tag[]>("/tags"),
};

const agent = {
  Posts,
  Accounts,
  Tags,
};

export default agent;

