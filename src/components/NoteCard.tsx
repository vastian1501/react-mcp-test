import React from 'react';
import type { Note } from '../lib/supabase';

import { Trash2, Edit3, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
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
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>

      <div className="note-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} />
          {formatDate(note.created_at)}
        </div>
        <div className="actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" onClick={() => onEdit(note)}>
            <Edit3 size={18} />
          </button>
          <button className="icon-btn delete" onClick={() => onDelete(note.id)}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
