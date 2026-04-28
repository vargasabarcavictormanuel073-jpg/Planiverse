/**
 * NotasPage - Página de gestión de notas
 * Módulo: Notas
 *
 * Permite al usuario crear, editar, eliminar y buscar notas con etiquetas.
 * Soporta exportación a PDF y compartir notas.
 * Los datos se almacenan en Firestore bajo la colección "notes".
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/LayoutPrincipalApp';
import { useFirestore } from '@/firebase/hooks/useFirestore';
import { useFirebaseAuth } from '@/firebase/hooks/useFirebaseAuth';
import ShareModal from '@/components/modals/ModalCompartirContenido';
import { PDFService } from '@/lib/services/PDFService';
import { ShareService } from '@/lib/services/ShareService';

interface Note {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default function NotesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { data: notes, loading, error, addItem, updateItem, deleteItem } = useFirestore<Note>('notes');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Filtrar y buscar notas
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Filtro por tag
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) return false;
      
      // Búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content.toLowerCase().includes(query);
        const matchesTags = note.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }
      
      return true;
    });
  }, [notes, selectedTag, searchQuery]);

  // Obtener todos los tags únicos
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);
  
  if (authLoading) {
    return (
      <AppLayout title="Notas">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const noteToUpdate = notes.find(n => n.id === editingId);
      if (noteToUpdate) {
        const updatedNote: Partial<Note> = { 
          ...noteToUpdate, 
          title, 
          content,
        };
        
        // Solo agregar tags si hay valores
        if (tags.length > 0) {
          updatedNote.tags = tags;
        }
        
        await updateItem(editingId, updatedNote);
      }
      setEditingId(null);
    } else {
      const newNote: Partial<Note> = {
        title,
        content,
      };
      
      // Solo agregar tags si hay valores
      if (tags.length > 0) {
        newNote.tags = tags;
      }
      
      await addItem(newNote as Note);
    }
    
    setTitle('');
    setContent('');
    setTags([]);
    setShowForm(false);
  };

  const handleEdit = (note: Note) => {
    if (note.id) {
      setEditingId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setShowForm(true);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTags([]);
    setShowForm(false);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteItem(id);
    setDeleteConfirm(null);
  };

  const handleShare = (note: Note) => {
    setNoteToShare(note);
    setShareModalOpen(true);
  };

  const handleExportPDF = () => {
    PDFService.exportNotes(filteredNotes);
  };

  if (loading) {
    return (
      <AppLayout title="Notas">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando notas...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Notas">
        <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-800">Error al cargar notas: {String(error)}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Notas">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>📝</div>
            <div><p className="text-sm text-gray-500">Total de Notas</p><p className="text-2xl font-bold text-gray-900">{notes.length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🏷️</div>
            <div><p className="text-sm text-gray-500">Con Etiquetas</p><p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.tags && n.tags.length > 0).length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📚</div>
            <div><p className="text-sm text-gray-500">Etiquetas Unicas</p><p className="text-2xl font-bold text-gray-900">{allTags.length}</p></div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en tus notas..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 bg-white placeholder-gray-400 font-medium"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-3 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-bold shadow-md"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Nota
            </button>
            
            <button
              onClick={handleExportPDF}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 font-semibold border-2 border-gray-200"
              disabled={filteredNotes.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {/* Filtros por tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                !selectedTag
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={!selectedTag ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              Todas ({notes.length})
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedTag === tag
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedTag === tag ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                🏷️ {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-2 border-purple-100 animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              ✍️
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {editingId ? 'Editar Nota' : 'Nueva Nota'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📌 Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Dale un título a tu nota"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 bg-white placeholder:text-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">📝 Contenido</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400 transition-colors"
                placeholder="Escribe tu nota aquí..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🏷️ Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {['Importante', 'Ideas', 'Recordatorio', 'Trabajo', 'Personal', 'Estudio', 'Proyecto'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (tags.includes(tag)) {
                        setTags(tags.filter(t => t !== tag));
                      } else {
                        setTags([...tags, tag]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      tags.includes(tag)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tags.includes(tag) ? '✓ ' : ''}{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold shadow-lg transform hover:scale-[1.02]"
              >
                {editingId ? '💾 Actualizar' : '✨ Guardar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Grid de notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-16 text-center border-2 border-purple-100">
            <div className="text-8xl mb-6">📝</div>
            <p className="text-gray-600 text-xl font-semibold">
              {searchQuery || selectedTag
                ? 'No se encontraron resultados'
                : 'No hay notas guardadas'}
            </p>
            <p className="text-gray-500 mt-2">
              {!searchQuery && !selectedTag && '¡Crea tu primera nota!'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all flex flex-col border-2 border-transparent hover:border-purple-200 transform hover:scale-[1.02]"
            >
              <h4 className="font-bold text-gray-900 mb-3 text-xl">{note.title}</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-4 flex-1 leading-relaxed">{note.content}</p>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                    >
                      🏷️ {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <span className="text-xs text-gray-500 font-medium">
                  📅 {note.createdAt ? new Date(note.createdAt).toLocaleDateString('es-ES') : 'Hoy'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleShare(note)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Compartir"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setDeleteConfirm(note.id || null)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirmación de eliminación */}
              {deleteConfirm === note.id && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 mb-3 font-semibold">¿Eliminar esta nota?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => note.id && handleDeleteNote(note.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors font-semibold"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de compartir */}
      {noteToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setNoteToShare(null);
          }}
          title={noteToShare.title}
          content={ShareService.generateNoteShareText(noteToShare)}
          type="note"
        />
      )}
    </AppLayout>
  );
}
