
-- Fix the crawl_status check constraint to allow all valid status values
ALTER TABLE public.website_maps DROP CONSTRAINT IF EXISTS website_maps_crawl_status_check;

ALTER TABLE public.website_maps ADD CONSTRAINT website_maps_crawl_status_check 
CHECK (crawl_status IN ('pending', 'crawling', 'completed', 'failed'));
