export const storageService = {
  saveNotes(notes: string) {
    localStorage.setItem('studysathi_notes', notes);
  },
  getNotes() {
    return localStorage.getItem('studysathi_notes') || '';
  },
  saveSession(id: string, data: any) {
    localStorage.setItem(`studysathi_session_${id}`, JSON.stringify(data));
  },
  getSession(id: string) {
    const data = localStorage.getItem(`studysathi_session_${id}`);
    return data ? JSON.parse(data) : null;
  },
  clear() {
    localStorage.removeItem('studysathi_notes');
  }
};
