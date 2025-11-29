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

import Constants from 'expo-constants';

// Try multiple ways to get the API URL (different Expo versions use different APIs)
const getApiUrl = () => {
  // 1. Environment variable (for development)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // 2. Constants.manifest2 (newer Expo SDK)
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // 3. Constants.manifest (older Expo SDK)
  if (Constants.manifest?.extra?.apiUrl) {
    return Constants.manifest.extra.apiUrl;
  }
  
  // 4. Fallback to hardcoded IP
  return "http://192.168.1.196:5000/api";
};

const API_URL = getApiUrl();

// Always log the API URL (even in production) for debugging
console.log("🔗 API URL configured:", API_URL);
console.log("🔍 process.env.EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("🔍 Constants.expoConfig?.extra?.apiUrl:", Constants.expoConfig?.extra?.apiUrl);
console.log("🔍 Constants.manifest?.extra?.apiUrl:", Constants.manifest?.extra?.apiUrl);

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
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
  // Always log requests for debugging
  console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for error logging
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      timeout: error.code === 'ECONNABORTED',
      networkError: error.message === 'Network Error',
    });
    return Promise.reject(error);
  }
);

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

// Export API_URL for debugging
export { API_URL };

export default agent;

