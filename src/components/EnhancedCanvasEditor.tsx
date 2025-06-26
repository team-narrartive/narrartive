
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Download, Palette, Type, Move, RotateCcw, Trash2, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CanvasImageLibrary } from './CanvasImageLibrary';

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
  const [showPreviousVersions, setShowPreviousVersions] = useState(false);
  const [newTextContent, setNewTextContent] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with story text at the top
  React.useEffect(() => {
    const initialElements: CanvasElement[] = [
      {
        id: 'story-text',
        type: 'text',
        content: story,
        x: 50,
        y: 50,
        width: 700,
        height: 100,
        fontSize: 16,
        fontColor: '#000000'
      }
    ];
    setElements(initialElements);
  }, [story]);

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedElement(elementId);
    setDragOffset({ x: offsetX, y: offsetY });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setElements(prev => prev.map(el => 
      el.id === draggedElement 
        ? { ...el, x: Math.max(0, x), y: Math.max(0, y) }
        : el
    ));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const imageUrl = e.dataTransfer.getData('text/plain');
    if (!imageUrl) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100; // Center the image
    const y = e.clientY - rect.top - 100;

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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleImageDragStart = (imageUrl: string) => {
    // Optional: Add visual feedback when dragging starts
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
      height: 50,
      fontSize: 16,
      fontColor: '#000000'
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
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: backgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('storyboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
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
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Enhanced Canvas Editor</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Image Library Sidebar */}
          <CanvasImageLibrary
            imageVersions={imageVersions}
            onImageDragStart={handleImageDragStart}
            showPreviousVersions={showPreviousVersions}
            onTogglePreviousVersions={setShowPreviousVersions}
          />

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="text-sm font-medium">Background:</span>
                <div className="flex gap-1">
                  {backgroundColors.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        backgroundColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add text..."
                  value={newTextContent}
                  onChange={(e) => setNewTextContent(e.target.value)}
                  className="w-48"
                />
                <Button onClick={addTextElement} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Text
                </Button>
              </div>
              
              <Button onClick={exportToPDF} className="ml-auto">
                <Download className="w-4 h-4 mr-2" />
                Save to PDF
              </Button>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-4">
              <div
                ref={canvasRef}
                className="relative w-[1000px] h-[700px] mx-auto border-2 border-gray-300 rounded-lg shadow-lg"
                style={{ backgroundColor }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {elements.map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move select-none ${
                      selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                    } ${element.type === 'text' ? 'resize' : ''}`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      fontSize: element.fontSize,
                      color: element.fontColor,
                    }}
                    onClick={() => handleElementClick(element.id)}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    {element.type === 'image' ? (
                      <img
                        src={element.content}
                        alt="Canvas element"
                        className="w-full h-full object-cover rounded border"
                        draggable={false}
                      />
                    ) : (
                      <div 
                        className="w-full h-full p-2 bg-white/80 rounded border overflow-hidden"
                        style={{ fontSize: element.fontSize, color: element.fontColor }}
                      >
                        {element.content}
                      </div>
                    )}
                    
                    {selectedElement === element.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          {selectedElementData && (
            <div className="w-64 bg-white/80 backdrop-blur-sm border-l border-white/30 p-4">
              <h3 className="font-semibold mb-4">Element Properties</h3>
              
              {selectedElementData.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Text Content</label>
                    <textarea
                      value={selectedElementData.content}
                      onChange={(e) => updateElementText(selectedElementData.id, e.target.value)}
                      className="w-full mt-1 p-2 border rounded text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Font Size</label>
                    <Input
                      type="number"
                      value={selectedElementData.fontSize || 16}
                      onChange={(e) => updateElementStyle(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                      className="mt-1"
                      min="8"
                      max="72"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      type="color"
                      value={selectedElementData.fontColor || '#000000'}
                      onChange={(e) => updateElementStyle(selectedElementData.id, { fontColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <Input
                    type="number"
                    value={selectedElementData.width}
                    onChange={(e) => updateElementStyle(selectedElementData.id, { width: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Height</label>
                  <Input
                    type="number"
                    value={selectedElementData.height}
                    onChange={(e) => updateElementStyle(selectedElementData.id, { height: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
