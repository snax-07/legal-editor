"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Table} from "@tiptap/extension-table";
import {TableRow} from "@tiptap/extension-table-row";
import {TableCell} from "@tiptap/extension-table-cell";
import {TableHeader} from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";


const PAGE_HEIGHT_PX = 1123; 
const PAGE_WIDTH_PX = 794;
const MARGIN_PX = 96; // 1 inch

export default function FinalLegalEditor() {
  const [pages, setPages] = useState(1);
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // 1. Prevent Hydration Error
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // Essential for Next.js
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ] as any[],
    content: `<h1>Legal Document</h1><p>Start typing your petition here...</p>`,
    onUpdate: ({ editor }) => {
      // Logic to trigger re-render for button states and page math
      calculatePages();
    },
  });

  const calculatePages = () => {
    if (editorRef.current) {
      const contentHeight = editorRef.current.scrollHeight;
      // Calculate pages based on the actual height vs A4 height
      const newPageCount = Math.ceil(contentHeight / PAGE_HEIGHT_PX);
      setPages(newPageCount || 1);
    }
  };

  // Re-calculate whenever content changes
  useEffect(() => {
    if (editor) calculatePages();
  }, [editor?.getHTML()]);

  if (!mounted || !editor) return null;

  return (
    <div className="min-h-screen bg-slate-400 py-10 flex flex-col items-center overflow-auto selection:bg-blue-100">
      
      {/* TOOLBAR: Fixed and Clear */}
      <div className="fixed top-0 z-50 w-full bg-white border-b border-slate-300 p-2 flex justify-center gap-4 shadow-sm">
        <button 
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-6 py-1.5 rounded-md font-bold transition-all border ${
            editor.isActive("bold") 
              ? "bg-blue-600 text-white border-blue-700 shadow-inner" 
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          B
        </button>
        
        <button 
          type="button"
          onClick={() => (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3 }).run()}
          className="px-4 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
        >
          ＋ Table
        </button>

        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center text-xs font-black text-slate-500 uppercase">
          Total Pages: {pages}
        </div>
      </div>

      {/* THE PAGE VIEW */}
      <div className="relative mt-12 shadow-[0_0_50px_rgba(0,0,0,0.2)]">
        
        {/* Visual Background Slices */}
        <div className="absolute top-0 left-0 w-full pointer-events-none flex flex-col gap-0">
          {Array.from({ length: pages }).map((_, i) => (
            <div 
              key={i} 
              className="bg-white border-b-[20px] border-slate-400 last:border-b-0" 
              style={{ width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX }}
            />
          ))}
        </div>

        {/* ACTIVE EDITOR LAYER */}
        <div 
          ref={editorRef}
          className="relative z-10 editor-canvas"
          style={{
            width: PAGE_WIDTH_PX,
            padding: `${MARGIN_PX}px`,
            // This gradient exactly matches the gaps in the background divs
            backgroundImage: `linear-gradient(to bottom, transparent ${PAGE_HEIGHT_PX - 20}px, #94a3b8 ${PAGE_HEIGHT_PX - 20}px, #94a3b8 ${PAGE_HEIGHT_PX}px)`,
            backgroundSize: `100% ${PAGE_HEIGHT_PX}px`,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: ${PAGE_HEIGHT_PX - (MARGIN_PX * 2)}px;
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 0.5;
          color: #000000;
        }

        /* Prevent text from getting stuck exactly in the gap */
        .ProseMirror p {
          margin-bottom: 0.5rem;
        }

        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #cbd5e1;
        }
        
        .ProseMirror td, .ProseMirror th {
          border: 1px solid #cbd5e1;
          padding: 8px;
        }

        /* Print Settings */
        @media print {
          .fixed { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .editor-canvas { 
            background-image: none !important; 
            padding: 0 !important; 
            box-shadow: none !important;
          }
          .ProseMirror { padding: 1in !important; }
        }
      `}</style>
    </div>
  );
}