import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api", // used in store
  baseQuery: fetchBaseQuery({ baseUrl: "https://jsonplaceholder.typicode.com" }),
  endpoints: (builder) => ({
    getPosts: builder.query({ query: () => "/posts" }),
    loginUser: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
  }),
});