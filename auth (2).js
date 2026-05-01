# ================================
# Mobile Ads Van — Environment Config
# ================================

PORT=5000
NODE_ENV=development

# JWT Secret — change this in production!
JWT_SECRET=mobileadsvan_secret_key_2025_change_me

# Admin credentials — change these!
ADMIN_USERNAME=mobileadsvan
ADMIN_PASSWORD=admin@2025
ADMIN_EMAIL=soumomazumdar292@gmail.com

# Upload limits
MAX_FILE_SIZE_MB=20
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
ALLOWED_VIDEO_TYPES=mp4,mov,avi,mkv

# Business info
BUSINESS_NAME=Mobile Ads Van
BUSINESS_PHONE=9836788726
BUSINESS_EMAIL=soumomazumdar292@gmail.com
BUSINESS_LOCATION=Kolkata, West Bengal, India
WHATSAPP_NUMBER=919836788726

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
