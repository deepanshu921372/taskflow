import { apiSlice } from '../../services/apiSlice';

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: ({ listId, ...data }) => ({
        url: `/lists/${listId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Board'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Board'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board'],
    }),
    moveTask: builder.mutation({
      query: ({ id, targetListId, position }) => ({
        url: `/tasks/${id}/move`,
        method: 'PATCH',
        body: { targetListId, position },
      }),
      invalidatesTags: ['Board'],
    }),
    assignUser: builder.mutation({
      query: ({ taskId, userId }) => ({
        url: `/tasks/${taskId}/assign`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['Board'],
    }),
    unassignUser: builder.mutation({
      query: ({ taskId, userId }) => ({
        url: `/tasks/${taskId}/assign/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board'],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useAssignUserMutation,
  useUnassignUserMutation,
} = taskApi;
