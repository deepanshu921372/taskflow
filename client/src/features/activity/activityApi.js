import { apiSlice } from '../../services/apiSlice';

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: ({ boardId, page = 1, limit = 20 }) => ({
        url: `/boards/${boardId}/activities`,
        params: { page, limit },
      }),
      providesTags: (result, error, { boardId }) => [{ type: 'Activity', id: boardId }],
    }),
  }),
});

export const { useGetActivitiesQuery } = activityApi;
