
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Download, Palette, Type, Move, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

interface CanvasEditorProps {
  images: string[];
  story: string;
  onClose: () => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ images, story, onClose }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with images and story text
  React.useEffect(() => {
    const initialElements: CanvasElement[] = [
      // Add story text at the top
      {
        id: 'story-text',
        type: 'text',
        content: story,
        x: 50,
        y: 50,
        width: 700,
        height: 100,
      },
      // Add images
      ...images.map((image, index) => ({
        id: `image-${index}`,
        type: 'image' as const,
        content: image,
        x: 50 + (index * 250),
        y: 200,
        width: 200,
        height: 200,
      }))
    ];
    setElements(initialElements);
  }, [images, story]);

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    setDraggedElement(elementId);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setElements(prev => prev.map(el => 
      el.id === draggedElement 
        ? { ...el, x: x - el.width / 2, y: y - el.height / 2 }
        : el
    ));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  const exportToPDF = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: backgroundColor,
        scale: 2,
        useCORS: true,
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Canvas Editor</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
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
            
            <Button onClick={exportToPDF} className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Save to PDF
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div
              ref={canvasRef}
              className="relative w-[800px] h-[600px] mx-auto border-2 border-gray-300 rounded-lg shadow-lg"
              style={{ backgroundColor }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {elements.map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-move select-none ${
                    selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
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
                    <div className="w-full h-full p-2 text-sm text-gray-800 bg-white/80 rounded border overflow-hidden">
                      {element.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
