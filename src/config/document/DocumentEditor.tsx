import React, { useState, useEffect } from 'react';
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
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  MoreHorizontal,
  Users,
  Clock,
  Tag,
  ChevronDown,
  X,
  Check,
  FileText,
  Folder,
  History
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Document } from '../../types/document';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/forms/Modal';
import { FormInput, FormTextarea } from '../../components/forms/FormField';

export const DocumentEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuthStore();
  const { getDocument, updateDocument, addDocument, folders } = useDocumentStore();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionComment, setVersionComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tags, setTags] = useState(['Documento', 'Rascunho']);
  const [newTag, setNewTag] = useState('');
  
  const [folderPath, setFolderPath] = useState('Documentos > Geral');

  const isEditing = !!documentId;

  useEffect(() => {
    if (documentId) {
      const doc = getDocument(parseInt(documentId));
      if (doc) {
        setDocument(doc);
        setDocTitle(doc.title);
        setDocContent(doc.content);
        
        // Find folder path
        const folder = folders.find(f => f.folderId === doc.folderId);
        if (folder) {
          setFolderPath(`Documentos > ${folder.name}`);
        }
      }
    } else {
      // New document
      setDocTitle('Novo Documento');
      setDocContent('');
    }
  }, [documentId, getDocument, folders]);
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSaveDocument = async () => {
    if (!docTitle.trim() || !docContent.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const documentData = {
        title: docTitle,
        content: docContent,
        format: 'html',
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

  const handleCreateVersion = () => {
    if (versionComment.trim()) {
      console.log('Creating version with comment:', versionComment);
      setVersionComment('');
      setShowVersionModal(false);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false, '');
  };

  const insertList = (ordered: boolean) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    document.execCommand(command, false, '');
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
              {isEditing ? t('editDocument') : t('newDocument')}
            </span>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            <Folder className="h-4 w-4 mr-1 text-gray-400" />
            <span>{folderPath}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button 
              onClick={() => navigate(`/documents/${documentId}/versions`)}
              className="flex items-center text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <History className="h-4 w-4 mr-1.5" />
              <span>{t('versions')}</span>
            </button>
          )}
          
          <button className="flex items-center text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50">
            <Users className="h-4 w-4 mr-1.5" />
            <span>{t('share')}</span>
          </button>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{isLoading ? t('saving') : t('save')}</span>
          </button>
        </div>
      </header>

      {/* Document Title */}
      <div className="bg-white px-8 py-4 border-b border-gray-200">
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="text-xl font-semibold text-gray-800 w-full outline-none border-b-2 border-transparent focus:border-blue-500 pb-1"
          placeholder={t('documentTitle')}
        />
        
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{t('lastEdit')}: {t('today')} às 14:30</span>
          
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
      <div className="bg-white px-8 py-2 border-b border-gray-200 flex items-center space-x-1">
        <div className="flex items-center mr-2">
          <select className="text-sm border border-gray-300 rounded px-2 py-1 mr-2">
            <option>{t('paragraph')}</option>
            <option>{t('heading')} 1</option>
            <option>{t('heading')} 2</option>
            <option>{t('heading')} 3</option>
          </select>
          
          <select className="text-sm border border-gray-300 rounded px-2 py-1">
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Calibri</option>
            <option>Roboto</option>
          </select>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        <button 
          onClick={() => formatText('bold')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <Bold className="h-4 w-4 text-gray-700" />
        </button>
        
        <button 
          onClick={() => formatText('italic')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <Italic className="h-4 w-4 text-gray-700" />
        </button>
        
        <button 
          onClick={() => formatText('underline')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <Underline className="h-4 w-4 text-gray-700" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        <button 
          onClick={() => formatText('justifyLeft')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <AlignLeft className="h-4 w-4 text-gray-700" />
        </button>
        
        <button 
          onClick={() => formatText('justifyCenter')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <AlignCenter className="h-4 w-4 text-gray-700" />
        </button>
        
        <button 
          onClick={() => formatText('justifyRight')}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <AlignRight className="h-4 w-4 text-gray-700" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        <button 
          onClick={() => insertList(false)}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <List className="h-4 w-4 text-gray-700" />
        </button>
        
        <button 
          onClick={() => insertList(true)}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <ListOrdered className="h-4 w-4 text-gray-700" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        <button className="p-1.5 rounded hover:bg-gray-100">
          <Link className="h-4 w-4 text-gray-700" />
        </button>
        
        <button className="p-1.5 rounded hover:bg-gray-100">
          <Image className="h-4 w-4 text-gray-700" />
        </button>
        
        <button className="p-1.5 rounded hover:bg-gray-100">
          <MoreHorizontal className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-grow px-8 py-6 bg-white">
        <div
          contentEditable
          className="w-full h-full min-h-[400px] outline-none resize-none text-gray-800 prose max-w-none"
          style={{ minHeight: '500px' }}
          dangerouslySetInnerHTML={{ __html: docContent }}
          onInput={(e) => setDocContent(e.currentTarget.innerHTML)}
          suppressContentEditableWarning={true}
        />
      </div>
      
      {/* Tags Modal */}
      {showTagsModal && (
        <Modal
          isOpen={showTagsModal}
          onClose={() => setShowTagsModal(false)}
          title={t('manageTags')}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('addNewTag')}
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enterNewTag')}
                />
                <button 
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  {t('add')}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('currentTags')}
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm text-gray-800">{tag}</span>
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-gray-500 italic">{t('noTagsAdded')}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setShowTagsModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {t('done')}
            </button>
          </div>
        </Modal>
      )}
      
      {/* Save Modal */}
      {showSaveModal && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title={t('saveDocument')}
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormInput
              id="fileName"
              name="fileName"
              label={t('fileName')}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('saveLocation')}
              </label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <Folder className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{folderPath}</span>
                <button className="ml-2 text-blue-600 text-sm">
                  {t('change')}
                </button>
              </div>
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('version')}
                </label>
                <div className="flex items-center">
                  <select className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>{t('newVersion')} (v1.1)</option>
                    <option>{t('replaceCurrentVersion')} (v1.0)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSaveDocument}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};