const cloudinary  = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Stockage pour les couvertures de livres
const bookStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'bibliotheque/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 400, height: 550, crop: 'fill' }],
  },
});

// Stockage pour les avatars / images de bibliothèque
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'bibliotheque/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 400, height: 400, crop: 'fill' }],
  },
});

const uploadBook    = multer({ storage: bookStorage });
const uploadProfile = multer({ storage: profileStorage });

module.exports = { cloudinary, uploadBook, uploadProfile };
