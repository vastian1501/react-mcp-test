import React, { useState, useEffect } from 'react';
import type { Note } from '../lib/supabase';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { X, Save, Eye, Edit2, Bold, Italic, Heading2, Code, List as ListIcon } from 'lucide-react';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (title: string, content: string, is_public: boolean) => void;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [is_public, setIsPublic] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.is_public || false);
    } else {
      setTitle('');
      setContent('');
      setIsPublic(false);
    }
  }, [note]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);

    setContent(newText);

    // Devolvemos el foco y ajustamos la selección
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, content, is_public);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ marginBottom: 0 }}>Content (Markdown supported)</label>
              {mode === 'edit' && (
                <div className="markdown-toolbar" style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" className="icon-btn" onClick={() => insertMarkdown('**', '**')} title="Bold"><Bold size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => insertMarkdown('*', '*')} title="Italic"><Italic size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => insertMarkdown('## ')} title="Heading 2"><Heading2 size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => insertMarkdown('`', '`')} title="Code"><Code size={16} /></button>
                  <button type="button" className="icon-btn" onClick={() => insertMarkdown('- ')} title="List"><ListIcon size={16} /></button>
                </div>
              )}
            </div>
            {mode === 'edit' ? (
              <textarea
                ref={textareaRef}
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
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={is_public}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: 'auto', marginBottom: 0 }}
              />
              Public Note (Visible to everyone)
            </label>
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
