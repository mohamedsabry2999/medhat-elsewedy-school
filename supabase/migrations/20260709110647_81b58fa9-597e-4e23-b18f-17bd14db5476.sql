
-- Gallery images: focal point + crop mode
ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS focal_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS focal_y numeric NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS mobile_focal_x numeric,
  ADD COLUMN IF NOT EXISTS mobile_focal_y numeric,
  ADD COLUMN IF NOT EXISTS image_type text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS crop_mode text NOT NULL DEFAULT 'cover';

-- Media assets: add missing fields (focal_x/focal_y already exist)
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS mobile_focal_x numeric,
  ADD COLUMN IF NOT EXISTS mobile_focal_y numeric,
  ADD COLUMN IF NOT EXISTS image_type text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS crop_mode text NOT NULL DEFAULT 'cover';

-- Backfill: student photos → safer head-room defaults
UPDATE public.gallery_images
  SET focal_y = 25
  WHERE category = 'صور الطلاب' AND focal_y = 30;

UPDATE public.media_assets
  SET focal_y = 25, image_type = 'student_portrait', crop_mode = 'cover'
  WHERE category = 'صور الطلاب' AND image_type = 'auto';

UPDATE public.media_assets
  SET image_type = 'logo', crop_mode = 'contain'
  WHERE display_position IN ('Footer Logo','Certificate Logo') AND image_type = 'auto';
