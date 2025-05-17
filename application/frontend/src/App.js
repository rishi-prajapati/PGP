import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [healthStatus, setHealthStatus] = useState("Checking...");

  useEffect(() => {
    fetchNotes();
    checkHealth();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/notes"); 
      setNotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await axios.get("http://localhost:8080/health");
      setHealthStatus(response.data?.status || "Healthy");
    } catch (error) {
      console.error("Health check failed:", error);
      setHealthStatus("Unhealthy");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    const newNote = {
      text: noteText,
      completed: false,
    };

    try {
      const response = await axios.post("http://localhost:8080/notes", newNote);
      setNotes([...notes, response.data]);
      setNoteText("");
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    const noteToUpdate = notes.find((note) => note.id === id);
    if (!noteToUpdate) return;

    const updatedNote = { ...noteToUpdate, completed: !currentStatus };

    try {
      await axios.put(`http://localhost:8080/notes/${id}`, updatedNote);
      setNotes(notes.map((note) =>
        note.id === id ? { ...note, completed: !currentStatus } : note
      ));
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notes/${id}`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleEditNote = (id, text) => {
    setEditingNoteId(id);
    setEditingText(text);
  };

  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;

    const updatedNote = { text: editingText };

    try {
      await axios.put(`http://localhost:8080/notes/${id}`, updatedNote);
      setNotes(notes.map((note) =>
        note.id === id ? { ...note, text: editingText } : note
      ));
      setEditingNoteId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error saving edited note:", err);
    }
  };

  return (
    <div className="container">
      <h1 className="heading">📝 Note Taking App</h1>
      <div className="health-check">
        <strong>Health:</strong> {healthStatus}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your note here..."
          className="input"
        />
        <button onClick={handleAddNote} className="add-button">
          Add Note
        </button>
      </div>

      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.id} className="note-item">
            {editingNoteId === note.id ? (
              <input
                className="input"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(note.id)}
              />
            ) : (
              <span
                onClick={() => handleToggleComplete(note.id, note.completed)}
                className={`note-text ${note.completed ? "completed" : ""}`}
              >
                {note.text}
              </span>
            )}

            <div className="action-buttons">
              {editingNoteId === note.id ? (
                <button
                  onClick={() => handleSaveEdit(note.id)}
                  className="icon-button edit-button"
                  title="Save"
                >
                  💾
                </button>
              ) : (
                <button
                  onClick={() => handleEditNote(note.id, note.text)}
                  className="icon-button edit-button"
                  title="Edit"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="icon-button delete-button"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
