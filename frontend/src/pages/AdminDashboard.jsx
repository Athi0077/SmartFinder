import React, { useState, useEffect } from 'react';
import { Package, Map, Grid, Plus, Edit2, Trash2, X, Upload, ShoppingCart, Check, Clock, Truck, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'products';

  const setActiveTab = (tab) => {
    navigate(`/admin123?tab=${tab}`);
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [layout, setLayout] = useState({ rows: [], columns: [], shelves: [] });
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Product Form State
  const initialProductState = {
    name: '',
    description: '',
    image: '',
    price: '',
    category: '',
    location: { row: '', column: '', shelf: '' }
  };
  const [productForm, setProductForm] = useState(initialProductState);

  // Category Form State
  const initialCategoryState = { name: '', description: '' };
  const [categoryForm, setCategoryForm] = useState(initialCategoryState);

  // Layout Form State
  const [layoutForm, setLayoutForm] = useState({ rows: '', columns: '', shelves: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, layRes, ordRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/layout`),
        axios.get(`${API_URL}/orders`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setLayout(layRes.data);
      setOrders(ordRes.data);
      setLayoutForm({
        rows: layRes.data.rows.join(', '),
        columns: layRes.data.columns.join(', '),
        shelves: layRes.data.shelves.join(', ')
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (['row', 'column', 'shelf'].includes(name)) {
      setProductForm(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await axios.post(`${API_URL}/upload`, formData);
      setProductForm(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, productForm);
      } else {
        await axios.post(`${API_URL}/products`, productForm);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setProductForm(initialProductState);
      fetchData();
    } catch (error) {
      alert('Failed to save product.');
    }
  };

  const editProduct = (p) => {
    setEditingId(p._id);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      image: p.image || '',
      price: p.price || '',
      category: p.category?._id || p.category || '',
      location: p.location || { row: '', column: '', shelf: '' }
    });
    setIsFormOpen(true);
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchData();
    }
  };

  // --- CATEGORY HANDLERS ---
  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/categories/${editingId}`, categoryForm);
      } else {
        await axios.post(`${API_URL}/categories`, categoryForm);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setCategoryForm(initialCategoryState);
      fetchData();
    } catch (error) {
      alert('Failed to save category.');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      await axios.delete(`${API_URL}/categories/${id}`);
      fetchData();
    }
  };

  // --- LAYOUT HANDLERS ---
  const submitLayout = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        rows: layoutForm.rows.split(',').map(s => s.trim()).filter(Boolean),
        columns: layoutForm.columns.split(',').map(s => s.trim()).filter(Boolean),
        shelves: layoutForm.shelves.split(',').map(s => s.trim()).filter(Boolean),
      };
      await axios.put(`${API_URL}/layout`, payload);
      alert('Layout updated!');
      fetchData();
    } catch (error) {
      alert('Failed to update layout.');
    }
  };
  
  const resetLayout = async () => {
      if(window.confirm('Reset layout to defaults?')) {
          await axios.delete(`${API_URL}/layout`);
          fetchData();
      }
  }

  // --- ORDER HANDLERS ---
  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  // --- RENDER HELPERS ---
  const renderProductForm = () => (
    <form onSubmit={submitProduct} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input required type="text" name="name" value={productForm.name} onChange={handleProductChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea required name="description" value={productForm.description} onChange={handleProductChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" rows="2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select name="category" value={productForm.category._id || productForm.category} onChange={handleProductChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
        <input type="number" step="0.01" name="price" value={productForm.price} onChange={handleProductChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <div className="mt-1 flex items-center space-x-4">
            <input 
              type="text" 
              name="image" 
              value={productForm.image} 
              onChange={handleProductChange} 
              placeholder="https://example.com/image.jpg"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md" 
            />
            {productForm.image && <img src={productForm.image} alt="Preview" className="h-10 w-10 object-cover rounded shadow-sm border border-gray-200" />}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Row</label>
          <select required name="row" value={productForm.location.row} onChange={handleProductChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
            <option value="">Select</option>
            {layout.rows?.map(r => <option key={r} value={r}>{r}</option>)}
            {/* Automatically append Wall-X options based on standard rows */}
            {layout.rows && Array.from({ length: Math.max(0, layout.rows.filter(r => !r.toLowerCase().startsWith('wall')).length - 1) }).map((_, i) => (
              !layout.rows.includes(`Wall-${i+1}`) && <option key={`Wall-${i+1}`} value={`Wall-${i+1}`}>Wall-{i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Column</label>
          <select required name="column" value={productForm.location.column} onChange={handleProductChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
            <option value="">Select</option>
            {layout.columns?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shelf</label>
          <select required name="shelf" value={productForm.location.shelf} onChange={handleProductChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
             <option value="">Select</option>
             {layout.shelves?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-3">
        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md text-gray-700">Cancel</button>
        <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
      </div>
    </form>
  );

  const renderCategoryForm = () => (
    <form onSubmit={submitCategory} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input required type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
      </div>
      <div className="pt-4 flex justify-end space-x-3">
        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md text-gray-700">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 shrink-0 overflow-y-auto">
        <div className="space-y-1">
          <button onClick={() => setActiveTab('products')} className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'products' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Package className={`${activeTab === 'products' ? 'text-primary-500' : 'text-gray-400'} mr-3 h-6 w-6`} /> Products
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'categories' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Grid className={`${activeTab === 'categories' ? 'text-primary-500' : 'text-gray-400'} mr-3 h-6 w-6`} /> Categories
          </button>
          <button onClick={() => setActiveTab('layout')} className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'layout' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Map className={`${activeTab === 'layout' ? 'text-primary-500' : 'text-gray-400'} mr-3 h-6 w-6`} /> Store Layout
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ShoppingCart className={`${activeTab === 'orders' ? 'text-primary-500' : 'text-gray-400'} mr-3 h-6 w-6`} /> Online Orders
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{activeTab} Management</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {activeTab === 'products' && (
              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            )}
            {activeTab !== 'layout' && activeTab !== 'orders' && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setProductForm(initialProductState);
                  setCategoryForm(initialCategoryState);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm md:text-base w-full sm:w-auto shrink-0"
              >
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Add {activeTab.slice(0,-1)}
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow rounded-md">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : activeTab === 'products' ? (
            <ul className="divide-y divide-gray-200">
              {products
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => (
                <li key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <img src={p.image} alt="" className="h-12 w-12 rounded object-cover bg-gray-100" />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">Loc: {p.location?.row}-{p.location?.column}-{p.location?.shelf} | Cat: {p.category?.name}</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => editProduct(p)} className="text-indigo-600"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => deleteProduct(p._id)} className="text-red-600"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : activeTab === 'categories' ? (
            <ul className="divide-y divide-gray-200">
              {categories.map((c) => (
                <li key={c._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.description}</div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => { setEditingId(c._id); setCategoryForm(c); setIsFormOpen(true); }} className="text-indigo-600"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => deleteCategory(c._id)} className="text-red-600"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : activeTab === 'orders' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">ID: {order._id.substring(order._id.length - 8)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.mobileNo}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{order.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{order.items.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={submitLayout} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rows (comma separated)</label>
                  <input type="text" value={layoutForm.rows} onChange={e => setLayoutForm({...layoutForm, rows: e.target.value})} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" placeholder="A, B, C, Produce-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Columns (comma separated)</label>
                  <input type="text" value={layoutForm.columns} onChange={e => setLayoutForm({...layoutForm, columns: e.target.value})} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" placeholder="1, 2, 3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shelves (comma separated)</label>
                  <input type="text" value={layoutForm.shelves} onChange={e => setLayoutForm({...layoutForm, shelves: e.target.value})} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" placeholder="Top, Middle, Bottom" />
                </div>
                <div className="pt-4 space-x-3">
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Update Layout Details</button>
                  <button type="button" onClick={resetLayout} className="px-4 py-2 bg-red-600 text-white rounded-md">Reset to Default</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-white z-10">
                <h3 className="text-lg font-medium">{editingId ? 'Edit' : 'Add'} {activeTab.slice(0,-1)}</h3>
                <button onClick={() => setIsFormOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {activeTab === 'products' ? renderProductForm() : renderCategoryForm()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
