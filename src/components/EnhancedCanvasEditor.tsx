
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, Palette, Type, Plus, Trash2, Image, Settings, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [showImageLibrary, setShowImageLibrary] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [newTextContent, setNewTextContent] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
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
        height: 120,
        fontSize: 18,
        fontColor: '#1f2937'
      }
    ];
    setElements(initialElements);
  }, [story]);

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setShowPropertiesPanel(true);
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
    const x = (e.clientX - rect.left - dragOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - dragOffset.y) / zoomLevel;
    
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
    const x = (e.clientX - rect.left - 100) / zoomLevel;
    const y = (e.clientY - rect.top - 100) / zoomLevel;

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
      fontColor: '#1f2937'
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
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">Canvas Editor</DialogTitle>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageLibrary(!showImageLibrary)}
                className={showImageLibrary ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Image className="w-4 h-4 mr-2" />
                Images
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
                className={showPropertiesPanel ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Settings className="w-4 h-4 mr-2" />
                Properties
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
            
            <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-6">
            {/* Background Colors */}
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

            {/* Add Text */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-600" />
                <Input
                  placeholder="Add text..."
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
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image Library Sidebar */}
          {showImageLibrary && (
            <div className="w-80 border-r bg-white">
              <CanvasImageLibrary
                imageVersions={imageVersions}
                onImageDragStart={() => {}}
                showPreviousVersions={false}
                onTogglePreviousVersions={() => {}}
              />
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            <div className="p-8 min-h-full flex items-center justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-lg border"
                style={{ 
                  width: 1000 * zoomLevel,
                  height: 700 * zoomLevel,
                  backgroundColor,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {elements.map(element => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move select-none transition-all ${
                      selectedElement === element.id 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
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
                        className="w-full h-full object-cover rounded border pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div 
                        className="w-full h-full p-3 bg-white/90 rounded border shadow-sm overflow-hidden"
                        style={{ 
                          fontSize: element.fontSize, 
                          color: element.fontColor,
                          lineHeight: '1.4'
                        }}
                      >
                        {element.content}
                      </div>
                    )}
                    
                    {selectedElement === element.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-3 -right-3 w-6 h-6 p-0 rounded-full shadow-lg"
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
          {showPropertiesPanel && selectedElementData && (
            <div className="w-80 border-l bg-white">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Element Properties</h3>
                
                {selectedElementData.type === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Content
                      </label>
                      <textarea
                        value={selectedElementData.content}
                        onChange={(e) => updateElementText(selectedElementData.id, e.target.value)}
                        className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <Input
                        type="number"
                        value={selectedElementData.fontSize || 16}
                        onChange={(e) => updateElementStyle(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                        min="8"
                        max="72"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <Input
                        type="color"
                        value={selectedElementData.fontColor || '#000000'}
                        onChange={(e) => updateElementStyle(selectedElementData.id, { fontColor: e.target.value })}
                        className="w-full h-12"
                      />
                    </div>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width
                    </label>
                    <Input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => updateElementStyle(selectedElementData.id, { width: parseInt(e.target.value) })}
                      min="50"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <Input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => updateElementStyle(selectedElementData.id, { height: parseInt(e.target.value) })}
                      min="30"
                      className="w-full"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <Button
                  variant="destructive"
                  onClick={() => deleteElement(selectedElementData.id)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Element
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
