-- Add listing_type column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS listing_type TEXT CHECK (listing_type IN ('sale', 'rental'));

-- Drop the old foreign key constraint if it exists
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_listing_id_fkey;

-- Update existing conversations to have listing_type = 'sale' by default
UPDATE conversations 
SET listing_type = 'sale' 
WHERE listing_type IS NULL;

-- Make listing_type NOT NULL after setting defaults
ALTER TABLE conversations 
ALTER COLUMN listing_type SET NOT NULL;

-- Add a unique constraint to prevent duplicate conversations
CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_per_listing 
ON conversations(participant1_id, participant2_id, listing_id, listing_type)
WHERE listing_id IS NOT NULL;