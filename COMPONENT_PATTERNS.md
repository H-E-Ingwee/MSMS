# MSMS Frontend - Component Patterns & Examples

## How to Add a New Component

### Example 1: Add a Badge Atom Component

**File**: `src/components/atoms/Badge.jsx`

```jsx
import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold';
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

**Usage in a page**:
```jsx
import Badge from '../components/atoms/Badge';

export default function MyPage() {
  return <Badge variant="success">Verified</Badge>;
}
```

---

### Example 2: Add a Molecule Component (ListingCard)

**File**: `src/components/molecules/ListingCard.jsx`

```jsx
import React from 'react';
import { MapPin, CheckCircle2, Phone } from 'lucide-react';
import PrimaryButton from '../atoms/PrimaryButton';
import Card from '../atoms/Card';

export default function ListingCard({ item, onBuy, onContact }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{item.grade}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {item.location}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-green-700">KES {item.price}</p>
          <p className="text-xs text-gray-500">per kg</p>
        </div>
      </div>

      <div className="py-3 border-y border-gray-50 my-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
            {item.farmer.charAt(0)}
          </div>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
            {item.farmer}
            {item.verified && <CheckCircle2 size={14} className="text-blue-500" />}
          </p>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
          {item.qty} kg available
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <PrimaryButton className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onBuy}>
          Buy Now
        </PrimaryButton>
        <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors" onClick={onContact}>
          <Phone size={18} />
        </button>
      </div>
    </Card>
  );
}
```

**Usage in MarketplacePage**:
```jsx
import ListingCard from '../components/molecules/ListingCard';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);

  const handleBuy = (itemId) => {
    console.log('Buy item:', itemId);
    // Navigate to OrderPage
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {listings.map(item => (
        <ListingCard
          key={item.id}
          item={item}
          onBuy={() => handleBuy(item.id)}
          onContact={() => console.log('Contact:', item.farmer)}
        />
      ))}
    </div>
  );
}
```

---

### Example 3: Add an Input Atom Component

**File**: `src/components/atoms/Input.jsx`

```jsx
import React from 'react';

