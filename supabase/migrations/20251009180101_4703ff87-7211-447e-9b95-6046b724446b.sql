-- Make seller_id nullable to allow demo data
ALTER TABLE sale_listings ALTER COLUMN seller_id DROP NOT NULL;