import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bold, Italic, Heading, List, Link, Image, Code, FileCode, Table
} from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content = '',  // Provide a default empty string
  onChange,
  placeholder = 'Write your notes here...',
  minHeight = '300px',
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<string>(readOnly ? 'preview' : 'edit');
  
  // Quick toolbar actions for markdown formatting
  const handleToolbarAction = (action: string) => {
    if (readOnly) return;
    
    let newContent = content;
    const selection = document.querySelector('textarea')?.selectionStart ?? 0;
    const selectionEnd = document.querySelector('textarea')?.selectionEnd ?? 0;
    const selectedText = content.substring(selection, selectionEnd) || 'text';
    
    switch (action) {
      case 'bold':
        newContent = content.substring(0, selection) + `**${selectedText}**` + content.substring(selectionEnd);
        break;
      case 'italic':
        newContent = content.substring(0, selection) + `*${selectedText}*` + content.substring(selectionEnd);
        break;
      case 'heading':
        newContent = content.substring(0, selection) + `## ${selectedText}` + content.substring(selectionEnd);
        break;
      case 'list':
        newContent = content.substring(0, selection) + `\n- ${selectedText}` + content.substring(selectionEnd);
        break;
      case 'link':
        newContent = content.substring(0, selection) + `[${selectedText}](url)` + content.substring(selectionEnd);
        break;
      case 'image':
        newContent = content.substring(0, selection) + `![${selectedText}](image-url)` + content.substring(selectionEnd);
        break;
      case 'code':
        newContent = content.substring(0, selection) + `\`${selectedText}\`` + content.substring(selectionEnd);
        break;
      case 'codeblock':
        newContent = content.substring(0, selection) + `\n\`\`\`\n${selectedText}\n\`\`\`\n` + content.substring(selectionEnd);
        break;
      case 'table':
        newContent = content.substring(0, selection) + 
          `\n| Header 1 | Header 2 | Header 3 |\n` +
          `| -------- | -------- | -------- |\n` +
          `| Cell 1   | Cell 2   | Cell 3   |\n` +
          `| Cell 4   | Cell 5   | Cell 6   |\n` + 
          content.substring(selectionEnd);
        break;
      default:
        break;
    }
    
    onChange(newContent);
  };

  // CSS class to ensure all text elements have the proper color in dark mode
  const markdownBaseClass = "prose prose-sm max-w-none text-foreground dark:text-slate-200";
  // Additional class for dark mode styling
  const darkModeClass = "dark:prose-headings:text-slate-200 dark:prose-strong:text-slate-200 dark:prose-em:text-slate-200 dark:prose-code:text-slate-200 dark:prose-pre:text-slate-200 dark:prose-th:text-slate-200";
  
  // Combine classes
  const markdownClass = `${markdownBaseClass} ${darkModeClass}`;

  // If read-only, just render the markdown content directly
  if (readOnly) {
    return (
      <div className="w-full">
        <div className={markdownClass} style={{ minHeight: 'auto' }}>
          {content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Make links open in a new tab
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                ),
                // Add styling for tables
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="border-collapse border border-border w-full text-foreground dark:text-slate-200" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-border px-4 py-2 bg-muted text-foreground dark:text-slate-200" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-border px-4 py-2 text-foreground dark:text-slate-200" {...props} />
                ),
                // Ensure headings have proper styling
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground dark:text-slate-200" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-bold mt-5 mb-3 text-foreground dark:text-slate-200" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-bold mt-4 mb-2 text-foreground dark:text-slate-200" {...props} />
                ),
                // Code blocks with proper styling
                code: ({ node, className, children, ...props }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-foreground dark:text-slate-200" {...props}>
                    {children}
                  </code>
                ),
                // Lists with proper styling
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 my-4 text-foreground dark:text-slate-200" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 my-4 text-foreground dark:text-slate-200" {...props} />
                ),
                // Paragraphs with proper styling
                p: ({ node, ...props }) => (
                  <p className="my-3 text-foreground dark:text-slate-200" {...props} />
                ),
                // Code blocks
                pre: ({ node, ...props }) => (
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto my-4 text-foreground dark:text-slate-200" {...props} />
                ),
                // Bold text
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-foreground dark:text-slate-200" {...props} />
                ),
                // Italic text
                em: ({ node, ...props }) => (
                  <em className="italic text-foreground dark:text-slate-200" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">{placeholder}</p>
          )}
        </div>
      </div>
    );
  }

  // If in edit mode, show the full editor with tabs
  return (
    <div className="w-full border rounded-md bg-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {activeTab === 'edit' && (
            <div className="flex space-x-1 overflow-x-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('heading')}
                title="Heading"
              >
                <Heading className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('list')}
                title="List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('link')}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('image')}
                title="Image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('code')}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('codeblock')}
                title="Code Block"
              >
                <FileCode className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToolbarAction('table')}
                title="Table"
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent value="edit" className="p-0">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="resize-y border-0 focus-visible:ring-0 min-h-[150px] text-foreground bg-card"
            style={{ minHeight }}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 bg-card">
          <div className={`${markdownClass} min-h-[150px]`} style={{ minHeight }}>
            {content.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Make links open in a new tab
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                  ),
                  // Add styling for tables
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="border-collapse border border-border w-full text-foreground dark:text-slate-200" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-border px-4 py-2 bg-muted text-foreground dark:text-slate-200" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-border px-4 py-2 text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Ensure headings have proper styling
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground dark:text-slate-200" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold mt-5 mb-3 text-foreground dark:text-slate-200" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-bold mt-4 mb-2 text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Code blocks with proper styling
                  code: ({ node, className, children, ...props }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground dark:text-slate-200" {...props}>
                      {children}
                    </code>
                  ),
                  // Lists with proper styling
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 my-4 text-foreground dark:text-slate-200" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 my-4 text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Paragraphs with proper styling
                  p: ({ node, ...props }) => (
                    <p className="my-3 text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Code blocks
                  pre: ({ node, ...props }) => (
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto my-4 text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Bold text
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-foreground dark:text-slate-200" {...props} />
                  ),
                  // Italic text
                  em: ({ node, ...props }) => (
                    <em className="italic text-foreground dark:text-slate-200" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">{placeholder}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkdownEditor;