import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code,
  Quote,
  Table,
  Hash,
  Eye,
  EyeOff,
  Download,
  FileText,
  Folder,
  History,
  Users,
  Clock,
  Tag,
  X,
  Plus,
  Search,
  Strikethrough,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Type,
  AlignLeft,
  MoreHorizontal
} from 'lucide-react';
import { Document } from '../../types/document';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/forms/Modal';
import { FormInput } from '../../components/forms/FormField';

interface MarkdownEditorProps {
  documentId?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuthStore();
  const { getDocument, updateDocument, addDocument, folders } = useDocumentStore();
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [folderPath, setFolderPath] = useState('Documentos > Markdown');
  
  // Link modal state
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isWikiLink, setIsWikiLink] = useState(false);
  
  // Image modal state
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Table modal state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  // Auto-complete state
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteItems, setAutoCompleteItems] = useState<string[]>([]);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ top: 0, left: 0 });
  const [autoCompleteType, setAutoCompleteType] = useState<'tag' | 'link' | null>(null);

  const isEditing = !!documentId;

  useEffect(() => {
    if (documentId) {
      const doc = getDocument(parseInt(documentId));
      if (doc) {
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
        
        const folder = folders.find(f => f.folderId === doc.folderId);
        if (folder) {
          setFolderPath(`Documentos > ${folder.name}`);
        }
      }
    } else {
      setTitle('Novo Documento Markdown');
      setContent('# Novo Documento\n\nComece a escrever aqui...\n\n## Seção\n\nSeu conteúdo em **Markdown**.');
    }
  }, [documentId, getDocument, folders]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            insertMarkdown('**', '**', 'texto em negrito');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('*', '*', 'texto em itálico');
            break;
          case 'u':
            e.preventDefault();
            insertMarkdown('<u>', '</u>', 'texto sublinhado');
            break;
          case 'k':
            e.preventDefault();
            setShowLinkModal(true);
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'p':
            e.preventDefault();
            setShowPreview(!showPreview);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview]);

  // Auto-complete detection
  useEffect(() => {
    const handleInput = () => {
      if (!editorRef.current) return;
      
      const textarea = editorRef.current;
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPos);
      
      // Check for tag auto-complete (#)
      const tagMatch = textBeforeCursor.match(/#(\w*)$/);
      if (tagMatch) {
        setAutoCompleteType('tag');
        setAutoCompleteItems(['documento', 'importante', 'rascunho', 'revisão', 'final']);
        setShowAutoComplete(true);
        return;
      }
      
      // Check for wiki link auto-complete ([[)
      const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/);
      if (linkMatch) {
        setAutoCompleteType('link');
        setAutoCompleteItems(['Documento Principal', 'Notas de Reunião', 'Projeto Alpha', 'Ideias']);
        setShowAutoComplete(true);
        return;
      }
      
      setShowAutoComplete(false);
    };

    handleInput();
  }, [content]);

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + replacement + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [content]);

  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix, '', `Título ${level}`);
  };

  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertMarkdown(prefix, '', 'Item da lista');
  };

  const insertCheckbox = () => {
    insertMarkdown('- [ ] ', '', 'Item da checklist');
  };

  const insertCodeBlock = (language: string = '') => {
    const prefix = `\`\`\`${language}\n`;
    const suffix = '\n```';
    insertMarkdown(prefix, suffix, 'seu código aqui');
  };

  const insertTable = () => {
    let tableMarkdown = '\n';
    
    // Header row
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += `| Coluna ${i + 1} `;
    }
    tableMarkdown += '|\n';
    
    // Separator row
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += '| --- ';
    }
    tableMarkdown += '|\n';
    
    // Data rows
    for (let i = 0; i < tableRows; i++) {
      for (let j = 0; j < tableCols; j++) {
        tableMarkdown += '| Dados ';
      }
      tableMarkdown += '|\n';
    }
    
    insertMarkdown(tableMarkdown, '');
    setShowTableModal(false);
  };

  const insertLink = () => {
    if (isWikiLink) {
      insertMarkdown(`[[${linkText}]]`, '');
    } else {
      insertMarkdown(`[${linkText}](${linkUrl})`, '');
    }
    setLinkText('');
    setLinkUrl('');
    setShowLinkModal(false);
  };

  const insertImage = () => {
    insertMarkdown(`![${imageAlt}](${imageUrl})`, '');
    setImageAlt('');
    setImageUrl('');
    setShowImageModal(false);
  };

  const handleAutoComplete = (item: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    
    let newContent = content;
    
    if (autoCompleteType === 'tag') {
      const tagMatch = textBeforeCursor.match(/#(\w*)$/);
      if (tagMatch) {
        const replaceStart = cursorPos - tagMatch[0].length;
        newContent = content.substring(0, replaceStart) + `#${item} ` + content.substring(cursorPos);
      }
    } else if (autoCompleteType === 'link') {
      const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/);
      if (linkMatch) {
        const replaceStart = cursorPos - linkMatch[0].length;
        newContent = content.substring(0, replaceStart) + `[[${item}]]` + content.substring(cursorPos);
      }
    }
    
    setContent(newContent);
    setShowAutoComplete(false);
  };

  const renderMarkdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Underline
    html = html.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    
    // Code inline
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Wiki links
    html = html.replace(/\[\[([^\]]+)\]\]/g, '<a href="#" class="wiki-link">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');
    
    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Checkboxes
    html = html.replace(/- \[ \] (.*$)/gim, '<input type="checkbox" disabled> $1<br>');
    html = html.replace(/- \[x\] (.*$)/gim, '<input type="checkbox" checked disabled> $1<br>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Tags
    html = html.replace(/#(\w+)/g, '<span class="tag">#$1</span>');
    
    return html;
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const documentData = {
        title,
        content,
        format: 'markdown',
        folderId: document?.folderId || 1,
        userId: user?.userId || 0
      };

      if (isEditing && document) {
        await updateDocument(document.documentId, documentData);
      } else {
        await addDocument(documentData);
      }
      
      setShowSaveModal(false);
      navigate('/documents');
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        .tag { background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 12px; font-size: 0.8em; }
        .wiki-link { color: #1976d2; text-decoration: none; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${renderMarkdownToHtml(content)}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    // This would require a PDF library like jsPDF or html2pdf
    // For now, we'll open the print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                h1, h2, h3 { color: #333; }
                code { background: #f4f4f4; padding: 2px 4px; }
                pre { background: #f4f4f4; padding: 10px; }
                blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
            </style>
        </head>
        <body>
            ${renderMarkdownToHtml(content)}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/documents')}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex items-center border-r border-gray-200 pr-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Markdown Editor
            </span>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            <Folder className="h-4 w-4 mr-1 text-gray-400" />
            <span>{folderPath}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
            <span>{showPreview ? 'Editar' : 'Preview'}</span>
          </button>
          
          <div className="relative group">
            <button className="flex items-center text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4 mr-1.5" />
              <span>Exportar</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button 
                onClick={exportToHtml}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar como HTML
              </button>
              <button 
                onClick={exportToPdf}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar como PDF
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </header>

      {/* Document Title */}
      <div className="bg-white px-8 py-4 border-b border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold text-gray-800 w-full outline-none border-b-2 border-transparent focus:border-blue-500 pb-1"
          placeholder="Título do documento"
        />
        
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Última edição: Hoje às 14:30</span>
          
          <div className="mx-3 h-1 w-1 rounded-full bg-gray-300"></div>
          
          <button 
            onClick={() => setShowTagsModal(true)}
            className="flex items-center hover:text-blue-600"
          >
            <Tag className="h-4 w-4 mr-1" />
            <span>Tags: {tags.length}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white px-8 py-2 border-b border-gray-200 flex items-center space-x-1 overflow-x-auto">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1 mr-2">
          <button 
            onClick={() => insertMarkdown('**', '**', 'negrito')}
            className="p-1.5 rounded hover:bg-gray-100 tooltip"
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertMarkdown('*', '*', 'itálico')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertMarkdown('<u>', '</u>', 'sublinhado')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertMarkdown('~~', '~~', 'tachado')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        {/* Headings */}
        <div className="flex items-center space-x-1 mr-2">
          <button 
            onClick={() => insertHeading(1)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Título 1"
          >
            <Heading1 className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertHeading(2)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Título 2"
          >
            <Heading2 className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertHeading(3)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Título 3"
          >
            <Heading3 className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        {/* Lists */}
        <div className="flex items-center space-x-1 mr-2">
          <button 
            onClick={() => insertList(false)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Lista não ordenada"
          >
            <List className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertList(true)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Lista ordenada"
          >
            <ListOrdered className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={insertCheckbox}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Checklist"
          >
            <CheckSquare className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        {/* Media & Links */}
        <div className="flex items-center space-x-1 mr-2">
          <button 
            onClick={() => setShowLinkModal(true)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Link (Ctrl+K)"
          >
            <Link className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Imagem"
          >
            <Image className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertMarkdown('`', '`', 'código')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Código inline"
          >
            <Code className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertCodeBlock()}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Bloco de código"
          >
            <Type className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        {/* Other Elements */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => insertMarkdown('> ', '', 'citação')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Citação"
          >
            <Quote className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => setShowTableModal(true)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Tabela"
          >
            <Table className="h-4 w-4 text-gray-700" />
          </button>
          
          <button 
            onClick={() => insertMarkdown('#', ' ', 'tag')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Tag"
          >
            <Hash className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-grow flex">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} relative`}>
          <textarea
            ref={editorRef}
            className="w-full h-full p-8 outline-none resize-none text-gray-800 font-mono text-sm leading-relaxed"
            placeholder="# Título do Documento

Comece a escrever em **Markdown**...

## Funcionalidades

- **Negrito** e *itálico*
- [Links](https://example.com) e [[Wiki Links]]
- `código inline` e blocos de código
- #tags e listas
- > Citações
- - [ ] Checklists

```javascript
// Blocos de código com syntax highlighting
console.log('Hello, World!');
```

| Coluna 1 | Coluna 2 |
|----------|----------|
| Dados    | Mais dados |
"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '500px' }}
          />
          
          {/* Auto-complete dropdown */}
          {showAutoComplete && (
            <div 
              className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
              style={{ 
                top: autoCompletePosition.top, 
                left: autoCompletePosition.left 
              }}
            >
              {autoCompleteItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAutoComplete(item)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {autoCompleteType === 'tag' ? `#${item}` : item}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-200">
            <div className="h-full overflow-y-auto p-8">
              <div 
                ref={previewRef}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      
      {/* Link Modal */}
      {showLinkModal && (
        <Modal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          title="Inserir Link"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isWikiLink}
                  onChange={() => setIsWikiLink(false)}
                  className="mr-2"
                />
                Link externo
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isWikiLink}
                  onChange={() => setIsWikiLink(true)}
                  className="mr-2"
                />
                Wiki Link
              </label>
            </div>
            
            <FormInput
              id="linkText"
              name="linkText"
              label="Texto do link"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Digite o texto que aparecerá"
            />
            
            {!isWikiLink && (
              <FormInput
                id="linkUrl"
                name="linkUrl"
                label="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowLinkModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={insertLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Inserir
            </button>
          </div>
        </Modal>
      )}
      
      {/* Image Modal */}
      {showImageModal && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Inserir Imagem"
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormInput
              id="imageUrl"
              name="imageUrl"
              label="URL da imagem"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            
            <FormInput
              id="imageAlt"
              name="imageAlt"
              label="Texto alternativo"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descrição da imagem"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowImageModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={insertImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Inserir
            </button>
          </div>
        </Modal>
      )}
      
      {/* Table Modal */}
      {showTableModal && (
        <Modal
          isOpen={showTableModal}
          onClose={() => setShowTableModal(false)}
          title="Inserir Tabela"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de linhas
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de colunas
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowTableModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={insertTable}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Inserir
            </button>
          </div>
        </Modal>
      )}
      
      {/* Save Modal */}
      {showSaveModal && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Salvar Documento"
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormInput
              id="fileName"
              name="fileName"
              label="Nome do arquivo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local de salvamento
              </label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <Folder className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{folderPath}</span>
                <button className="ml-2 text-blue-600 text-sm">
                  Alterar
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Salvar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};