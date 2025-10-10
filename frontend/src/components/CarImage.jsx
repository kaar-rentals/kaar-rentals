import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";

export default function CarImage({ srcUrl }) {
  // srcUrl expected to be the full Cloudinary secure_url (e.g. https://res.cloudinary.com/<cloud>/image/upload/...)
  // If srcUrl is a Cloudinary delivery URL we can simply render it via <img> fallback.
  if (!srcUrl) return null;

  // If it's a cloudinary public id format do the optimized render; otherwise fallback to img
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    // attempt to extract public ID normally if needed; but safest is to use <img> for arbitrary URLs
    const isCloudinary = srcUrl.includes(`res.cloudinary.com/${cloudName}`);
    if (!isCloudinary) return <img src={srcUrl} alt="car" style={{width:"100%", height:"auto"}} />;

    // build from full url by extracting public id after /upload/
    const parts = srcUrl.split("/upload/");
    const publicId = parts[1] || parts[0];
    const cld = new Cloudinary({ cloud: { cloudName } });
    const img = cld.image(publicId).resize(fill().width(600).height(400)).format("auto").quality("auto");
    return <AdvancedImage cldImg={img} />;
  } catch (err) {
    return <img src={srcUrl} alt="car" style={{width:"100%", height:"auto"}} />;
  }
}


