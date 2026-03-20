"use client";

import { useEffect, useState } from "react";
import { Modal, ConfirmDialog } from "@/components/common/Modal";
import type { Product } from "@/types/domain";
import { adminService, type AdminCategory } from "@/services/admin.service";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stock: 0,
    categoryId: "",
    imageUrl: "",
    description: ""
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([adminService.listProducts(), adminService.listCategories()])
      .then(([productsRes, categoriesRes]) => {
        if (!active) return;
        setProducts(productsRes.docs || []);
        setCategories(categoriesRes || []);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Lỗi khi tải dữ liệu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function stockBadge(stock: number) {
    if (stock <= 0) return <span className="status-chip status-chip--danger">Hết hàng</span>;
    if (stock <= 10) return <span className="status-chip status-chip--warning">Sắp hết</span>;
    return <span className="status-chip status-chip--success">Còn hàng</span>;
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        categoryId: product.category?.id || "",
        imageUrl: product.imageUrl || "",
        description: product.description || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: 0,
        stock: 0,
        categoryId: categories.length > 0 ? categories[0]?.id : "",
        imageUrl: "",
        description: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    if (!selectedCategory) {
      setError("Vui lòng chọn danh mục hợp lệ.");
      return;
    }

    if (editingProduct) {
      try {
        const updated = await adminService.updateProduct(editingProduct.id, {
          name: formData.name,
          price: formData.price,
          stock: formData.stock,
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl || undefined,
          description: formData.description,
        });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật sản phẩm.");
        return;
      }
    } else {
      try {
        const created = await adminService.createProduct({
          name: formData.name,
          price: formData.price,
          stock: formData.stock,
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl || undefined,
          description: formData.description,
        });
        setProducts(prev => [created, ...prev]);
      } catch (err: any) {
        setError(err.message || "Lỗi tạo sản phẩm.");
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await adminService.deleteProduct(productToDelete);
        setProducts(prev => prev.filter(p => p.id !== productToDelete));
      } catch (err: any) {
        setError(err.message || "Lỗi xóa sản phẩm.");
      }
    }
  };

  return (
    <>
      <h1>📦 Quản lý sản phẩm</h1>
      <p className="page-subtitle">{products.length} sản phẩm</p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <div className="table-toolbar">
        <input
          className="table-search"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => handleOpenModal()} disabled={loading || categories.length === 0}>
          + Thêm sản phẩm
        </button>
      </div>

      <table className="table-block">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                Đang tải sản phẩm...
              </td>
            </tr>
          ) : filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  className="table-product-thumb"
                  src={product.imageUrl || ""}
                  alt={product.name}
                />
              </td>
              <td><strong>{product.name}</strong></td>
              <td>{product.category?.name ?? "N/A"}</td>
              <td>{product.price.toLocaleString("vi-VN")}₫</td>
              <td>{product.stock}</td>
              <td>{stockBadge(product.stock)}</td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-icon" title="Sửa" onClick={() => handleOpenModal(product)}>
                    ✏️
                  </button>
                  <button className="btn-icon btn-icon--danger" title="Xóa" onClick={() => handleDeleteClick(product.id)}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Product Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
      >
        <form className="admin-form" onSubmit={handleSaveProduct}>
          <label>
            Tên sản phẩm
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </label>
          <div className="admin-form-row">
            <label>
              Giá (₫)
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                required 
              />
            </label>
            <label>
              Tồn kho
              <input 
                type="number" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                required 
              />
            </label>
          </div>
          <label>
            Danh mục
            <select 
              value={formData.categoryId} 
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>
            URL ảnh
            <input 
              type="text" 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
            />
          </label>
          <label>
            Mô tả
            <textarea 
              rows={3} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa ngay"
        danger
      />
    </>
  );
}
