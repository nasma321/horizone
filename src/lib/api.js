import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = "http://localhost:8001";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/`,
    prepareHeaders: async (headers, { getState }) => {
      const token = await window?.Clerk?.session?.getToken();
      console.log(token);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  tagTypes: ["Hotel", "Booking"],
  endpoints: (builder) => ({
    getHotels: builder.query({
      query: () => "hotels",
      providesTags: ["Hotel"],
    }),
    getHotelsForSearchQuery: builder.query({
      query: ({query}) => `hotels/search/retrieve?query=${query}`,
      providesTags: ["Hotel"],
    }),
    getHotelById: builder.query({
      query: (id) => `hotels/${id}`,
      providesTags: (result, error, id) => [{ type: "Hotel", id }],
    }),
    createHotel: builder.mutation({
      query: (hotel) => ({
        url: "hotels",
        method: "POST",
        body: hotel,
      }),
      invalidatesTags: ["Hotel"],
    }),
    createBooking: builder.mutation({
      query: (booking) => ({
        url: "bookings",
        method: "POST",
        body: booking,
      }),
      invalidatesTags: ["Booking"],
    }),
    getUserBookings: builder.query({
      query: (userId) => `bookings/user/${userId}`,
      providesTags: ["Booking"],
    }),
    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const { 
  useGetHotelsQuery, 
  useGetHotelsForSearchQueryQuery, 
  useGetHotelByIdQuery, 
  useCreateHotelMutation, 
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useCancelBookingMutation 
} = api;