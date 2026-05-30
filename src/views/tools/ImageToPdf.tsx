'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, Trash2, ArrowUp, ArrowDown, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import SEO from '../../components/SEO';
import { Logo } from '../../components/Logo';

interface ImageToPdfProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
}

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://bloomport.fun"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://bloomport.fun/tools/image-to-pdf"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Image to PDF",
      "item": "https://bloomport.fun/tools/image-to-pdf"
    }
  ]
};

type CompressionLevel = 'original' | 'medium' | 'high';

export default function ImageToPdf({ onNavigateHome, onNavigateApp }: ImageToPdfProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compression, setCompression] = useState<CompressionLevel>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, quality: number, maxWidth = 1920): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              blob.arrayBuffer().then(resolve).catch(reject);
            } else {
              reject('Canvas to Blob failed');
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    });
  };

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file)
        });
      }
    });
    
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;
    
    setImages((prev) => {
      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      return newImages;
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const img of images) {
        let arrayBuffer: ArrayBuffer;
        let isJpeg = img.file.type === 'image/jpeg';
        
        if (compression === 'original') {
          arrayBuffer = await img.file.arrayBuffer();
        } else {
          // Always convert to JPEG for compression
          const quality = compression === 'high' ? 0.4 : 0.7;
          const maxWidth = compression === 'high' ? 1200 : 1920;
          arrayBuffer = await compressImage(img.file, quality, maxWidth);
          isJpeg = true;
        }
        
        let pdfImage;
        if (isJpeg) {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (img.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        }
        
        if (pdfImage) {
          const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: pdfImage.width,
            height: pdfImage.height,
          });
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bloomport-images-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="Image to PDF Converter — Free Online Tool"
        description="Convert multiple JPG and PNG images into a single PDF document easily directly in your browser. Fast, secure, and free."
        path="/tools/image-to-pdf"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <button onClick={onNavigateHome} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer" aria-label="Back to home">
          <ArrowLeft className="w-4 h-4" />
          <Logo className="h-5 w-auto" variant="dark" />
        </button>
        <button onClick={onNavigateApp} className="text-xs font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer">
          Try Bloomport AI
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Image to PDF</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Combine multiple JPG or PNG images into a single PDF file instantly. Files are processed locally on your device for complete privacy.
          </p>
        </div>

        {/* Upload Area */}
        <div 
          className={`w-full p-8 md:p-12 rounded-3xl border-2 border-dashed transition-all mb-8 ${isDragging ? 'border-white bg-white/10' : 'border-white/20 bg-white/[0.02] hover:border-white/40'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-white/10 rounded-full mb-4">
              <Upload className="w-8 h-8 text-white/80" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Drag and drop your images here</h3>
            <p className="text-white/50 text-sm mb-6">Supports JPG and PNG up to any size.</p>
            <input 
              type="file" 
              multiple 
              accept="image/jpeg, image/png"
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl text-sm hover:bg-white/90 transition-all active:scale-95 cursor-pointer"
            >
              Select Images
            </button>
          </div>
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-white/70" />
                Selected Images ({images.length})
              </h3>
              <button 
                onClick={() => setImages([])}
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
            
            <div className="space-y-3">
              {images.map((img, index) => (
                <div key={img.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/[0.03] group">
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <img src={img.previewUrl} alt={img.file.name} className="w-12 h-12 object-cover rounded-lg bg-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.file.name}</p>
                      <p className="text-xs text-white/50">{(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg cursor-pointer"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {images.length > 0 && (
          <div className="w-full flex flex-col items-center mt-4">
            <div className="flex flex-col items-center mb-8">
              <label className="text-sm text-white/70 mb-3 font-medium">PDF Quality (Compression)</label>
              <div className="flex bg-white/10 p-1.5 rounded-2xl">
                {(['original', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCompression(level)}
                    className={`px-5 py-2.5 text-sm rounded-xl capitalize transition-all cursor-pointer ${
                      compression === level
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/10 font-medium'
                    }`}
                  >
                    {level === 'original' ? 'Original (Best)' : level === 'medium' ? 'Medium (< 5MB)' : 'High (< 2MB)'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full flex justify-center">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-white text-black font-semibold text-base px-8 py-4 rounded-2xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
        )}

        <p className="text-white/20 text-xs mt-16 text-center">© {new Date().getFullYear()} Bloomport · Client-side processing · No data collected</p>
      </main>
    </div>
  );
}
