-- Allow users to insert their own initial 'user' role during signup
CREATE POLICY "Users can insert their own user role on signup"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'user');