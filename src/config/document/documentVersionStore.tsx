// src/store/documentVersionStore.ts - Integrated with backend
import { create } from 'zustand';
import { DocumentVersion } from '../../types/document';
import { getCookie } from '../../utils/cookies';
import { getNotificationStore } from '../../store/notificationStore';

interface DocumentVersionState {
  versions: DocumentVersion[];
  loading: boolean;
  error: string | null;
  
  // Ações básicas
  fetchVersions: (documentId: number) => Promise<void>;
  getVersion: (versionId: number) => DocumentVersion | undefined;
  createVersion: (documentId: number, content: string, comment?: string) => Promise<DocumentVersion>;
  restoreVersion: (versionId: number) => Promise<void>;
  deleteVersion: (versionId: number) => Promise<void>;
  getVersionsByDocument: (documentId: number) => DocumentVersion[];
}

export const useDocumentVersionStore = create<DocumentVersionState>((set, get) => ({
  versions: [],
  loading: false,
  error: null,

  fetchVersions: async (documentId: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');

    try {
      const response = await fetch(`https://localhost:7198/DocumentVersion/GetVersionsByDocument/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to fetch document versions');
      }

      set({ versions: data.objeto || [], loading: false });

    } catch (error) {
      let errorMessage = 'Failed to fetch document versions';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
    }
  },

  getVersion: (versionId: number) => {
    return get().versions.find(version => version.documentVersionId === versionId);
  },

  createVersion: async (documentId: number, content: string, comment?: string) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');

    try {
      const response = await fetch('https://localhost:7198/DocumentVersion/CreateVersion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId,
          content,
          comment
        })
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to create document version');
      }

      // Atualiza o estado com a nova versão
      set(state => ({
        versions: [...state.versions, data.objeto],
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Versão criada com sucesso!', 'success');

      return data.objeto;

    } catch (error) {
      let errorMessage = 'Failed to create document version';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  restoreVersion: async (versionId: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');

    try {
      const response = await fetch(`https://localhost:7198/DocumentVersion/RestoreVersion/${versionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to restore document version');
      }

      set({ loading: false });

      getNotificationStore().showNotification(data.mensagem || 'Versão restaurada com sucesso!', 'success');

    } catch (error) {
      let errorMessage = 'Failed to restore document version';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  deleteVersion: async (versionId: number) => {
    set({ loading: true, error: null });
    const token = getCookie('authToken');

    try {
      const response = await fetch(`https://localhost:7198/DocumentVersion/DeleteVersion/${versionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Failed to delete document version');
      }

      // Remove a versão do estado
      set(state => ({
        versions: state.versions.filter(version => version.documentVersionId !== versionId),
        loading: false
      }));

      getNotificationStore().showNotification(data.mensagem || 'Versão excluída com sucesso!', 'success');

    } catch (error) {
      let errorMessage = 'Failed to delete document version';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, loading: false });
      getNotificationStore().showError(errorMessage);
      throw error;
    }
  },

  getVersionsByDocument: (documentId: number) => {
    return get().versions.filter(version => version.documentId === documentId);
  }
}));