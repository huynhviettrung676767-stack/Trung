import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { Unit, UnitStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitToEdit?: Unit | null;
}

export const UnitModal: React.FC<UnitModalProps> = ({ isOpen, onClose, unitToEdit }) => {
  const { addUnit, updateUnit } = useApp();

  const [formData, setFormData] = useState<Omit<Unit, 'id'>>(() => {
    if (unitToEdit) {
      return {
        unit_code: unitToEdit.unit_code,
        unit_name: unitToEdit.unit_name,
        faculty: unitToEdit.faculty,
        secretary: unitToEdit.secretary,
        vice_secretary: unitToEdit.vice_secretary,
        status: unitToEdit.status,
      };
    }
    const randomCode = Math.floor(10 + Math.random() * 90);
    return {
      unit_code: `CĐ-K${randomCode}`,
      unit_name: '',
      faculty: 'Khoa Công nghệ thông tin',
      secretary: '',
      vice_secretary: '',
      status: 'Hoạt động',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.unit_code.trim()) err.unit_code = 'Mã chi đoàn không được để trống';
    if (!formData.unit_name.trim()) err.unit_name = 'Tên chi đoàn không được để trống';
    if (!formData.faculty.trim()) err.faculty = 'Khoa/Ban không được để trống';
    if (!formData.secretary.trim()) err.secretary = 'Vui lòng nhập tên Bí thư Chi đoàn';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (unitToEdit) {
      updateUnit(unitToEdit.id, formData);
    } else {
      addUnit(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {unitToEdit ? 'Chỉnh Sửa Đơn Vị / Chi Đoàn' : 'Thêm Chi Đoàn Mới'}
              </h2>
              <p className="text-xs text-blue-200">Quản lý cơ sở Đoàn trực thuộc Đoàn trường</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã Đơn Vị / Chi Đoàn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.unit_code}
              onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })}
              placeholder="Ví dụ: CĐ-CNTT01"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
            />
            {errors.unit_code && <p className="text-[11px] text-rose-500 mt-0.5">{errors.unit_code}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Chi Đoàn / Đơn Vị <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.unit_name}
              onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
              placeholder="Chi đoàn Công nghệ thông tin K46A"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
            {errors.unit_name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.unit_name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khoa / Phòng / Ban trực thuộc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              placeholder="Khoa Công nghệ thông tin"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            {errors.faculty && <p className="text-[11px] text-rose-500 mt-0.5">{errors.faculty}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bí thư Chi đoàn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.secretary}
                onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                placeholder="Họ và tên Bí thư"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              {errors.secretary && <p className="text-[11px] text-rose-500 mt-0.5">{errors.secretary}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phó Bí thư Chi đoàn
              </label>
              <input
                type="text"
                value={formData.vice_secretary}
                onChange={(e) => setFormData({ ...formData, vice_secretary: e.target.value })}
                placeholder="Họ và tên Phó Bí thư"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Tạm dừng">Tạm dừng</option>
            </select>
          </div>

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
              {unitToEdit ? 'Lưu Thay Đổi' : 'Thêm Đơn Vị'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
