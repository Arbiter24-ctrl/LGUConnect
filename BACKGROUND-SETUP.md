# Background Image Setup Instructions

## To add the building background image to your landing page:

1. **Save the image file:**
   - Save the building image as `building-background.jpg`
   - Place it in the `public/` folder of your project
   - The file path should be: `public/building-background.jpg`

2. **Image specifications:**
   - Recommended size: 1920x1080 pixels or larger
   - Format: JPG or PNG
   - File name: `building-background.jpg`

3. **The landing page is already configured to use this image:**
   - Background image is set to cover the full page
   - Fixed attachment for parallax effect
   - Dark overlay (40% opacity) for text readability
   - All text and cards have been updated for better contrast

## Current Implementation:

The landing page now has:
- ✅ Full-screen background image
- ✅ Dark overlay for text readability
- ✅ Glass-morphism effect on cards (white/90 with backdrop blur)
- ✅ White text with drop shadows for better visibility
- ✅ Parallax scrolling effect
- ✅ Responsive design

## Alternative Image Names:

If you want to use a different filename, update line 14 in `app/page.jsx`:
```javascript
backgroundImage: "url('/your-image-name.jpg')",
```

The background will automatically apply once you add the image file to the public folder!
