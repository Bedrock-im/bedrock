"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Save, X, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { convertFile } from "@/services/pandoc";

interface OdtDocumentManagerProps {
  fileUrl: string;
  filename: string;
  onSave?: (newFile: File) => Promise<void>;
}

export default function OdtDocumentManager({ fileUrl, filename, onSave }: OdtDocumentManagerProps) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingFile(true);
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch file");
        
        const blob = await res.blob();
        const file = new File([blob], filename, { type: blob.type });
        setCurrentFile(file);
        
        // Initial Preview (ODT -> HTML)
        await generateHtmlPreview(file);
      } catch (error) {
        toast.error("Failed to load document");
        console.error(error);
      } finally {
        setIsLoadingFile(false);
      }
    };

    init();
  }, [fileUrl, filename]);

  const generateHtmlPreview = async (file: File) => {
    try {
      const extension = filename.split('.').pop()?.toLowerCase();
      if (extension === 'md' || extension === 'markdown') {
        const text = await file.text();
        // For markdown, we can convert it to HTML for preview
        const htmlBlob = await convertFile(file, "html");
        const htmlString = await htmlBlob.text();
        setHtmlContent(htmlString);
      } else {
        const htmlBlob = await convertFile(file, "html");
        const htmlString = await htmlBlob.text();
        setHtmlContent(htmlString);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate preview");
    }
  };

  const handleEditClick = async () => {
    if (!currentFile) return;
    
    setIsConverting(true);
    try {
      const mdBlob = await convertFile(currentFile, "md");
      const mdText = await mdBlob.text();
      setMarkdownContent(mdText);
      setViewMode("edit");
    } catch (e) {
      console.error(e);
      toast.error("Could not switch to edit mode");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const markdownBlob = new Blob([markdownContent], { type: "text/markdown" });
        const markdownFile = new File([markdownBlob], "source.md");
        
        const originalExt = filename.split('.').pop() || "odt";
        const newOdtBlob = await convertFile(markdownFile, originalExt);
        const newOdtFile = new File([newOdtBlob], filename, { type: "application/vnd.oasis.opendocument.text" });

        setCurrentFile(newOdtFile);
        
        await generateHtmlPreview(newOdtFile);
        
        if (onSave) await onSave(newOdtFile);
        
        setViewMode("preview");
        toast.success("File saved successfully");
    } catch (e) {
        console.error(e);
        toast.error("Failed to save changes");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoadingFile) {
    return (
      <div className="flex h-64 w-full items-center justify-center border rounded-lg bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-md">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{filename}</h3>
            <p className="text-xs text-muted-foreground">
                {viewMode === "preview" ? "Read-only Preview" : "Markdown Editor"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {viewMode === "preview" ? (
            <Button onClick={handleEditClick} disabled={isConverting}>
              {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
              Edit Document
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setViewMode("preview")} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[500px] border rounded-lg shadow-sm bg-white overflow-hidden">
        {viewMode === "preview" ? (
          <div className="p-8 h-full overflow-auto prose max-w-none">
             <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <Textarea 
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="w-full h-full min-h-[600px] p-6 font-mono text-sm resize-none border-0 focus-visible:ring-0"
            placeholder="# Start typing..."
          />
        )}
      </div>
    </div>
  );
}