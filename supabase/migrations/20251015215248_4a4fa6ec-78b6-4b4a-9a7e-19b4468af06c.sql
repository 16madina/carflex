-- Add missing foreign key constraints to rental_bookings table
ALTER TABLE public.rental_bookings
ADD CONSTRAINT rental_bookings_renter_id_fkey 
FOREIGN KEY (renter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.rental_bookings
ADD CONSTRAINT rental_bookings_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;