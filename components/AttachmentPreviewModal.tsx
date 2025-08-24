import React, { useState, useEffect, useRef } from 'react';
import { Attachment } from '../types';
import { getFile } from '../db';
import { XIcon } from './icons/XIcon';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PageViewport } from 'pdfjs-dist';

// Setting up the worker for pdf.js is crucial for rendering.
// We point to a stable version of the worker script from a CDN.
GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

interface AttachmentPreviewModalProps {
  attachment: Attachment;
  onClose: () => void;
}

// --- Icon Components ---
const ZoomInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
);
const ZoomOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" /></svg>
);
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
);
const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
);
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);

const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ attachment, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadAttachment = async () => {
    try {
        const fileBlob = await getFile(attachment.id);
        if (fileBlob) {
            const url = URL.createObjectURL(fileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
             setError('No se pudo encontrar el archivo para descargar.');
        }
    } catch (err) {
        console.error("Failed to download file", err);
        setError('Error al descargar el archivo.');
    }
  };


  // Effect to load the file from IndexedDB
  useEffect(() => {
    let objectUrl: string | null = null;
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setPdfDoc(null);
    setPageNum(1);

    const loadFile = async () => {
      try {
        const fileBlob = await getFile(attachment.id);
        if (!fileBlob) {
          setError('No se pudo encontrar el archivo adjunto.');
          setIsLoading(false);
          return;
        }

        if (attachment.type === 'application/pdf') {
          const typedArray = new Uint8Array(await fileBlob.arrayBuffer());
          const loadingTask = getDocument(typedArray);
          const loadedPdf = await loadingTask.promise;
          setPdfDoc(loadedPdf);
          setNumPages(loadedPdf.numPages);
        } else if (attachment.type.startsWith('image/')) {
          objectUrl = URL.createObjectURL(fileBlob);
          setImageUrl(objectUrl);
        } else {
            setError('No hay previsualización disponible para este tipo de archivo.');
        }
      } catch (err) {
        console.error('Error loading file for preview:', err);
        setError('Error al cargar el archivo para la previsualización.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment.id, attachment.type]);

  // Effect to render a PDF page when state changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    
    let isCancelled = false;
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const viewport: PageViewport = page.getViewport({ scale: zoomLevel });
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext as any).promise;
          }
      } catch (e) {
        if (!isCancelled) {
            console.error("Error rendering PDF page", e);
            setError("No se pudo renderizar la página del PDF.");
        }
      }
    };
    
    renderPage();

    return () => { isCancelled = true; };
  }, [pdfDoc, pageNum, zoomLevel]);

  // --- PDF Control Handlers ---
  const handlePrevPage = () => setPageNum(p => Math.max(1, p - 1));
  const handleNextPage = () => setPageNum(p => Math.min(numPages, p + 1));
  const handleZoomIn = () => setZoomLevel(z => z + 0.2);
  const handleZoomOut = () => setZoomLevel(z => Math.max(0.2, z - 0.2));
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= numPages) {
        setPageNum(newPage);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-text-muted">Cargando previsualización...</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-danger mb-4">{error}</p>
                <button
                    onClick={handleDownloadAttachment}
                    className="flex items-center justify-center text-sm p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-all duration-200 text-white"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Descargar Archivo
                </button>
            </div>
        );
    }
    
    if (imageUrl) {
      return <img src={imageUrl} alt={attachment.name} className="max-w-full max-h-full object-contain" />;
    }
    
    if (pdfDoc) {
      return (
        <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
            <canvas ref={canvasRef} />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn"
    >
      <style>
        {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-in-out;
            }
          `}
      </style>

      {/* 
        This is the modal panel. It stops click and mousedown propagation 
        so they don't reach the backdrop or underlying components (like CardDetailModal).
      */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] bg-background-subtle rounded-lg shadow-lg flex flex-col overflow-hidden"
      >
        {/* --- Header Controls --- */}
        <div className="flex-shrink-0 flex justify-between items-center p-2 bg-background-card/80 border-b border-border-default">
          <h3 className="text-lg font-semibold text-text-default truncate ml-2">{attachment.name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadAttachment}
              className="p-2 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors"
              aria-label="Descargar archivo"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors"
              aria-label="Cerrar previsualización"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div
          ref={modalContentRef}
          className="flex-grow bg-background-subtle overflow-hidden relative flex items-center justify-center"
        >
          {renderContent()}

          {/* --- PDF Controls --- */}
          {pdfDoc && !isLoading && !error && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background-card/80 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2 text-text-default border border-border-default shadow-lg">
              <button onClick={handlePrevPage} disabled={pageNum <= 1} className="p-1.5 rounded-md disabled:opacity-50 hover:bg-background-subtle transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={pageNum}
                  onChange={handlePageInputChange}
                  onBlur={(e) => {
                    const newPage = parseInt(e.target.value, 10);
                    if (isNaN(newPage) || newPage < 1) setPageNum(1);
                    else if (newPage > numPages) setPageNum(numPages);
                  }}
                  className="w-14 bg-background-subtle text-center rounded-md p-1 focus:ring-1 focus:ring-primary focus:outline-none border border-border-default"
                  min="1"
                  max={numPages}
                />
                <span className="text-sm text-text-muted">/ {numPages}</span>
              </div>
              <button onClick={handleNextPage} disabled={pageNum >= numPages} className="p-1.5 rounded-md disabled:opacity-50 hover:bg-background-subtle transition-colors">
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-border-default mx-2"></div>
              <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-background-subtle transition-colors">
                <ZoomOutIcon className="w-5 h-5" />
              </button>
              <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-background-subtle transition-colors">
                <ZoomInIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;