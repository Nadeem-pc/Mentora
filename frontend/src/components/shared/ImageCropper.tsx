import React, { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        
        ctx?.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
            onCropComplete(file);
          }
        }, "image/jpeg", 0.8); 
      };
      
      img.src = image;
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  }, [image, croppedAreaPixels, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center z-50">
      <div className="relative w-96 h-96 bg-white rounded-lg shadow-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1} 
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteHandler}
        />
      </div>
      
      <div className="mt-2 flex items-center space-x-4">
        <span className="text-white text-sm">Zoom:</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-32"
        />
      </div>
      
      <div className="mt-4 flex space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveCrop}
          disabled={!croppedAreaPixels}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;