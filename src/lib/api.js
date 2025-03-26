import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = "http://localhost:8001";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/`,
    prepareHeaders: async (headers, { getState }) => {
      const token = await window?.Clerk?.session?.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  tagTypes: ['Hotel', 'Booking'],
  endpoints: (builder) => ({
    getHotels: builder.query({
      query: (params = {}) => {
        const { location, sortBy, order } = params;
        let queryString = '';
        
        if (location) {
          queryString += `location=${encodeURIComponent(location)}&`;
        }
        
        if (sortBy) {
          queryString += `sortBy=${sortBy}&`;
        }
        
        if (order) {
          queryString += `order=${order}`;
        }
        
        return `hotels${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Hotel']
    }),
    getHotelLocations: builder.query({
      query: () => "hotels/locations",
    }),
    getHotelsForSearchQuery: builder.query({
      query: ({query}) => `hotels/search/retrieve?query=${query}`,
    }),
    getHotelById: builder.query({
      query: (id) => `hotels/${id}`,
      providesTags: (result, error, id) => [{ type: 'Hotel', id }]
    }),
    createHotel: builder.mutation({
      query: (hotel) => ({
        url: "hotels",
        method: "POST",
        body: hotel,
      }),
      invalidatesTags: ['Hotel']
    }),
    
    createBooking: builder.mutation({
      query: (booking) => ({
        url: "bookings",
        method: "POST",
        body: booking,
      }),
      invalidatesTags: ['Booking']
    }),
    getUserBookings: builder.query({
      query: () => "bookings/user",
      providesTags: ['Booking']
    }),
    getBookingById: builder.query({
      query: (id) => `bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }]
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `bookings/${id}/cancel`,
        method: "PUT"
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Booking', id },
        'Booking'
      ]
    }),
    getAllBookings: builder.query({
      query: () => "bookings/admin/all",
      providesTags: ['Booking']
    }),
    getHotelBookings: builder.query({
      query: (hotelId) => `bookings/admin/hotel/${hotelId}`,
      providesTags: (result, error, hotelId) => [
        { type: 'Booking', id: `hotel-${hotelId}` },
        'Booking'
      ]
    })
  }),
});

export const { 
  useGetHotelsQuery, 
  useGetHotelLocationsQuery,
  useGetHotelsForSearchQueryQuery, 
  useGetHotelByIdQuery, 
  useCreateHotelMutation,
  
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  
  useGetAllBookingsQuery,
  useGetHotelBookingsQuery
} = api;