interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  access_mode: string;
  original_filename: string;
}

const uploadFile = async (file: File): Promise<CloudinaryResponse> => {
  const CLOUDINARY_CLOUD_NAME = 'ditlqtrei';
  

  
  const uploadPreset = 'chat_app'; 

  

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Upload failed:', errorData);
    throw new Error('Failed to upload file');
  }

  const responseData: CloudinaryResponse = await response.json();
  return responseData;
};

export default uploadFile;
