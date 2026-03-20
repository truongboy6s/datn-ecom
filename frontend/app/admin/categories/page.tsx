"use client";

import { useEffect, useState } from "react";
import { Modal, ConfirmDialog } from "@/components/common/Modal";
import { adminService, type AdminCategory } from "@/services/admin.service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: ""
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService
      .listCategories()
      .then((res) => {
        if (!active) return;
        setCategories(res);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Lỗi khi tải danh mục.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (category?: AdminCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: ""
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^a-z0-9\s])/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingCategory) {
        const updated = await adminService.updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
        });
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updated } : c));
      } else {
        const created = await adminService.createCategory({
          name: formData.name,
          slug: formData.slug,
        });
        setCategories(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Lỗi lưu danh mục.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await adminService.deleteCategory(categoryToDelete);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete));
    } catch (err: any) {
      setError(err.message || "Lỗi xóa danh mục.");
    }
  };

  return (
    <>
      <h1>📂 Quản lý danh mục</h1>
      <p className="page-subtitle">Danh sách danh mục sản phẩm trong hệ thống.</p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      <div className="table-toolbar">
        <input 
          className="table-search" 
          placeholder="🔍 Tìm kiếm danh mục..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => handleOpenModal()} disabled={loading}>
          + Thêm danh mục
        </button>
      </div>

      <table className="table-block">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Số sản phẩm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "20px" }}>
                Đang tải danh mục...
              </td>
            </tr>
          ) : filteredCategories.map((cat) => (
            <tr key={cat.id}>
              <td style={{ color: "var(--muted)", fontSize: ".82rem" }}>{cat.id}</td>
              <td><strong>{cat.name}</strong></td>
              <td>
                <code style={{
                  background: "var(--bg)", padding: "3px 8px",
                  borderRadius: "var(--radius-sm)", fontSize: ".82rem"
                }}>
                  {cat.slug || "-"}
                </code>
              </td>
              <td>
                <span className="status-chip status-chip--info">
                  {cat.productCount ?? 0} sản phẩm
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-icon" title="Sửa" onClick={() => handleOpenModal(cat)}>
                    ✏️
                  </button>
                  <button className="btn-icon btn-icon--danger" title="Xóa" onClick={() => handleDeleteClick(cat.id)}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Category Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
      >
        <form className="admin-form" onSubmit={handleSaveCategory}>
          <label>
            Tên danh mục
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => handleNameChange(e.target.value)} 
              required 
              placeholder="VD: Laptop Gaming"
            />
          </label>
          <label>
            Slug (Đường dẫn)
            <input 
              type="text" 
              value={formData.slug} 
              onChange={e => setFormData({...formData, slug: e.target.value})} 
              required 
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
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả các sản phẩm thuộc danh mục này sẽ bị ảnh hưởng."
        confirmLabel="Xóa ngay"
        danger
      />
    </>
  );
}
