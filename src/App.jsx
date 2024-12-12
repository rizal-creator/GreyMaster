import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function ImageEditor() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [config, setConfig] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    resolution: 'HD',
    format: 'PNG',
    quality: 0.9
  });

  const [imageInfo, setImageInfo] = useState({
    originalSize: null,
    processedSize: null,
    fileType: null
  });

  const loadImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImage(img);
        setImageInfo({
          originalSize: `${img.width} x ${img.height}`,
          fileType: file.type,
          processedSize: null
        });
        processImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processImage = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const resolutions = {
      'SD': { width: 640, height: 480 },
      'HD': { width: 1280, height: 720 },
      'FULL HD': { width: 1920, height: 1080 }
    };

    const currentResolution = resolutions[config.resolution];
    canvas.width = currentResolution.width;
    canvas.height = currentResolution.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.filter = `
      brightness(${config.brightness}%) 
      contrast(${config.contrast}%) 
      saturate(${config.saturation}%) 
      blur(${config.blur}px)
    `;

    ctx.drawImage(img, 0, 0, currentResolution.width, currentResolution.height);

    setImageInfo(prev => ({
      ...prev,
      processedSize: `${currentResolution.width} x ${currentResolution.height}`
    }));
  };

  useEffect(() => {
    if (image) {
      processImage(image);
    }
  }, [config, image]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    const fileName = `edited_image_${config.resolution}.${config.format.toLowerCase()}`;
    const dataUrl = canvas.toDataURL(`image/${config.format.toLowerCase()}`, config.quality);
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  };

  const resetImage = () => {
    if (originalImage) {
      setImage(originalImage);
      setConfig({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        resolution: 'HD',
        format: 'PNG',
        quality: 0.9
      });
    }
  };

  return (
    <div className="container">
      <h1>Professional Image Editor</h1>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={loadImage}
        className="file-input"
      />

      {image && (
        <div className="editor-container">
          <div className="controls">
            <div className="control">
              <label>Brightness</label>
              <input
                type="range"
                min="0"
                max="200"
                value={config.brightness}
                onChange={(e) => updateConfig('brightness', e.target.value)}
              />
              <span>{config.brightness}%</span>
            </div>

            <div className="control">
              <label>Contrast</label>
              <input
                type="range"
                min="0"
                max="200"
                value={config.contrast}
                onChange={(e) => updateConfig('contrast', e.target.value)}
              />
              <span>{config.contrast}%</span>
            </div>

            <div className="control">
              <label>Color Saturation</label>
              <input
                type="range"
                min="0"
                max="200"
                value={config.saturation}
                onChange={(e) => updateConfig('saturation', e.target.value)}
              />
              <span>{config.saturation}%</span>
            </div>

            <div className="control">
              <label>Blur</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={config.blur}
                onChange={(e) => updateConfig('blur', e.target.value)}
              />
              <span>{config.blur}px</span>
            </div>

            <div className="control">
              <label>Image Resolution</label>
              <select
                value={config.resolution}
                onChange={(e) => updateConfig('resolution', e.target.value)}
              >
                <option value="SD">SD (640x480)</option>
                <option value="HD">HD (1280x720)</option>
                <option value="FULL HD">Full HD (1920x1080)</option>
              </select>
            </div>

            <div className="control">
              <label>Image Format</label>
              <select
                value={config.format}
                onChange={(e) => updateConfig('format', e.target.value)}
              >
                <option value="PNG">PNG</option>
                <option value="JPEG">JPEG</option>
                <option value="WEBP">WebP</option>
              </select>
            </div>

            <div className="control">
              <label>Compression Quality</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={config.quality}
                onChange={(e) => updateConfig('quality', e.target.value)}
              />
              <span>{(config.quality * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="preview-section">
            <canvas
              ref={canvasRef}
              className="preview"
            />

            <div className="image-info">
              <p>Original Resolution: {imageInfo.originalSize}</p>
              <p>Processed Resolution: {imageInfo.processedSize}</p>
              <p>File Type: {imageInfo.fileType}</p>
            </div>

            <div className="actions">
              <button onClick={saveImage} className="save-button">
                Save Image
              </button>
              <button onClick={resetImage} className="reset-button">
                Reset Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;