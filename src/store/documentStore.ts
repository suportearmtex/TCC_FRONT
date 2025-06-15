// src/store/documentStore.ts - Integrated with backend
import { create } from 'zustand';
import { Document, DocumentState, Folder, Tag } from '../types/document';
import { getCookie } from '../utils/cookies';
import { getNotificationStore } from './notificationStore';

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  folders: [],
  tags: [],
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');

    try {
      const response = await fetch('https://localhost:7198/Document/GetListDocument', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to fetch documents');
      }

      set({ documents: data.objeto || [], loading: false });

    } catch (error) {
      let errorMessage = 'Failed to fetch documents';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
    }
  },

  getDocument: (id: number) => {
    return get().documents.find(document => document.documentId === id);
  },

  addDocument: async (documentData: Omit<Document, 'documentId' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const newDocument = {
        ...documentData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('https://localhost:7198/Document/AddDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDocument)
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to add document');
      }

      // Atualiza o estado com o novo documento
      set(state => ({
        documents: [...state.documents, data.objeto],
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Documento criado com sucesso!', 'success');

      return data.objeto;
    } catch (error) {
      let errorMessage = 'Failed to add document';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  updateDocument: async (id: number, documentData: Partial<Document>) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const updatedDocument = {
        ...documentData,
        documentId: id,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('https://localhost:7198/Document/UpdateDocument', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedDocument)
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to update document');
      }

      // Atualiza o estado com o documento atualizado
      set(state => ({
        documents: state.documents.map(doc =>
          doc.documentId === id ? { ...doc, ...documentData } : doc
        ),
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Documento atualizado com sucesso!', 'success');
    } catch (error) {
      let errorMessage = 'Failed to update document';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  toggleDocumentStatus: async (id: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const response = await fetch(`https://localhost:7198/Document/ToggleStatusDocument/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to toggle document status');
      }

      // Atualiza o estado alternando o status do documento
      set(state => ({
        documents: state.documents.map(doc =>
          doc.documentId === id ? { ...doc, isActive: !doc.isActive } : doc
        ),
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Status do documento alterado com sucesso!', 'success');
    } catch (error) {
      let errorMessage = 'Failed to toggle document status';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  fetchFolders: async () => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const response = await fetch('https://localhost:7198/Folder/GetListFolder', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to fetch folders');
      }

      set({ folders: data.objeto || [], loading: false });
    } catch (error) {
      let errorMessage = 'Failed to fetch folders';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
    }
  },

  addFolder: async (folderData: Omit<Folder, 'folderId' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const newFolder = {
        ...folderData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('https://localhost:7198/Folder/AddFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newFolder)
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to add folder');
      }

      // Atualiza o estado com a nova pasta
      set(state => ({
        folders: [...state.folders, data.objeto],
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Pasta criada com sucesso!', 'success');

      return data.objeto;
    } catch (error) {
      let errorMessage = 'Failed to add folder';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  fetchTags: async () => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const response = await fetch('https://localhost:7198/Tag/GetListTag', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to fetch tags');
      }

      set({ tags: data.objeto || [], loading: false });
    } catch (error) {
      let errorMessage = 'Failed to fetch tags';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
    }
  },

  addTag: async (tagData: Omit<Tag, 'tagId' | 'isActive' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const newTag = {
        ...tagData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('https://localhost:7198/Tag/AddTag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTag)
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to add tag');
      }

      // Atualiza o estado com a nova tag
      set(state => ({
        tags: [...state.tags, data.objeto],
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Tag criada com sucesso!', 'success');

      return data.objeto;
    } catch (error) {
      let errorMessage = 'Failed to add tag';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  addTagToDocument: async (documentId: number, tagId: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const response = await fetch('https://localhost:7198/DocumentTag/AddDocumentTag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentId, tagId })
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to add tag to document');
      }

      getNotificationStore().showNotification(data.mensagem || 'Tag adicionada ao documento com sucesso!', 'success');
    } catch (error) {
      let errorMessage = 'Failed to add tag to document';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeTagFromDocument: async (documentId: number, tagId: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');
    
    try {
      const response = await fetch('https://localhost:7198/DocumentTag/DeleteDocumentTag', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentId, tagId })
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to remove tag from document');
      }

      getNotificationStore().showNotification(data.mensagem || 'Tag removida do documento com sucesso!', 'success');
    } catch (error) {
      let errorMessage = 'Failed to remove tag from document';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));