export default function Input({ label, type = 'text', placeholder, value, onChange, error, required, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
```

**Usage in a form**:
```jsx
import { useState } from 'react';
import Input from '../components/atoms/Input';

export default function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form>
      <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
      <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
    </form>
  );
}
```

---

### Example 4: Add a Modal Atom Component

**File**: `src/components/atoms/Modal.jsx`

```jsx
import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {actions && (
          <div className="px-6 pb-6 flex gap-3">
            {actions.map((action, idx) => (
              <button key={idx} {...action.props} className={`px-4 py-2 rounded-lg font-medium ${
                action.type === 'primary' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Usage**:
```jsx
import { useState } from 'react';
import Modal from '../components/atoms/Modal';

export default function MyPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Purchase"
        actions={[
          { label: 'Cancel', type: 'secondary', props: { onClick: () => setModalOpen(false) } },
          { label: 'Confirm', type: 'primary', props: { onClick: () => { console.log('Purchase confirmed'); setModalOpen(false); } } },
        ]}
      >
        <p>Are you sure you want to purchase 50kg of Kangeta at KES 600/kg?</p>
      </Modal>
    </>
  );
}
```

---

### Example 5: Add a Page Component

**File**: `src/pages/ProfilePage.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/atoms/SectionHeading';
import Card from '../components/atoms/Card';
import Input from '../components/atoms/Input';
import PrimaryButton from '../components/atoms/PrimaryButton';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch user profile from API
    setTimeout(() => {
      setUser({
        name: 'Joel Muchui',
        phone: '+254712345678',
        location: 'Meru Central',
        role: 'Farmer',
        verified: true,
        kra: 'A123456789B',
      });
      setFormData(user);
      setLoading(false);
    }, 300);
  }, []);

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setEditing(false);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeading title="My Profile" subtitle="View and update your profile information." />

      {!editing ? (
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-lg font-bold text-gray-800">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-lg font-bold text-gray-800">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-lg font-bold text-gray-800">{user.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-lg font-bold text-green-700">{user.role}</p>
            </div>
          </div>
          <PrimaryButton className="bg-green-600 text-white hover:bg-green-700" onClick={() => { setEditing(true); setFormData(user); }}>
            Edit Profile
          </PrimaryButton>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="flex gap-2 mt-6">
            <PrimaryButton className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={handleSave}>
              Save Changes
            </PrimaryButton>
            <PrimaryButton className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setEditing(false)}>
              Cancel
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}
```

**Add to AppRouter**:
```jsx
import ProfilePage from './pages/ProfilePage';

<Route path="/profile" element={<ProfilePage />} />
```

---

## Component Composition Patterns

### Pattern 1: Container + Presenter
```jsx
// Container (smart component)
export default function ListingContainer() {
  const [listings, setListings] = useState([]);
  
  useEffect(() => {
    getMarketListings().then(setListings);
  }, []);

  return <ListingPresenter listings={listings} />;
}

// Presenter (dumb component)
function ListingPresenter({ listings }) {
  return <div>{listings.map(item => <ListingCard key={item.id} item={item} />)}</div>;
}
```

### Pattern 2: Custom Hook for Logic
```jsx
// Hook
function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMarketListings()
      .then(setListings)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { listings, loading, error };
}

// Usage in component
export default function MyPage() {
  const { listings, loading } = useListings();
  return loading ? <p>Loading...</p> : <ListingsGrid listings={listings} />;
}
```

### Pattern 3: Compound Component
```jsx
// Parent
export default function Card({ children }) {
  return <div className="bg-white rounded-2xl p-5">{children}</div>;
}

// Subcomponents
Card.Header = ({ children }) => <div className="border-b pb-4 mb-4">{children}</div>;
Card.Body = ({ children }) => <div className="my-4">{children}</div>;
Card.Footer = ({ children }) => <div className="border-t pt-4 mt-4 flex gap-2">{children}</div>;

// Usage
<Card>
  <Card.Header><h3>Title</h3></Card.Header>
  <Card.Body><p>Content</p></Card.Body>
  <Card.Footer><button>Action</button></Card.Footer>
</Card>
```

---

## State Management Best Practices

### Use React Context for Auth
```jsx
// AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      verifyToken(token).then(setUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Use RTK Query for Data Fetching
```jsx
// services/marketApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  endpoints: builder => ({
    getListings: builder.query({
      query: () => '/api/listings',
    }),
    createListing: builder.mutation({
      query: body => ({
        url: '/api/listings',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetListingsQuery, useCreateListingMutation } = marketApi;
```

---

## Testing Component Examples

### Unit Test with RTL
```jsx
// __tests__/Badge.test.jsx
import { render, screen } from '@testing-library/react';
import Badge from '../components/atoms/Badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');
  });
});
```

---

## Accessibility Best Practices

```jsx
// Good accessibility practices
<button
  aria-label="Add to favorites"
  className="..."
  onClick={handleClick}
>
  <Heart size={24} aria-hidden="true" />
</button>

// Form with accessible labels
<label htmlFor="email" className="block text-sm font-medium">
  Email
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
  className="..."
/>
<p id="email-hint" className="text-xs text-gray-500">
  We'll never share your email.
</p>

// Semantic HTML
<nav aria-label="Main navigation">
  {navItems.map(item => <Link key={item.id} to={item.path}>{item.label}</Link>)}
</nav>
```

---

## Performance Optimization Tips

```jsx
// Memo for expensive components
const ListingCard = React.memo(({ item, onBuy }) => {
  return <Card>{/* render */}</Card>;
});

// Lazy load routes
import { lazy, Suspense } from 'react';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));

<Route path="/profile" element={<Suspense fallback={<p>Loading...</p>}><ProfilePage /></Suspense>} />

// Debounce search input
function SearchListings() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      searchListings(searchQuery).then(setResults);
    }, 300),
    []
  );

  return <input onChange={e => { setQuery(e.target.value); debouncedSearch(e.target.value); }} />;
}
```

---

## Quick Reference: File Naming Convention

- Components: PascalCase (`MyComponent.jsx`)
- Pages: PascalCase + "Page" suffix (`DashboardPage.jsx`)
- Utilities: camelCase (`formatPrice.js`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Tests: `ComponentName.test.jsx` or `__tests__/ComponentName.test.jsx`

---

For more questions, refer to the React documentation or ask the team lead.
