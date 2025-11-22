"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  FileArchive,
  Check,
  Loader,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

// --- TYPE DEFINITIONS ---

// Define the structure for an image file object
interface ImageFile {
  file: File;
  id: string;
  name: string;
  type: string;
  preview: string;
  skip: boolean;
  relativePath: string;
}

// Define the structure for the progress state
interface Progress {
  current: number;
  total: number;
}

// Define the structure for the props of FileTypeIcon component
type FileTypeIconProps = {
  type?: string; // Type is optional
};

// Extend the Window interface to include JSZip
declare global {
  interface Window {
    JSZip: any; // You could define more specific types for JSZip if needed
  }
}

// --- COMPONENTS ---

// A simple component for file type icons with a new color scheme
const FileTypeIcon: React.FC<FileTypeIconProps> = ({ type = '' }) => {
  const upperType = type.toUpperCase();
  let bgColor = "bg-slate-200";
  let textColor = "text-slate-600";
  if (upperType.includes("PNG")) {
    bgColor = "bg-teal-600";
    textColor = "text-white";
  }
  if (upperType.includes("JPG") || upperType.includes("JPEG")) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-800";
  }
  if (upperType.includes("WEBP")) {
    bgColor = "bg-emerald-100";
    textColor = "text-emerald-800";
  }
  if (upperType.includes("GIF")) {
    bgColor = "bg-violet-100";
    textColor = "text-violet-800";
  }

  return (
    <div
      className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${bgColor} ${textColor}`}
    >
      {upperType.slice(0, 4)}
    </div>
  );
};

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Select a folder to start."
  );
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0 });
  const [zipReady, setZipReady] = useState<boolean>(false);

  // Effect to load the JSZip library from a CDN
  useEffect(() => {
    if (document.getElementById("jszip-script")) {
      setZipReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "jszip-script";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    script.onload = () => setZipReady(true);
    script.onerror = () =>
      setStatusMessage(
        "Error: Could not load ZIP functionality. Please refresh."
      );
    document.body.appendChild(script);
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      setStatusMessage("No image files found.");
      return;
    }
    const newImages: ImageFile[] = imageFiles.map((file) => ({
      file,
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      type: file.name.split(".").pop() || "unknown",
      preview: URL.createObjectURL(file),
      skip: false,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setStatusMessage(
      `${newImages.length} image(s) loaded. Ready to generate placeholders.`
    );
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        processFiles(event.target.files);
    }
  };
  
  const handleSkipToggle = (id: string) =>
    setImages((imgs) =>
      imgs.map((img) => (img.id === id ? { ...img, skip: !img.skip } : img))
    );

  const handleToggleAllSkip = () => {
    const allSkipped = images.length > 0 && images.every((img) => img.skip);
    setImages((imgs) => imgs.map((img) => ({ ...img, skip: !allSkipped })));
  };

  const handleClearQueue = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    setImages([]);
    setStatusMessage("Queue cleared. Select or drop a folder to start.");
  };

  // Main placeholder generation and zipping logic
  const handleGenerateAndZip = async () => {
    if (!zipReady || typeof window.JSZip === "undefined") {
      setStatusMessage("ZIP library is not ready. Please wait or refresh.");
      return;
    }

    const imagesToProcess = images.filter((img) => !img.skip);
    const imagesToSkip = images.filter((img) => img.skip);

    if (imagesToProcess.length === 0 && imagesToSkip.length === 0) {
      setStatusMessage("No images in the queue to process.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Initializing...");
    const zip = new window.JSZip();
    const totalOperations = imagesToProcess.length + imagesToSkip.length;
    setProgress({ current: 0, total: totalOperations });

    for (const image of imagesToProcess) {
      try {
        const { path, blob } = await createPlaceholderBlob(image);
        zip.file(path, blob);
      } catch (error) {
        console.error(
          `Placeholder generation failed for ${image.name}:`,
          error
        );
      } finally {
        setProgress((p) => ({ ...p, current: p.current + 1 }));
      }
    }

    for (const image of imagesToSkip) {
      zip.file(image.relativePath, image.file);
      setProgress((p) => ({ ...p, current: p.current + 1 }));
    }

    setStatusMessage("Generating ZIP file... This may take a moment.");
    try {
      const zipBlob = await zip.generateAsync({
        type: "blob",
        onUpdate: (meta: { percent: number }) => {
          setStatusMessage(`Compressing... ${meta.percent.toFixed(0)}%`);
        },
      });
      downloadFile(zipBlob, "placeholder-images.zip");
      setStatusMessage(`Process complete! ZIP file downloaded.`);
    } catch (error) {
      console.error("ZIP generation failed:", error);
      setStatusMessage("Error: Could not generate the ZIP file.");
    }
    setIsGenerating(false);
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Function to create a placeholder image blob with the new color scheme
  const createPlaceholderBlob = (image: ImageFile): Promise<{ path: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = image.preview;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return reject(new Error("Failed to get canvas context."));
        }

        // Fill background with a soft cyan
        ctx.fillStyle = "#bcbcbc"; // equivalent to cyan-100
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Prepare text with a dark teal
        const text = `${canvas.width} x ${canvas.height}`;
        const fontSize = Math.max(
          14,
          Math.min(canvas.width / 10, canvas.height / 5, 100)
        );
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = "#000"; // equivalent to teal-800
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        canvas.toBlob((blob) => {
          if (!blob)
            return reject(new Error("Canvas to Blob conversion failed."));
          resolve({ path: image.relativePath, blob });
        }, "image/png");
      };
      img.onerror = (err) => reject(err);
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center font-sans p-4 text-slate-800">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
        <header className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <ImageIcon className="mr-3 text-teal-600" size={32} />
            Placeholder Generator
          </h1>
          <p className="text-slate-500 mt-1">
            Create placeholder images from a folder of real images.
          </p>
        </header>

        <main className="p-6">
          {images.length === 0 ? (
            <div className="text-center border-2 border-dashed border-slate-300 rounded-xl p-12">
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-lg font-medium text-slate-800">
                  Select Image Folder
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  or drag and drop it here
                </p>
                <span className="mt-4 inline-block bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-teal-700 transition-colors">
                  Browse Files
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                // The 'webkitdirectory' and 'directory' attributes are non-standard but widely supported for folder selection.
                // We cast to 'any' to avoid TypeScript errors for these attributes.
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-lg mb-3">Instructions</h3>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p>
                      1. Images in the queue will be converted to placeholders.
                    </p>
                    <p>2. Use the 'Skip' checkbox to keep an original image.</p>
                    <p>
                      3. Click 'Generate & ZIP' to download the final package.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
                  <h3 className="font-bold text-lg mb-2">Ready to Go?</h3>
                  <button
                    onClick={handleGenerateAndZip}
                    disabled={isGenerating || images.length === 0 || !zipReady}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-teal-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                  >
                    {isGenerating ? (
                      <Loader className="animate-spin mr-2" />
                    ) : (
                      <FileArchive className="mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Generate & Create ZIP"}
                  </button>
                  <p className="text-xs text-slate-500 mt-2 text-center h-4">
                    {statusMessage}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">
                    Image Queue ({images.length})
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mr-2"
                        checked={
                          images.length > 0 && images.every((img) => img.skip)
                        }
                        onChange={handleToggleAllSkip}
                      />
                      Skip All
                    </label>
                    <button
                      onClick={handleClearQueue}
                      className="flex items-center text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Clear
                    </button>
                  </div>
                </div>
                <div className="max-h-[40vh] overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50">
                  <ul className="space-y-2">
                    {images.map((image) => (
                      <li
                        key={image.id}
                        className={`flex items-center p-3 rounded-lg transition-opacity ${
                          image.skip
                            ? "opacity-50 bg-slate-100"
                            : "bg-white shadow-sm"
                        }`}
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-12 h-12 rounded-md object-cover mr-4"
                        />
                        <div className="flex-grow min-w-0">
                          <p
                            className="font-semibold text-sm truncate text-slate-800"
                            title={image.relativePath}
                          >
                            {image.relativePath}
                          </p>
                          <p className="text-xs text-slate-500">
                            {image.type.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center ml-4">
                          <FileTypeIcon type={image.type} />
                          <label
                            htmlFor={`skip-${image.id}`}
                            className="ml-4 flex items-center cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900"
                          >
                            <input
                              id={`skip-${image.id}`}
                              type="checkbox"
                              checked={image.skip}
                              onChange={() => handleSkipToggle(image.id)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mr-2"
                            />
                            Skip
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {isGenerating && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-teal-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          progress.total > 0
                            ? (progress.current / progress.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-center text-sm mt-1 text-slate-600">{`Processing ${progress.current} of ${progress.total}`}</p>
                </div>
              )}
            </div>
          )}
        </main>
        <footer className="text-center p-4 text-xs text-slate-500 border-t border-slate-200">
          <p>
            Built with React & JSZip. All processing is done in your browser.
          </p>
        </footer>
      </div>
    </div>
  );
}
