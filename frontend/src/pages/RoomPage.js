import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  roomService,
  departmentService,
  programmeService,
  blockService,
} from "../services/api";
import "./RoomPage.css";

const RoomPage = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    department: "",
    programme: "",
    block: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, deptRes, progRes, blockRes] = await Promise.all([
        roomService.getAll(),
        departmentService.getAll(),
        programmeService.getAll(),
        blockService.getAll(),
      ]);
      setRooms(roomRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);
      setBlocks(blockRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await roomService.update(editingId, formData);
      } else {
        await roomService.create(formData);
      }
      setFormData({
        roomNumber: "",
        department: "",
        programme: "",
        block: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError("Failed to save room");
    }
  };

  const handleEdit = (room) => {
    setFormData({
      ...room,
      department: room.department?._id || room.department,
      programme: room.programme?._id || room.programme,
      block: room.block?._id || room.block,
    });
    setEditingId(room._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await roomService.delete(id);
        fetchData();
      } catch (err) {
        setError("Failed to delete room");
      }
    }
  };

  if (loading)
    return (
      <div className="room-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="room-page">
      <div className="room-page-header">
        <h1>Room Management</h1>
        {user?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-action-btn"
          >
            {showForm ? "Cancel" : "Add Room"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && user?.role === "SuperAdmin" && (
          <form onSubmit={handleSubmit} className="room-form-card side-form-card">
          <div className="form-grid-2">
            <div className="form-group-item">
              <label>Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                required
                placeholder="e.g. 101"
              />
            </div>
            <div className="form-group-item">
              <label>Block</label>
              <select
                value={formData.block}
                onChange={(e) =>
                  setFormData({ ...formData, block: e.target.value })
                }
                required
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block._id} value={block._id}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group-item">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group-item">
              <label>Programme</label>
              <select
                value={formData.programme}
                onChange={(e) =>
                  setFormData({ ...formData, programme: e.target.value })
                }
                required
              >
                <option value="">Select Programme</option>
                {programmes.map((prog) => (
                  <option key={prog._id} value={prog._id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="primary-action-btn"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {editingId ? "Update Room" : "Create Room"}
          </button>
        </form>
      )}

        <div className="room-table-card">
        <div className="table-wrapper">
          <table className="room-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Department</th>
                <th>Programme</th>
                <th>Block</th>
                {user?.role === "SuperAdmin" && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room._id}>
                    <td>
                      <strong>{room.roomNumber}</strong>
                    </td>
                    <td>{room.department?.name || "-"}</td>
                    <td>{room.programme?.name || "-"}</td>
                    <td>{room.block?.name || "-"}</td>
                    {user?.role === "SuperAdmin" && (
                      <td style={{ textAlign: "right" }}>
                        <div className="room-actions">
                          <button
                            onClick={() => handleEdit(room)}
                            className="edit-action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room._id)}
                            className="delete-action-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user?.role === "SuperAdmin" ? 5 : 4}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    No rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
