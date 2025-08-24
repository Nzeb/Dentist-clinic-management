'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Search, Plus, Minus, RefreshCw, X } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'

interface Attachment {
  fileName: string
  description?: string
}

interface AttachmentViewerProps {
  attachments: Attachment[]
  isOpen: boolean
  onClose: () => void
}

export function AttachmentViewer({ attachments, isOpen, onClose }: AttachmentViewerProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)

  useEffect(() => {
    if (attachments.length > 0) {
      setSelectedAttachment(attachments[0])
    }
  }, [attachments])

  const handleSelectAttachment = (attachment: Attachment) => {
    setIsLoading(true)
    setSelectedAttachment(attachment)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] w-[85vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Attachment Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <Collapsible open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen} className="h-full border-r">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80 rounded-full">
                    <ChevronLeft className={cn("h-6 w-6", isLeftSidebarOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent asChild>
              <ScrollArea className="w-64 h-full p-4 bg-gray-50/50">
                <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                <ul>
                  {attachments.map((attachment, index) => (
                    <li key={index} className="mb-2">
                      <Button
                        variant={selectedAttachment?.fileName === attachment.fileName ? 'secondary' : 'ghost'}
                        onClick={() => handleSelectAttachment(attachment)}
                        className="w-full justify-start"
                      >
                        {attachment.fileName}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          {/* Main Content */}
          <div className="flex-1 h-full flex items-center justify-center bg-gray-100 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {selectedAttachment && (
              <TransformWrapper>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => zoomIn()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => zoomOut()}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => resetTransform()}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <TransformComponent>
                      <img
                        src={`/api/attachments/${selectedAttachment.fileName}`}
                        alt={selectedAttachment.fileName}
                        className="max-w-full max-h-full object-contain"
                        onLoad={handleImageLoad}
                        onError={() => setIsLoading(false)}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            )}
          </div>

          {/* Right Sidebar */}
          <Collapsible open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen} className="h-full border-l">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white/50 hover:bg-white/80 rounded-full">
                    <ChevronRight className={cn("h-6 w-6", isRightSidebarOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent asChild>
              <ScrollArea className="w-64 h-full p-4 bg-gray-50/50">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p>{selectedAttachment?.description || 'No description available.'}</p>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  )
}
