import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const PAGE_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'performance', label: 'Performance' },
  { value: 'revenue', label: 'Revenue' }
];

const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdminCreateUserAccountPageComponent = () => {
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
  const adminBaseUrl = useMemo(() => {
    const normalized = API_BASE_URL.replace(/\/?api\/?$/, '');
    return normalized === API_BASE_URL ? '' : normalized;
  }, []);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchInput = useDebouncedValue(searchInput, 350);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [linkForm, setLinkForm] = useState({ page: 'dashboard', link: '' });
  const [linkStatus, setLinkStatus] = useState({ type: null, message: '' });
  const [newUserForm, setNewUserForm] = useState({ email: '', mobileNumber: '', password: '' });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userStatus, setUserStatus] = useState({ type: null, message: '' });
  const searchAbortRef = useRef(null);
  const autoSearchQueryRef = useRef('');

  const resolveAdminToken = useCallback(
    () => localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '',
    []
  );

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminProfile');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    redirectToLogin();
  }, [redirectToLogin]);

  const resetSearchState = useCallback(() => {
    setSearchResults([]);
    setSelectedUser(null);
    setLinkForm({ page: 'dashboard', link: '' });
  }, []);

  const performSearch = useCallback(
    async (rawQuery, { silent = false, focusEmail } = {}) => {
      const trimmedQuery = rawQuery.trim();

      if (!trimmedQuery) {
        if (!silent) {
          setSearchMessage('Please enter an email or mobile number to search.');
        }

        resetSearchState();
        setSearching(false);
        return [];
      }

      const token = resolveAdminToken();

      if (!token) {
        redirectToLogin();
        return [];
      }

      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }

      const controller = new AbortController();
      searchAbortRef.current = controller;

      if (!silent) {
        setSearchMessage('');
        setSearching(true);
      }

      try {
        const response = await fetch(
          `${adminBaseUrl}/admin/usersearch?query=${encodeURIComponent(trimmedQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          redirectToLogin();
          return [];
        }

        if (!response.ok) {
          throw new Error(data.message || 'Unable to search users.');
        }

        const users = Array.isArray(data.users) ? data.users : [];

        if (users.length === 0) {
          resetSearchState();

          if (!silent) {
            setSearchMessage('No users found. You can create a new user below.');
          }

          return [];
        }

        setSearchResults(users);
        const normalizedFocus = focusEmail?.toLowerCase();
        const nextSelected = normalizedFocus
          ? users.find((user) => user.email.toLowerCase() === normalizedFocus)
          : users[0];
        setSelectedUser(nextSelected || users[0]);
        setLinkForm({ page: 'dashboard', link: '' });

        return users;
      } catch (error) {
        if (error.name === 'AbortError') {
          return [];
        }

        if (!silent) {
          setSearchMessage(error.message);
        }

        return [];
      } finally {
        if (!silent) {
          setSearching(false);
        }

        if (searchAbortRef.current === controller) {
          searchAbortRef.current = null;
        }
      }
    },
    [adminBaseUrl, redirectToLogin, resetSearchState, resolveAdminToken]
  );

  useEffect(() => {
    const trimmed = debouncedSearchInput.trim();

    if (!trimmed) {
      setSearchMessage('');
      resetSearchState();
      return;
    }

    if (trimmed.length < 3) {
      return;
    }

    if (autoSearchQueryRef.current === trimmed.toLowerCase()) {
      return;
    }

    autoSearchQueryRef.current = trimmed.toLowerCase();
    performSearch(trimmed, { silent: true });
  }, [debouncedSearchInput, performSearch, resetSearchState]);

  useEffect(
    () => () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    },
    []
  );

  const handleSearchInputChange = useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  const handleSearch = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmed = searchInput.trim();
      setSearchMessage('');
      setSearching(true);
      autoSearchQueryRef.current = trimmed.toLowerCase();
      await performSearch(trimmed, { silent: false });
      setSearching(false);
    },
    [performSearch, searchInput]
  );

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
    setLinkForm({ page: 'dashboard', link: '' });
    setLinkStatus({ type: null, message: '' });
  }, []);

  const handleLinkChange = useCallback((event) => {
    const { name, value } = event.target;
    setLinkForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const refreshSelectedUser = useCallback(
    async (email) => {
      if (!email) {
        return;
      }

      await performSearch(email, { silent: true, focusEmail: email });
    },
    [performSearch]
  );

  const handleSaveLink = useCallback(
    async (event) => {
      event.preventDefault();

      if (!selectedUser) {
        setLinkStatus({ type: 'error', message: 'Please select a user first.' });
        return;
      }

      const token = resolveAdminToken();

      if (!token) {
        redirectToLogin();
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
        setLinkForm((prev) => ({ page: prev.page, link: '' }));
        refreshSelectedUser(selectedUser.email);
      } catch (error) {
        setLinkStatus({ type: 'error', message: error.message });
      }
    },
    [adminBaseUrl, linkForm.page, linkForm.link, redirectToLogin, refreshSelectedUser, resolveAdminToken, selectedUser]
  );

  const handleNewUserChange = useCallback((event) => {
    const { name, value } = event.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCreateUser = useCallback(
    async (event) => {
      event.preventDefault();

      const token = resolveAdminToken();

      if (!token) {
        redirectToLogin();
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

        const responseEmail = (data.email || createdEmail).toLowerCase();
        setUserStatus({ type: 'success', message: 'User account created successfully.' });
        setNewUserForm({ email: '', mobileNumber: '', password: '' });
        setSearchInput(responseEmail);
        autoSearchQueryRef.current = responseEmail;
        await performSearch(responseEmail, { silent: true, focusEmail: responseEmail });
      } catch (error) {
        setUserStatus({ type: 'error', message: error.message });
      } finally {
        setCreatingUser(false);
      }
    },
    [adminBaseUrl, newUserForm.email, newUserForm.mobileNumber, newUserForm.password, performSearch, redirectToLogin, resolveAdminToken]
  );

  const existingLinks = useMemo(() => selectedUser?.links || [], [selectedUser]);

  return (
    <div className="admin-console-page">
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
                <button
                  type="button"
                  className="primary-button admin-console-logout-btn"
                  onClick={handleLogout}
                >
                  <FiLogOut aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-button admin-console-logout-btn"
                onClick={handleLogout}
              >
                <FiLogOut aria-hidden="true" />
                <span>Logout</span>
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
                value={searchInput}
                onChange={handleSearchInputChange}
                required
              />
            </div>
            <button type="submit" className="primary-button" disabled={searching}>
              {searching ? 'Searching…' : 'Search Users'}
            </button>
            {searchMessage && (
              <p
                className={`status-message ${/unable|error/i.test(searchMessage) ? 'error' : 'info'}`}
              >
                {searchMessage}
              </p>
            )}
          </form>
          {searchResults.length > 0 && (
            <div className="admin-console-results">
              {searchResults.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  className={`admin-user-chip ${selectedUser?.email === user.email ? 'active' : ''}`}
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

              <button type="submit" className="primary-button">
                Save Link
              </button>

              {linkStatus.message && (
                <p className={`status-message ${linkStatus.type}`}>{linkStatus.message}</p>
              )}
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
              <div className="password-field">
                <input
                  id="newPassword"
                  name="password"
                  type={showNewUserPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={newUserForm.password}
                  onChange={handleNewUserChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewUserPassword((prev) => !prev)}
                  aria-label={showNewUserPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewUserPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={creatingUser}>
              {creatingUser ? 'Creating…' : 'Create User'}
            </button>

            {userStatus.message && (
              <p className={`status-message ${userStatus.type}`}>{userStatus.message}</p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default memo(AdminCreateUserAccountPageComponent);
