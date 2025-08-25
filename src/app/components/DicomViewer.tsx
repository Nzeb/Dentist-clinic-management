'use client'

import React, { useEffect, useRef, useState } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, Sun, Wind } from 'lucide-react';

let initialized = false;
const initializeCornerstone = () => {
  if (initialized) {
    return;
  }

  try {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.init({
      showSVGCursors: true,
    });
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      webWorkerPath: '/cornerstoneWADOImageLoaderWebWorker.js',
      webWorkerTaskPaths: [],
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: false,
          usePDFJS: false,
          strict: false,
        },
      },
    });
    initialized = true;
  } catch (error) {
    console.error("Failed to initialize Cornerstone", error);
  }
};


interface DicomViewerProps {
  file: File | string;
}

const DicomViewer: React.FC<DicomViewerProps> = ({ file }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageId, setImageId] = useState<string | null>(null);

  useEffect(() => {
    initializeCornerstone();
    if (file && elementRef.current) {
      const element = elementRef.current;
      cornerstone.enable(element);

      const imageId = typeof file === 'string'
        ? `wadouri:${file}`
        : cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

      setImageId(imageId);

      cornerstone.loadImage(imageId).then((image) => {
        cornerstone.displayImage(element, image);
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.setViewport(element, viewport);

        // Add tools
        cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
          configuration: {
            invert: true,
            preventZoomOutsideImage: false,
            minScale: 0.1,
            maxScale: 20.0,
          },
        });
        cornerstoneTools.addTool(cornerstoneTools.PanTool);

        // Activate tools
        cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }); // Left mouse
        cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 }); // Right mouse
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 }); // Middle mouse
      });

      return () => {
        if (element) {
          cornerstone.disable(element);
        }
        if (typeof file !== 'string') {
          cornerstoneWADOImageLoader.wadouri.fileManager.remove(imageId);
        }
      };
    }
  }, [file]);

  const activateTool = (toolName: string, mouseButtonMask: number) => {
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow relative" style={{ width: '100%', height: 'calc(100% - 50px)' }}>
        <div ref={elementRef} className="w-full h-full"></div>
      </div>
      <div className="h-[50px] bg-gray-200 flex items-center justify-center space-x-2 p-2">
        <Button onClick={() => activateTool('Zoom', 2)} variant="outline">
          <ZoomIn className="h-4 w-4" />/<ZoomOut className="h-4 w-4" /> (Right Click)
        </Button>
        <Button onClick={() => activateTool('Pan', 4)} variant="outline">
          <Move className="h-4 w-4" /> (Middle Click)
        </Button>
        <Button onClick={() => activateTool('Wwwc', 1)} variant="outline">
          <Sun className="h-4 w-4" />/<Wind className="h-4 w-4" /> (Left Click)
        </Button>
      </div>
    </div>
  );
};

export default DicomViewer;
