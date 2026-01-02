import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Note } from '../lib/supabase';

import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { Plus, LogOut, Search, StickyNote, Grid, List, Layout, Moon, Sun, Sparkles, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('grid');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize') || '16'));

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (title: string, content: string) => {
    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', editingNote.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('notes')
          .insert([{ title, content, user_id: user.id }]);
        if (error) throw error;
      }
      setIsEditorOpen(false);
      setEditingNote(null);
      fetchNotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      fetchNotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.5rem' }}>
          <StickyNote size={40} className="text-primary" />
          Notes
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="toolbar">
            <div className="toggle-group">
              <button
                className={`toggle-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light Mode"
              >
                <Sun size={18} />
              </button>
              <button
                className={`toggle-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
              >
                <Moon size={18} />
              </button>
              <button
                className={`toggle-item ${theme === 'premium' ? 'active' : ''}`}
                onClick={() => setTheme('premium')}
                title="Premium Mode"
              >
                <Sparkles size={18} />
              </button>
            </div>

            <div className="toggle-group">
              <button
                className={`toggle-item ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                className={`toggle-item ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                className={`toggle-item ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                <Layout size={18} />
              </button>
            </div>

            <div className="toggle-group">
              <div className="toggle-item" style={{ gap: '8px', cursor: 'default' }}>
                <Type size={18} />
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  style={{ width: '80px', height: '4px', padding: 0 }}
                />
                <span style={{ fontSize: '0.75rem', width: '24px' }}>{fontSize}</span>
              </div>
            </div>
          </div>

          <button
            style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              setEditingNote(null);
              setIsEditorOpen(true);
            }}
          >
            <Plus size={20} />
            New Note
          </button>
          <button className="secondary-btn" style={{ width: 'auto' }} onClick={() => supabase.auth.signOut()}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
        <input
          style={{ paddingLeft: '48px' }}
          type="text"
          placeholder="Search your notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>Loading notes...</div>
      ) : (
        <motion.div layout className={`notes-grid view-${viewMode}`}>
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => {
                  setEditingNote(n);
                  setIsEditorOpen(true);
                }}
                onDelete={handleDeleteNote}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredNotes.length === 0 && !loading && (
        <div className="text-center" style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>No notes found. Create your first one!</p>
        </div>
      )}

      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onClose={() => {
              setIsEditorOpen(false);
              setEditingNote(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
