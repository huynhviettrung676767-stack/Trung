import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Trash2, CheckCircle2, User, Phone, Mail, Building, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { Member, Gender, MemberStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, memberToEdit }) => {
  const { units, addMember, updateMember } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialForm = () => {
    if (memberToEdit) {
      return {
        member_code: memberToEdit.member_code,
        full_name: memberToEdit.full_name,
        date_of_birth: memberToEdit.date_of_birth,
        gender: memberToEdit.gender,
        phone: memberToEdit.phone,
        email: memberToEdit.email,
        student_code: memberToEdit.student_code,
        class: memberToEdit.class,
        faculty: memberToEdit.faculty,
        unit_id: memberToEdit.unit_id,
        position: memberToEdit.position,
        union_join_date: memberToEdit.union_join_date,
        address: memberToEdit.address,
        avatar_url: memberToEdit.avatar_url,
        status: memberToEdit.status,
      };
    }
    const randomNum = Math.floor(100 + Math.random() * 900);
    return {
      member_code: `ĐV2026-${randomNum}`,
      full_name: '',
      date_of_birth: '2004-01-01',
      gender: 'Nam' as Gender,
      phone: '',
      email: '',
      student_code: `2211${randomNum}`,
      class: '22CNTT1A',
      faculty: 'Khoa Công nghệ thông tin',
      unit_id: units[0]?.id || '',
      position: 'Đoàn viên',
      union_join_date: '2020-03-26',
      address: 'Đà Nẵng',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Đang sinh hoạt' as MemberStatus,
    };
  };

  const [formData, setFormData] = useState<Omit<Member, 'id' | 'created_at' | 'updated_at'>>(getInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>(formData.avatar_url);

  // Sync state whenever memberToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const initial = getInitialForm();
      setFormData(initial);
      setAvatarPreview(initial.avatar_url);
      setErrors({});
    }
  }, [isOpen, memberToEdit]);

  if (!isOpen) return null;

  // Quick fill sample data for fast testing
  const handleQuickFillSample = () => {
    const samples = [
      { name: 'Hoàng Quốc Việt', gender: 'Nam' as Gender, pos: 'Đoàn viên', class: '22CNTT1A', faculty: 'Khoa Công nghệ thông tin', phone: '0905123999' },
      { name: 'Nguyễn Thị Cẩm Ly', gender: 'Nữ' as Gender, pos: 'Ủy viên Ban Chấp hành', class: '22KTQT2B', faculty: 'Khoa Kinh tế & Quản trị', phone: '0912445888' },
      { name: 'Phạm Đăng Khôi', gender: 'Nam' as Gender, pos: 'Bí thư Chi đoàn', class: '21NNA3C', faculty: 'Khoa Ngoại ngữ', phone: '0988771234' },
      { name: 'Trần Thảo My', gender: 'Nữ' as Gender, pos: 'Đoàn viên', class: '22CNTT1A', faculty: 'Khoa Công nghệ thông tin', phone: '0934556677' },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    const rand = Math.floor(100 + Math.random() * 900);
    const unitTarget = units.find(u => u.faculty === picked.faculty) || units[0];

    setFormData(prev => ({
      ...prev,
      member_code: `ĐV2026-${rand}`,
      full_name: picked.name,
      gender: picked.gender,
      student_code: `22110${rand}`,
      class: picked.class,
      faculty: picked.faculty,
      unit_id: unitTarget?.id || units[0]?.id || '',
      position: picked.pos,
      phone: picked.phone,
      email: `${picked.name.toLowerCase().split(' ').pop()}.${rand}@student.edu.vn`,
      address: 'Hải Châu, Đà Nẵng',
    }));
  };

  // Handle local avatar file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size and type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
        alert('Vui lòng chọn hình ảnh hợp lệ (JPG, JPEG, PNG, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.member_code.trim()) err.member_code = 'Mã đoàn viên không được để trống';
    if (!formData.full_name.trim()) err.full_name = 'Họ và tên không được để trống';
    if (!formData.student_code.trim()) err.student_code = 'Mã sinh viên không được để trống';
    if (!formData.class.trim()) err.class = 'Lớp không được để trống';
    if (!formData.faculty.trim()) err.faculty = 'Khoa không được để trống';
    if (!formData.unit_id) err.unit_id = 'Vui lòng chọn Chi đoàn';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (memberToEdit) {
      updateMember(memberToEdit.id, formData);
    } else {
      addMember(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {memberToEdit ? 'Chỉnh Sửa Hồ Sơ Đoàn Viên' : 'Thêm Mới Hồ Sơ Đoàn Viên'}
              {!memberToEdit && (
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
                  Tạo mới
                </span>
              )}
            </h2>
            <p className="text-xs text-blue-200">
              Nhập đầy đủ thông tin cá nhân, tổ chức Đoàn và quá trình sinh hoạt
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!memberToEdit && (
              <button
                type="button"
                onClick={handleQuickFillSample}
                className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Tự động điền dữ liệu mẫu hợp lệ để kiểm thử nhanh"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Điền mẫu nhanh</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Avatar Upload Section (Requirement 3: Cập nhật avatar từ hình ảnh máy tính) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatarPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt="Avatar Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                title="Đổi ảnh từ máy tính"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h4 className="text-sm font-bold text-slate-800">Ảnh chân dung Đoàn viên (Avatar)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hỗ trợ định dạng PNG, JPG, JPEG, WEBP. Ảnh sắc nét giúp nhận diện khi in thẻ đoàn và chứng nhận khen thưởng.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Cập nhật Avatar từ máy tính
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');
                      setFormData(prev => ({ ...prev, avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }));
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    Dùng ảnh mặc định
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Thông tin cơ bản & Học tập */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b pb-1">
              1. Thông Tin Cá Nhân & Sinh Viên
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Đoàn viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.member_code}
                  onChange={(e) => setFormData({ ...formData, member_code: e.target.value })}
                  placeholder="Ví dụ: ĐV2026-001"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
                {errors.member_code && <p className="text-[11px] text-rose-500 mt-0.5">{errors.member_code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
                {errors.full_name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã số sinh viên (MSSV) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  placeholder="22110001"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
                {errors.student_code && <p className="text-[11px] text-rose-500 mt-0.5">{errors.student_code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="22CNTT1A"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khoa / Bộ môn</label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  placeholder="Khoa Công nghệ thông tin"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0905123456"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@student.edu.vn"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tổ chức Đoàn & Sinh hoạt */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b pb-1">
              2. Thông Tin Chi Đoàn & Chức Vụ Đoàn
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn vị / Chi đoàn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="">-- Chọn Chi đoàn --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_name} ({u.unit_code})
                    </option>
                  ))}
                </select>
                {errors.unit_id && <p className="text-[11px] text-rose-500 mt-0.5">{errors.unit_id}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ Đoàn</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Đoàn viên">Đoàn viên</option>
                  <option value="Bí thư Chi đoàn">Bí thư Chi đoàn</option>
                  <option value="Phó Bí thư Chi đoàn">Phó Bí thư Chi đoàn</option>
                  <option value="Ủy viên Ban Chấp hành">Ủy viên Ban Chấp hành</option>
                  <option value="Ủy viên BTV Đoàn trường">Ủy viên BTV Đoàn trường</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày vào Đoàn</label>
                <input
                  type="date"
                  value={formData.union_join_date}
                  onChange={(e) => setFormData({ ...formData, union_join_date: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái sinh hoạt</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Đang sinh hoạt">Đang sinh hoạt</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                  <option value="Đã chuyển sinh hoạt">Đã chuyển sinh hoạt</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Quận/Huyện, Tỉnh/Thành phố"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {memberToEdit ? 'Lưu Thay Đổi' : 'Thêm Đoàn Viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
