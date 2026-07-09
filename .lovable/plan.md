## نظام مكتبة الصور والوسائط - خطة التنفيذ

سأبني نظام media library كامل مربوط بـ Supabase Storage + جدول `media_assets`، مع محرر صور، ونقاط تركيز، وربط ديناميكي بصفحات الموقع.

## المرحلة 1 — البنية التحتية (Database + Storage)

1. **Supabase Storage bucket** جديد باسم `media` (public read).
2. **جدول `media_assets`** بالحقول:
   - `id`, `title`, `description`, `alt_text`, `caption`
   - `image_url`, `thumbnail_url`, `storage_path`
   - `category` (نص من قائمة معرّفة)
   - `status` (`published` / `hidden` / `archived`)
   - `usage_locations` (text[]) — أماكن ظهور متعددة
   - `display_position` (نص واحد — الدور المحدد)
   - `focal_x`, `focal_y` (0-100)
   - `aspect_ratio` (نص، مثل `16/9`)
   - `crop_settings` (jsonb)
   - `width`, `height`, `file_size`, `mime_type`
   - `sort_order`, `created_at`, `updated_at`
3. RLS: قراءة عامة للصور المنشورة، كتابة للأدمن فقط.
4. GRANTs + Realtime.

## المرحلة 2 — الـ Store والـ Functions

- `src/lib/media-store.ts`: قراءة/كتابة/رفع/حذف مع realtime subscription.
- `src/lib/media-upload.ts`: رفع للـ Storage + إنشاء thumbnail (client-side canvas resize).
- ثوابت `MEDIA_CATEGORIES`, `USAGE_LOCATIONS`, `DISPLAY_POSITIONS`, `SIZE_PRESETS`.

## المرحلة 3 — واجهة مكتبة الصور في لوحة التحكم

قسم جديد في Sidebar باسم "مكتبة الصور":
- **Grid** بالصور مع preview، اسم، تصنيف، حالة، أماكن ظهور.
- **بحث + فلاتر**: تصنيف، مكان ظهور، حالة (منشورة/مخفية/غير مستخدمة).
- **زر رفع** يفتح Dialog:
  - اختيار ملف
  - عنوان + Alt Text (إلزامي للمنشورة) + وصف
  - تصنيف
  - Multi-select لأماكن الظهور
  - Display Position
  - اقتراح مقاس تلقائي حسب المكان
  - محرر Focal Point (مكوّن موجود بالفعل)
- **Modal تفاصيل** لكل صورة: تعديل جميع الحقول + قص + focal point + إخفاء/نشر/حذف.
- **محرر صور**: crop + aspect ratio presets + focal point + rotate باستخدام `react-easy-crop`.

## المرحلة 4 — ربط الموقع العام

- **Articles**: في محرر المقال أضف زر "اختر من مكتبة الصور" بجانب الرفع، مع Dialog يعرض صور مصنفة `الأخبار` أو أي صورة.
- **Gallery**: `usePublishedGallery` تقرأ صور مكتبة الوسائط ذات `display_position = "Gallery Item"` (+ الجدول القديم للتوافق).
- **Hero**: hook `useHeroImages()` يقرأ من `display_position IN ('Hero Main Image', 'Hero Background')`. Fallback للصور الحالية إذا فارغ.
- **Certificate Logos / Branch Images**: hooks مشابهة.
- الصفحات العامة تستخدم `object-fit: cover` + `object-position` من focal point، أو `contain` للشعارات.

## المرحلة 5 — الاختبار

- رفع صورة، تعيينها كـ Hero، التحقق من ظهورها.
- إخفاء صورة، التحقق من اختفائها.
- تعديل Alt Text وانعكاسه.
- Responsive على 320/768/1280.

## Technical Details

- استخدام `react-easy-crop` لمحرر القص (خفيف ومتوافق).
- Thumbnail: canvas يعمل resize لعرض 400px قبل الرفع.
- Storage path: `media/{uuid}-{filename}` + `media/thumbs/{uuid}.jpg`.
- Realtime channel واحد على `media_assets`.
- التوافق مع النظام الحالي: `gallery_images` و `articles.image` تبقى تعمل؛ الصور الجديدة من `media_assets` تُدمج معها.

## نطاق محدود عمدًا

لن يشمل هذا الإصدار:
- `media_usages` كجدول منفصل (سنعتمد على `usage_locations` array — أبسط وكافٍ للحالات المطلوبة).
- Drag & Drop للترتيب (سنستخدم حقل رقمي `sort_order`).
- Flip/Rotate كامل (Rotate فقط بزوايا 90°).

هذه ميزات ثانوية يمكن إضافتها لاحقًا. الأولوية للنظام الأساسي المتين.
