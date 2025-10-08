import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resolveAdminBaseUrl from '../utils/resolveAdminBaseUrl.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const PAGE_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'performance', label: 'Performance' },
  { value: 'revenue', label: 'Revenue' }
];

const AdminCreateUserAccountPage = () => {
  const navigate = useNavigate();
  const adminProfile = useMemo(() => {
    const storedProfile =
      localStorage.getItem('adminProfile') || sessionStorage.getItem('adminProfile');

    if (!storedProfile) {
      return null;
    }

    try {
      return JSON.parse(storedProfile);
    } catch (error) {
      console.error('Unable to parse admin profile', error);
      return null;
    }
  }, []);
  const adminBaseUrl = useMemo(() => resolveAdminBaseUrl(API_BASE_URL), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [linkForm, setLinkForm] = useState({ page: 'dashboard', link: '' });
  const [linkStatus, setLinkStatus] = useState({ type: null, message: '' });
  const [newUserForm, setNewUserForm] = useState({ email: '', mobileNumber: '', password: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userStatus, setUserStatus] = useState({ type: null, message: '' });

  const resolveAdminToken = () =>
    localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminProfile');
    navigate('/admin/login', { replace: true });
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearching(true);
    setSearchMessage('');
    setSearchResults([]);
    setSelectedUser(null);

    const query = searchQuery.trim();

    if (!query) {
      setSearchMessage('Please enter an email or mobile number to search.');
      setSearching(false);
      return;
    }

    const token = resolveAdminToken();

    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    try {
      const response = await fetch(
        `${adminBaseUrl}/admin/usersearch?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to search users.');
      }

      if (!data.users || data.users.length === 0) {
        setSearchMessage('No users found. You can create a new user below.');
        return;
      }

      setSearchResults(data.users);
      setSelectedUser(data.users[0]);
      setLinkForm({ page: 'dashboard', link: '' });
    } catch (error) {
      setSearchMessage(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setLinkForm({ page: 'dashboard', link: '' });
    setLinkStatus({ type: null, message: '' });
  };

  const handleLinkChange = (event) => {
    const { name, value } = event.target;
    setLinkForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const refreshSelectedUser = async (email) => {
    const token = resolveAdminToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${adminBaseUrl}/admin/usersearch?query=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.users && data.users.length > 0) {
        const updatedUser = data.users.find((user) => user.email === email) || data.users[0];
        setSelectedUser(updatedUser);
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Unable to refresh selected user', error);
    }
  };

  const handleSaveLink = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
      setLinkStatus({ type: 'error', message: 'Please select a user first.' });
      return;
    }

    const token = resolveAdminToken();

    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    setLinkStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${adminBaseUrl}/admin/dashboardlinks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: selectedUser.email,
          page: linkForm.page,
          link: linkForm.link
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save link.');
      }

      setLinkStatus({ type: 'success', message: 'Dashboard link saved successfully.' });
      setLinkForm({ page: linkForm.page, link: '' });
      refreshSelectedUser(selectedUser.email);
    } catch (error) {
      setLinkStatus({ type: 'error', message: error.message });
    }
  };

  const handleNewUserChange = (event) => {
    const { name, value } = event.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    const token = resolveAdminToken();

    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    setUserStatus({ type: null, message: '' });
    setCreatingUser(true);

    try {
      const createdEmail = newUserForm.email.trim();

      if (!createdEmail) {
        setUserStatus({ type: 'error', message: 'Email is required to create a user.' });
        setCreatingUser(false);
        return;
      }

      const mobileNumber = newUserForm.mobileNumber.trim();
      const response = await fetch(`${adminBaseUrl}/admin/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: createdEmail,
          mobileNumber: mobileNumber || null,
          password: newUserForm.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create user.');
      }

      setUserStatus({ type: 'success', message: 'User account created successfully.' });
      const responseEmail = data.email || createdEmail;
      setNewUserForm({ email: '', mobileNumber: '', password: '' });
      setSearchQuery(responseEmail);
      refreshSelectedUser(responseEmail);
    } catch (error) {
      setUserStatus({ type: 'error', message: error.message });
    } finally {
      setCreatingUser(false);
    }
  };

  const existingLinks = selectedUser?.links || [];

  return (
    <div className="admin-console">
      <header className="admin-console-header">
        <div>
          <h1>Admin Console</h1>
          <p>Manage user accounts and dashboard links.</p>
        </div>
        <div className="admin-console-profile">
          {adminProfile ? (
            <>
              <span>{adminProfile.adminName || adminProfile.email}</span>
              <button type="button" className="secondary-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      <section className="admin-console-section">
        <h2>Find a User</h2>
        <form className="admin-console-form" onSubmit={handleSearch}>
          <div className="form-control">
            <label htmlFor="search">Email or Mobile</label>
            <input
              id="search"
              type="text"
              placeholder="Search by email or mobile"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="primary-button" disabled={searching}>
            {searching ? 'Searching…' : 'Search Users'}
          </button>
        </form>
        {searchMessage && (
          <p
            className={`status-message ${/unable|error/i.test(searchMessage) ? 'error' : 'info'}`}
          >
            {searchMessage}
          </p>
        )}
        {searchResults.length > 0 && (
          <div className="admin-console-results">
            {searchResults.map((user) => (
              <button
                type="button"
                key={user.id}
                className={`admin-user-chip ${
                  selectedUser?.email === user.email ? 'active' : ''
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <span>{user.email}</span>
                {user.mobileNumber && <small>{user.mobileNumber}</small>}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedUser && (
        <section className="admin-console-section">
          <h2>Dashboard Links for {selectedUser.email}</h2>
          <div className="admin-links-list">
            {existingLinks.length > 0 ? (
              existingLinks.map((item) => (
                <div key={`${item.page}-${item.link}`} className="admin-link-card">
                  <span className="admin-link-page">{item.page}</span>
                  <a href={item.link} target="_blank" rel="noreferrer" className="admin-link-url">
                    {item.link}
                  </a>
                </div>
              ))
            ) : (
              <p className="status-message info">No links assigned yet.</p>
            )}
          </div>

          <form className="admin-console-form" onSubmit={handleSaveLink}>
            <div className="form-control">
              <label htmlFor="page">Page</label>
              <select id="page" name="page" value={linkForm.page} onChange={handleLinkChange}>
                {PAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="link">Link URL</label>
              <input
                id="link"
                name="link"
                type="url"
                placeholder="https://example.com/dashboard"
                value={linkForm.link}
                onChange={handleLinkChange}
                required
              />
            </div>

            {linkStatus.message && (
              <p className={`status-message ${linkStatus.type}`}>{linkStatus.message}</p>
            )}

            <button type="submit" className="primary-button">
              Save Link
            </button>
          </form>
        </section>
      )}

      <section className="admin-console-section">
        <h2>Create a New User</h2>
        <form className="admin-console-form" onSubmit={handleCreateUser}>
          <div className="form-control">
            <label htmlFor="newEmail">Email</label>
            <input
              id="newEmail"
              name="email"
              type="email"
              placeholder="Enter user email"
              value={newUserForm.email}
              onChange={handleNewUserChange}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="newMobile">Mobile Number</label>
            <input
              id="newMobile"
              name="mobileNumber"
              type="text"
              placeholder="Optional mobile number"
              value={newUserForm.mobileNumber}
              onChange={handleNewUserChange}
            />
          </div>

          <div className="form-control">
            <label htmlFor="newPassword">Password</label>
            <input
              id="newPassword"
              name="password"
              type="password"
              placeholder="Create a password"
              value={newUserForm.password}
              onChange={handleNewUserChange}
              required
              minLength={6}
            />
          </div>

          {userStatus.message && (
            <p className={`status-message ${userStatus.type}`}>{userStatus.message}</p>
          )}

          <button type="submit" className="primary-button" disabled={creatingUser}>
            {creatingUser ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminCreateUserAccountPage;
