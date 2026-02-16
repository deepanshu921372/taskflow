import { apiSlice } from '../../services/apiSlice';

export const boardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: (params) => ({
        url: '/boards',
        params,
      }),
      providesTags: ['Boards'],
    }),
    getBoard: builder.query({
      query: (id) => `/boards/${id}`,
      providesTags: (result, error, id) => [{ type: 'Board', id }],
    }),
    createBoard: builder.mutation({
      query: (data) => ({
        url: '/boards',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Boards'],
    }),
    updateBoard: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/boards/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Boards', { type: 'Board', id }],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Boards'],
    }),
    addMember: builder.mutation({
      query: ({ boardId, email }) => ({
        url: `/boards/${boardId}/members`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
    removeMember: builder.mutation({
      query: ({ boardId, userId }) => ({
        url: `/boards/${boardId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = boardApi;
