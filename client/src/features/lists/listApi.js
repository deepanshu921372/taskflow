import { apiSlice } from '../../services/apiSlice';

export const listApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createList: builder.mutation({
      query: ({ boardId, title }) => ({
        url: `/boards/${boardId}/lists`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
    updateList: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/lists/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Board'],
    }),
    deleteList: builder.mutation({
      query: (id) => ({
        url: `/lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board'],
    }),
    reorderLists: builder.mutation({
      query: ({ boardId, listIds }) => ({
        url: '/lists/reorder',
        method: 'PATCH',
        body: { boardId, listIds },
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
  }),
});

export const {
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useReorderListsMutation,
} = listApi;
