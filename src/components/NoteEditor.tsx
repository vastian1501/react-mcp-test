import React, { useState, useEffect } from 'react';
import type { Note } from '../lib/supabase';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { X, Save, Eye, Edit2 } from 'lucide-react';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, content);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content"
        style={{ maxWidth: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="toggle-group" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`toggle-item ${mode === 'edit' ? 'active' : ''}`}
                onClick={() => setMode('edit')}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                type="button"
                className={`toggle-item ${mode === 'preview' ? 'active' : ''}`}
                onClick={() => setMode('preview')}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
            <button className="icon-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a title..."
              required
            />
          </div>

          <div className="input-group">
            <label>Content (Markdown supported)</label>
            {mode === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Use Markdown for formatting!"
                style={{ minHeight: '300px' }}
              />
            ) : (
              <div
                className="markdown-content"
                style={{
                  minHeight: '324px',
                  padding: '16px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  overflowY: 'auto',
                  marginBottom: '24px'
                }}
              >
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview</p>
                )}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={20} />
              Save Note
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
