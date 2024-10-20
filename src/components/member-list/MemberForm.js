import React, { useState, useEffect } from 'react';

export const MemberForm = ({ initialData, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [rating, setRating] = useState(1);
  const [activities, setActivities] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAge(initialData.age);
      setRating(initialData.rating);
      setActivities(initialData.activities.join(', '));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newActivities = activities ? activities.trim().split(',').map(activity => activity.trim()) : [];
    const memberData = { name, age: parseInt(age), rating: parseInt(rating), activities: newActivities };
    onSave(memberData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="mb-3">
        <label className="form-label">Name:</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Age:</label>
        <input
          type="number"
          className="form-control"
          value={age}
          min={0}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Rating:</label>
        <select
          className="form-select"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Activities (comma-separated):</label>
        <input
          type="text"
          className="form-control"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};
