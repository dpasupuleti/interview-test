import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { Modal } from './Modal';
import { MemberForm } from './MemberForm';
import { SuccessNotification } from './SuccessNotification'
import 'bootstrap/dist/css/bootstrap.min.css';

const getData = async (setMembers, setLoading, setActivities, setRatings, filters = {}, sort = {}) => {
  try {
    setLoading(true);
    const res = await axios.get('http://localhost:4444/members', {
      params: { ...filters, ...sort }
    });
    const members = res.data;

    const activitiesSet = new Set();
    const ratingsSet = new Set();
    members.forEach(member => {
      if (member.activities) {
        member.activities.forEach(activity => activitiesSet.add(activity));
      }
      if (member.rating) {
        ratingsSet.add(member.rating);
      }
    });

    setMembers(members);
    setActivities([...activitiesSet]);
    setRatings([...ratingsSet]);
  } catch (err) {
    console.log("ERROR", err);
  } finally {
    setLoading(false);
  }
};

export const Row = memo(({ id, age, name, activities, rating, onDelete, onEdit }) => (
  <tr key={id}>
    <td>{name}</td>
    <td>{age}</td>
    <td>{rating}</td>
    <td>
      {activities.length > 0 ? activities.map((activity, i) => (
        <div key={i}>{activity}</div>
      )) : 'No Activities'}
    </td>
    <td>
      <button className="btn btn-warning me-2" onClick={() => onEdit(id)}>Edit</button>
      <button className="btn btn-danger" onClick={() => onDelete(id)}>Delete</button>
    </td>
  </tr>
));

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ name: '', rating: '', activities: '' });
  const [sort, setSort] = useState({ sortBy: '', order: '' });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activities, setActivities] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState('');

  // Debounced filter handler to avoid unnecessary API calls
  const handleFilterChange = debounce((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, 300);

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      order: prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    getData(setMembers, setLoading, setActivities, setRatings, filters, sort);
  }, [filters, sort]);

  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`http://localhost:4444/members/${id}`);
      setShowNotification(true)
      setMessage('Member deleted successfully!')
      setMembers((prev) => prev.filter((member) => member.id !== id));
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  }, []);

  const openCreateModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id) => {
    const member = members.find(m => m.id === id);
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen();
  };

  const handleSave = async (memberData) => {
    try {
      if (selectedMember) {
        await axios.patch(`http://localhost:4444/members/${selectedMember.id}`, memberData);
      } else {
        await axios.post(`http://localhost:4444/members`, memberData);
      }
      setShowNotification(true)
      setMessage(selectedMember ? 'Member edited successfully!' : 'Member added successfully!')
      getData(setMembers, setLoading, setActivities, setRatings, filters, sort);
      closeModal();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const renderSortIcon = (column) => {
    if (sort.sortBy === column) {
      return sort.order === 'asc' ? '🔼' : '🔽';
    }
    return '';
  };

  return (
    <div className="container my-4">
      <SuccessNotification
        show={showNotification}
        message={message}
        onClose={() => setShowNotification(false)}
      />
      <h1 className="mb-4">My Club's Members</h1>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={openCreateModal}>Add New Member</button>
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" onChange={(e) => handleFilterChange('rating', e.target.value)}>
            <option value="">Filter by rating</option>
            {ratings.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" onChange={(e) => handleFilterChange('activities', e.target.value)}>
            <option value="">Filter by activities</option>
            {activities.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-4">Loading members...</div>
      ) : (
        <table className="table table-striped mt-4">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Name {renderSortIcon('name')}
              </th>
              <th>Age</th>
              <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                Member Rating {renderSortIcon('rating')}
              </th>
              <th onClick={() => handleSort('activities')} style={{ cursor: 'pointer' }}>
                Activities {renderSortIcon('activities')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <Row {...member} key={member.id} onDelete={handleDelete} onEdit={openEditModal} />
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <Modal show={isModalOpen} onClose={closeModal} title={selectedMember ? 'Edit member' : 'Add member'}>
          <MemberForm
            initialData={selectedMember}
            onSave={handleSave}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default MemberList;
