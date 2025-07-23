
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, Palette, Type, Plus, Trash2, Image, Settings, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CanvasImageLibrary } from './CanvasImageLibrary';
import { StoryElementsSidebar } from './StoryElementsSidebar';

interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fontSize?: number;
  fontColor?: string;
  elementType?: 'paragraph' | 'sentence' | 'custom' | 'heading';
}

interface ImageVersion {
  id: string;
  images: string[];
  created_at: string;
  settings: {
    numImages: number;
    quality: string;
    style: string;
  };
}

interface EnhancedCanvasEditorProps {
  images: string[];
  story: string;
  imageVersions: ImageVersion[];
  onClose: () => void;
}

export const EnhancedCanvasEditor: React.FC<EnhancedCanvasEditorProps> = ({ 
  images, 
  story, 
  imageVersions,
  onClose 
}) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showImageLibrary, setShowImageLibrary] = useState(true);
  const [showStoryElements, setShowStoryElements] = useState(true);
  const [showPreviousVersions, setShowPreviousVersions] = useState(false);
  const [newTextContent, setNewTextContent] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Parse story into structured content with headings
  const parseStoryContent = (storyText: string) => {
    const lines = storyText.split('\n').filter(line => line.trim());
    const elements: CanvasElement[] = [];
    let yOffset = 50;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Detect headings (lines that end with : or are all caps or start with numbers)
      const isHeading = trimmedLine.endsWith(':') || 
                       trimmedLine === trimmedLine.toUpperCase() || 
                       /^\d+\./.test(trimmedLine) ||
                       trimmedLine.length < 50 && index === 0;

      const element: CanvasElement = {
        id: `story-${isHeading ? 'heading' : 'paragraph'}-${index}`,
        type: 'text',
        content: trimmedLine,
        x: 50,
        y: yOffset,
        width: isHeading ? 600 : 500,
        height: isHeading ? 40 : 80,
        fontSize: isHeading ? 24 : 16,
        fontColor: isHeading ? '#1f2937' : '#374151',
        elementType: isHeading ? 'heading' : 'paragraph'
      };

      elements.push(element);
      yOffset += element.height + 20;
    });

    return elements;
  };

  // Initialize with parsed story content
  React.useEffect(() => {
    const initialElements = parseStoryContent(story);
    setElements(initialElements);
  }, [story]);

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Check if clicking on resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || '');
      setSelectedElement(elementId);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedElement(elementId);
    setSelectedElement(elementId);
    setDragOffset({ x: offsetX, y: offsetY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    if (isResizing && selectedElement) {
      // Handle resizing
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const x = (e.clientX - rect.left) / zoomLevel;
      const y = (e.clientY - rect.top) / zoomLevel;

      let newWidth = element.width;
      let newHeight = element.height;

      if (resizeHandle.includes('right')) {
        newWidth = Math.max(50, x - element.x);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(30, y - element.y);
      }

      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, width: newWidth, height: newHeight }
          : el
      ));
    } else if (draggedElement) {
      // Handle dragging
      const x = (e.clientX - rect.left - dragOffset.x) / zoomLevel;
      const y = (e.clientY - rect.top - dragOffset.y) / zoomLevel;
      
      setElements(prev => prev.map(el => 
        el.id === draggedElement 
          ? { ...el, x: Math.max(0, x), y: Math.max(0, y) }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - 100) / zoomLevel;
    const y = (e.clientY - rect.top - 100) / zoomLevel;

    // Check if it's a story element
    const elementType = e.dataTransfer.getData('application/story-element');
    const content = e.dataTransfer.getData('text/plain');

    if (elementType && content) {
      // Handle story element drop
      const newElement: CanvasElement = {
        id: `story-${elementType}-${Date.now()}`,
        type: 'text',
        content: content,
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: elementType === 'paragraph' ? 400 : 300,
        height: elementType === 'paragraph' ? 100 : 60,
        fontSize: elementType === 'paragraph' ? 14 : 16,
        fontColor: '#374151',
        elementType: elementType as 'paragraph' | 'sentence'
      };
      setElements(prev => [...prev, newElement]);
    } else {
      // Handle image drop - Fixed to properly handle image URLs
      const imageUrl = content;
      console.log('Dropping image:', imageUrl);
      
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:'))) {
        const newElement: CanvasElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: imageUrl,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: 200,
          height: 200,
        };
        setElements(prev => [...prev, newElement]);
        console.log('Image element added:', newElement);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleStoryElementDragStart = (content: string, type: 'paragraph' | 'sentence') => {
    console.log('Story element drag started:', type, content.substring(0, 50));
  };

  const addTextElement = () => {
    if (!newTextContent.trim()) return;

    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: newTextContent,
      x: 100,
      y: 300,
      width: 300,
      height: 60,
      fontSize: 16,
      fontColor: '#374151',
      elementType: 'custom'
    };

    setElements(prev => [...prev, newElement]);
    setNewTextContent('');
  };

  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const updateElementText = (elementId: string, newContent: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, content: newContent } : el
    ));
  };

  const updateElementStyle = (elementId: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const exportToPDF = async () => {
    if (!canvasRef.current) return;
    
    try {
      console.log('Starting PDF export...');
      
      // Create a high-quality version of the canvas for export
      const exportCanvas = document.createElement('div');
      exportCanvas.style.width = '1000px';
      exportCanvas.style.height = '700px';
      exportCanvas.style.backgroundColor = backgroundColor;
      exportCanvas.style.position = 'absolute';
      exportCanvas.style.left = '-10000px';
      exportCanvas.style.top = '0';
      exportCanvas.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      document.body.appendChild(exportCanvas);

      // Add all elements to the export canvas
      for (const element of elements) {
        const elementDiv = document.createElement('div');
        elementDiv.style.position = 'absolute';
        elementDiv.style.left = `${element.x}px`;
        elementDiv.style.top = `${element.y}px`;
        elementDiv.style.width = `${element.width}px`;
        elementDiv.style.height = `${element.height}px`;
        elementDiv.style.overflow = 'hidden';

        if (element.type === 'image') {
          const img = document.createElement('img');
          img.src = element.content;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '8px';
          img.style.border = '1px solid #e5e7eb';
          img.crossOrigin = 'anonymous'; // Enable CORS for external images
          elementDiv.appendChild(img);
        } else {
          elementDiv.style.fontSize = `${element.fontSize || 16}px`;
          elementDiv.style.color = element.fontColor || '#374151';
          elementDiv.style.lineHeight = '1.4';
          elementDiv.style.padding = '8px';
          elementDiv.style.wordWrap = 'break-word';
          elementDiv.style.whiteSpace = 'pre-wrap';
          
          // Clean text appearance - no backgrounds for seamless look
          if (element.elementType === 'heading') {
            elementDiv.style.fontWeight = 'bold';
            elementDiv.style.fontSize = `${(element.fontSize || 24)}px`;
          }
          
          elementDiv.textContent = element.content;
        }
        
        exportCanvas.appendChild(elementDiv);
      }

      // Wait for images to load
      const images = exportCanvas.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            // Set a timeout to avoid hanging
            setTimeout(() => resolve(img), 3000);
          }
        });
      }));

      console.log('Images loaded, capturing canvas...');

      // Capture with high quality
      const canvas = await html2canvas(exportCanvas, {
        backgroundColor: backgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1000,
        height: 700,
        foreignObjectRendering: false,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          // Ensure styles are applied in the cloned document
          const clonedCanvas = clonedDoc.querySelector('div');
          if (clonedCanvas) {
            clonedCanvas.style.backgroundColor = backgroundColor;
          }
        }
      });

      console.log('Canvas captured, creating PDF...');

      // Clean up
      document.body.removeChild(exportCanvas);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add the canvas image to fill the entire PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      const fileName = `canvas-export-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF exported successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const backgroundColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#fef3c7', '#ddd6fe', '#dbeafe', '#d1fae5',
    '#fed7d7', '#fbb6ce', '#f3e8ff', '#e0e7ff'
  ];

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-50">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">Canvas Editor</DialogTitle>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageLibrary(!showImageLibrary)}
                className={showImageLibrary ? 'bg-primary/10 border-primary/30 text-primary' : ''}
              >
                <Image className="w-4 h-4 mr-2" />
                Images
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStoryElements(!showStoryElements)}
                className={showStoryElements ? 'bg-success/10 border-success/30 text-success' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Story
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button onClick={exportToPDF} className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Streamlined Top Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Background</span>
              </div>
              <div className="flex gap-1">
                {backgroundColors.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      backgroundColor === color 
                        ? 'border-blue-500 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-600" />
                <Input
                  placeholder="Add custom text..."
                  value={newTextContent}
                  onChange={(e) => setNewTextContent(e.target.value)}
                  className="w-48 h-8"
                  onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                />
              </div>
              <Button onClick={addTextElement} size="sm" disabled={!newTextContent.trim()}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Streamlined text editing for selected element */}
            {selectedElementData && selectedElementData.type === 'text' && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Font Size:</label>
                  <Input
                    type="number"
                    value={selectedElementData.fontSize || 16}
                    onChange={(e) => updateElementStyle(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                    min="8"
                    max="72"
                    className="w-16 h-8"
                  />
                  
                  <label className="text-sm font-medium text-gray-700">Color:</label>
                  <Input
                    type="color"
                    value={selectedElementData.fontColor || '#000000'}
                    onChange={(e) => updateElementStyle(selectedElementData.id, { fontColor: e.target.value })}
                    className="w-12 h-8 p-1"
                  />
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteElement(selectedElementData.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image Library Sidebar */}
          {showImageLibrary && (
            <div className="w-80 border-r border-black/20 bg-white">
              <CanvasImageLibrary
                imageVersions={imageVersions}
                onImageDragStart={() => {}}
                showPreviousVersions={showPreviousVersions}
                onTogglePreviousVersions={setShowPreviousVersions}
              />
            </div>
          )}

          {/* Story Elements Sidebar */}
          {showStoryElements && (
            <div className="w-80 border-r border-black/20 bg-white">
              <StoryElementsSidebar
                story={story}
                onDragStart={handleStoryElementDragStart}
              />
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            <div className="p-8 min-h-full flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-xl border-2 border-gray-200"
                style={{ 
                  width: Math.max(1000 * zoomLevel, 400),
                  height: Math.max(700 * zoomLevel, 300),
                  backgroundColor,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleCanvasClick}
              >
                {elements.map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move select-none group transition-all ${
                      selectedElement === element.id 
                        ? 'ring-2 ring-blue-500 shadow-lg z-10' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                    style={{
                      left: element.x * zoomLevel,
                      top: element.y * zoomLevel,
                      width: element.width * zoomLevel,
                      height: element.height * zoomLevel,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left',
                    }}
                    onClick={(e) => handleElementClick(element.id, e)}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    {element.type === 'image' ? (
                      <img
                        src={element.content}
                        alt="Canvas element"
                        className="w-full h-full object-cover rounded-lg border shadow-sm pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div 
                        className="w-full h-full p-3 overflow-hidden pointer-events-none"
                        style={{ 
                          fontSize: element.fontSize, 
                          color: element.fontColor,
                          lineHeight: element.elementType === 'heading' ? '1.2' : '1.4',
                          fontWeight: element.elementType === 'heading' ? 'bold' : 'normal',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {element.content}
                      </div>
                    )}
                    
                    {/* Selection handles */}
                    {selectedElement === element.id && (
                      <>
                        {/* Delete button */}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-3 -right-3 w-6 h-6 p-0 rounded-full shadow-lg z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        
                        {/* Resize handles */}
                        <div
                          className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded cursor-se-resize z-20"
                          data-handle="bottom-right"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizing(true);
                            setResizeHandle('bottom-right');
                            setSelectedElement(element.id);
                          }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
