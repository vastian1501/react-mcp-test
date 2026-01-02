import React from 'react';
import type { Note } from '../lib/supabase';
import { Trash2, Edit3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteCardProps {
  note: Note;
  currentUserId: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, currentUserId, onEdit, onDelete }) => {
  const isOwner = currentUserId === note.user_id;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="note-card"
      onClick={() => onEdit(note)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3 className="note-title" style={{ margin: 0 }}>{note.title}</h3>
        {note.is_public && (
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            background: 'rgba(52, 211, 153, 0.1)',
            color: '#34d399',
            borderRadius: '12px',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            whiteSpace: 'nowrap'
          }}>
            Public
          </span>
        )}
      </div>
      <div className="note-content markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>

      <div className="note-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            {formatDate(note.created_at)}
          </div>
          {!isOwner && note.author_email && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              By: {note.author_email}
            </div>
          )}
        </div>
        {isOwner && (
          <div className="actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => onEdit(note)}>
              <Edit3 size={18} />
            </button>
            <button className="icon-btn delete" onClick={() => onDelete(note.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
