import { DataProvider } from '@refinedev/core';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  // GET list
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};

    const params: any = {
      page: current,
      limit: pageSize,
    };

    // Add filters
    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter) {
          params[filter.field] = filter.value;
        }
      });
    }

    // Add sorters
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      params.sortBy = sorter.field;
      params.sortOrder = sorter.order;
    }

    const { data } = await axiosInstance.get(`/${resource}`, { params });

    return {
      data: data.data || data,
      total: data.total || data.length || 0,
    };
  },

  // GET one
  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`/${resource}/${id}`);
    return { data };
  },

  // POST create
  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`/${resource}`, variables);
    return { data };
  },

  // PATCH/PUT update
  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(`/${resource}/${id}`, variables);
    return { data };
  },

  // DELETE
  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(`/${resource}/${id}`);
    return { data };
  },

  // Custom method for batch operations
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}`;

    if (query) {
      const params = new URLSearchParams(query);
      requestUrl = `${requestUrl}?${params.toString()}`;
    }

    const { data } = await axiosInstance({
      url: requestUrl,
      method,
      data: payload,
      headers,
    });

    return { data };
  },

  // GET many (for relationships)
  getMany: async ({ resource, ids }) => {
    const promises = ids.map((id) => axiosInstance.get(`/${resource}/${id}`));
    const responses = await Promise.all(promises);
    return { data: responses.map((res) => res.data) };
  },

  // Not implemented (optional)
  createMany: async () => {
    throw new Error('createMany not implemented');
  },

  deleteMany: async () => {
    throw new Error('deleteMany not implemented');
  },

  updateMany: async () => {
    throw new Error('updateMany not implemented');
  },
};
