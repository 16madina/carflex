-- Create test drive requests table
CREATE TABLE IF NOT EXISTS public.test_drive_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rental')),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_test_drive_requests_requester ON public.test_drive_requests(requester_id);
CREATE INDEX idx_test_drive_requests_seller ON public.test_drive_requests(seller_id);
CREATE INDEX idx_test_drive_requests_listing ON public.test_drive_requests(listing_id);
CREATE INDEX idx_test_drive_requests_status ON public.test_drive_requests(status);

-- Add updated_at trigger
CREATE TRIGGER update_test_drive_requests_updated_at
  BEFORE UPDATE ON public.test_drive_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.test_drive_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create test drive requests"
  ON public.test_drive_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own requests"
  ON public.test_drive_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE POLICY "Sellers can view requests for their listings"
  ON public.test_drive_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update requests for their listings"
  ON public.test_drive_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Requesters can cancel their own requests"
  ON public.test_drive_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');