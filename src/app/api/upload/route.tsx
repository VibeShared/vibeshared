import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '@/lib/cloudinary';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { data } = req.body; // base64 file
      
      if (!data || typeof data !== 'string') {
        return res.status(400).json({ error: "Invalid file data" });
      }

      const uploadResponse = await cloudinary.uploader.upload(data, {
        folder: "social_app",
        resource_type: "auto", // handles image/video
      });

      return res.status(200).json({ url: uploadResponse.secure_url });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  }
  
  // Handle other HTTP methods
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}