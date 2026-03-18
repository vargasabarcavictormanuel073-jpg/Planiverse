/**
 * PDFService - Servicio para exportar contenido a PDF
 * Usa jsPDF para generar documentos PDF desde el navegador
 */

import { jsPDF } from 'jspdf';

interface Task {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
  // Teacher-specific fields
  group?: string;
  learningObjective?: string;
  resources?: string;
  estimatedDuration?: string;
  // Student-specific fields
  subject?: string;
  tags?: string[];
}

interface Note {
  title: string;
  content: string;
  tags?: string[];
  createdAt?: Date;
}

export class PDFService {
  /**
   * Exporta una lista de tareas a PDF
   */
  static exportTasks(tasks: Task[], role: string = 'student'): void {
    const doc = new jsPDF();
    const title = role === 'teacher' ? 'Planeaciones' : 'Tareas';
    
    // Título
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Fecha de exportación
    doc.setFontSize(10);
    doc.text(`Exportado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    
    let yPos = 45;
    
    tasks.forEach((task, index) => {
      // Verificar si necesitamos nueva página
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Título de la tarea
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${task.title}`, 20, yPos);
      yPos += 8;
      
      // Detalles
      doc.setFontSize(10);
      
      if (role === 'teacher') {
        if (task.group) {
          doc.text(`Grupo: ${task.group}`, 25, yPos);
          yPos += 6;
        }
        if (task.learningObjective) {
          const lines = doc.splitTextToSize(`Objetivo: ${task.learningObjective}`, 160);
          doc.text(lines, 25, yPos);
          yPos += lines.length * 6;
        }
        if (task.resources) {
          const lines = doc.splitTextToSize(`Recursos: ${task.resources}`, 160);
          doc.text(lines, 25, yPos);
          yPos += lines.length * 6;
        }
        if (task.estimatedDuration) {
          doc.text(`Duración: ${task.estimatedDuration}`, 25, yPos);
          yPos += 6;
        }
      } else {
        if (task.subject) {
          doc.text(`Materia: ${task.subject}`, 25, yPos);
          yPos += 6;
        }
      }
      
      doc.text(`Prioridad: ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}`, 25, yPos);
      yPos += 6;
      doc.text(`Fecha: ${task.dueDate}`, 25, yPos);
      yPos += 6;
      doc.text(`Estado: ${task.completed ? 'Completada' : 'Pendiente'}`, 25, yPos);
      yPos += 6;
      
      // Tags si existen
      if (task.tags && task.tags.length > 0) {
        doc.text(`Etiquetas: ${task.tags.join(', ')}`, 25, yPos);
        yPos += 6;
      }
      
      yPos += 5; // Espacio entre tareas
    });
    
    // Guardar PDF
    doc.save(`${title.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Exporta una lista de notas a PDF
   */
  static exportNotes(notes: Note[]): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Notas', 20, 20);
    
    // Fecha de exportación
    doc.setFontSize(10);
    doc.text(`Exportado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    
    let yPos = 45;
    
    notes.forEach((note, index) => {
      // Verificar si necesitamos nueva página
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Título de la nota
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${note.title}`, 20, yPos);
      yPos += 8;
      
      // Contenido
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(note.content, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6;
      
      // Tags si existen
      if (note.tags && note.tags.length > 0) {
        yPos += 3;
        doc.text(`Etiquetas: ${note.tags.join(', ')}`, 20, yPos);
        yPos += 6;
      }
      
      // Fecha
      if (note.createdAt) {
        yPos += 3;
        doc.text(`Creada: ${new Date(note.createdAt).toLocaleDateString('es-ES')}`, 20, yPos);
        yPos += 6;
      }
      
      yPos += 8; // Espacio entre notas
    });
    
    // Guardar PDF
    doc.save(`notas_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
