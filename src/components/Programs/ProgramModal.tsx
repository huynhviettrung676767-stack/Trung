import React, { useState, useEffect } from 'react';
import { 
  X, 
  CalendarDays, 
  CheckCircle2, 
  Image, 
  MapPin, 
  User, 
  Building, 
  Sparkles, 
  Plus,
  Layers
} from 'lucide-react';
import { Program, ProgramStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  programToEdit?: Program | null;
  onCreatedSuccess?: (newProgram: Program) => void;
}

const SAMPLE_PROGRAM_PRESETS = [
  {
    title: 'Chiến dịch Tình nguyện Mùa hè xanh',
    desc: 'Tình nguyện cao điểm hỗ trợ bà con vùng cao, tham gia xây dựng nông thôn mới, mở lớp ôn tập văn hóa hè cho thiếu nhi.',
    loc: 'Xã Trà Vân, Huyện Nam Trà My',
    org: 'Ban Chấp hành Đoàn trường',
    manager: 'Đ/c Trần Văn Minh',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    note: 'Chương trình tình nguyện trọng điểm cấp trường',
  },
  {
    title: 'Ngày Chủ nhật xanh: Giảng đường Xanh - Sạch - Đẹp',
    desc: 'Ra quân vệ sinh khuôn viên trường học, thu gom phân loại rác thải nhựa, tái chế và trồng thêm cây xanh tại các khu tự học.',
    loc: 'Khuôn viên Giảng đường Cơ sở 1',
    org: 'Đoàn Khoa Công nghệ thông tin',
    manager: 'Đ/c Lê Thị Mai',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
    note: 'Đoàn viên mang theo găng tay và dụng cụ lao động',
  },
  {
    title: 'Ngày hội Hiến máu tình nguyện "Giọt hồng tri ân"',
    desc: 'Phối hợp với Bệnh viện Đa khoa và Viện Huyết học tiếp nhận máu nhân đạo phục vụ công tác cấp cứu và điều trị bệnh nhân.',
    loc: 'Sảnh Hội trường Lớn - Khu A',
    org: 'Đoàn trường & CLB Kỹ năng Thanh niên',
    manager: 'Đ/c Nguyễn Hoàng Nam',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&auto=format&fit=crop&q=80',
    note: 'Đoàn viên được cấp Giấy chứng nhận và bồi dưỡng theo quy định',
  },
  {
    title: 'Hội thao Sinh viên Khỏe & Giao lưu Bóng đá Đoàn viên',
    desc: 'Giải thi đấu các môn bóng đá mini, bóng chuyền, kéo co và chạy tiếp sức giữa các chi đoàn thanh niên.',
    loc: 'Khu Liên hợp Thể thao Trường Đại học',
    org: 'CLB Thể thao Đoàn trường',
    manager: 'Đ/c Phạm Minh Đức',
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&auto=format&fit=crop&q=80',
    note: 'Có trao cờ thưởng và huy chương cho đội tuyển đạt giải',
  },
  {
    title: 'Diễn đàn Thanh niên Chuyển đổi số & Ứng dụng AI',
    desc: 'Tập huấn kỹ năng số, bảo mật dữ liệu cá nhân, giới thiệu công cụ trí tuệ nhân tạo hỗ trợ học tập và nghiên cứu khoa học.',
    loc: 'Hội trường C2 & Trực tuyến qua Microsoft Teams',
    org: 'Đoàn trường & Hội Sinh viên',
    manager: 'Đ/c Đặng Tuấn Kiệt',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    note: 'Có cấp chứng nhận tham gia phục vụ đánh giá rèn luyện',
  },
];

const BANNER_PRESETS = [
  { label: 'Tình nguyện', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' },
  { label: 'Môi trường', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Hiến máu', url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Thể thao', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&auto=format&fit=crop&q=80' },
  { label: 'Công nghệ AI', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80' },
];

export const ProgramModal: React.FC<ProgramModalProps> = ({ 
  isOpen, 
  onClose, 
  programToEdit,
  onCreatedSuccess 
}) => {
  const { addProgram, updateProgram, currentUser } = useApp();

  const getInitialState = () => {
    if (programToEdit) {
      return {
        program_code: programToEdit.program_code,
        program_name: programToEdit.program_name,
        description: programToEdit.description,
        start_date: programToEdit.start_date,
        end_date: programToEdit.end_date,
        location: programToEdit.location,
        organizer: programToEdit.organizer,
        manager: programToEdit.manager,
        status: programToEdit.status,
        image_url: programToEdit.image_url || '',
        note: programToEdit.note || '',
      };
    }
    const rand = Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().split('T')[0];
    return {
      program_code: `CT2026-${rand}`,
      program_name: '',
      description: '',
      start_date: today,
      end_date: today,
      location: 'Khuôn viên trường Đại học',
      organizer: 'Ban Chấp hành Đoàn trường',
      manager: currentUser.name || 'Đ/c Trần Văn Minh',
      status: 'Sắp diễn ra' as ProgramStatus,
      image_url: BANNER_PRESETS[0].url,
      note: '',
    };
  };

  const [formData, setFormData] = useState<Omit<Program, 'id'>>(getInitialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setErrors({});
    }
  }, [isOpen, programToEdit]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SAMPLE_PROGRAM_PRESETS[0]) => {
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      program_code: `CT2026-${rand}`,
      program_name: preset.title,
      description: preset.desc,
      location: preset.loc,
      organizer: preset.org,
      manager: preset.manager,
      image_url: preset.image,
      note: preset.note,
    }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.program_code.trim()) err.program_code = 'Mã chương trình không được để trống';
    if (!formData.program_name.trim()) err.program_name = 'Tên chương trình không được để trống';
    if (!formData.start_date) err.start_date = 'Vui lòng chọn ngày tổ chức';
    if (!formData.location.trim()) err.location = 'Địa điểm không được để trống';
    if (!formData.organizer.trim()) err.organizer = 'Đơn vị tổ chức không được để trống';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (programToEdit) {
      updateProgram(programToEdit.id, formData);
    } else {
      const created = addProgram(formData);
      if (onCreatedSuccess) {
        onCreatedSuccess(created);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {programToEdit ? 'Chỉnh Sửa Hoạt Động Đoàn' : 'Thêm Mới Chương Trình Đoàn'}
              </h2>
              <p className="text-xs text-blue-200">Kế hoạch hoạt động phong trào thanh niên & tình nguyện</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets (When creating) */}
        {!programToEdit && (
          <div className="bg-blue-50/70 p-4 border-b border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý mẫu chương trình phong trào (Bấm để điền nhanh):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROGRAM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 rounded-lg text-xs font-medium transition shadow-2xs"
                >
                  {preset.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Chương trình <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.program_code}
                onChange={(e) => setFormData({ ...formData, program_code: e.target.value })}
                placeholder="CT2026-MHX"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-mono font-bold text-blue-900"
              />
              {errors.program_code && <p className="text-[11px] text-rose-500 mt-0.5">{errors.program_code}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Chương trình / Hoạt động <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.program_name}
                onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                placeholder="Chiến dịch Tình nguyện Mùa hè xanh 2026"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
              />
              {errors.program_name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.program_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung / Mục đích chương trình</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả nội dung chi tiết, ý nghĩa và kế hoạch triển khai của chương trình..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian bắt đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              />
              {errors.start_date && <p className="text-[11px] text-rose-500 mt-0.5">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian kết thúc</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa điểm tổ chức <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Hội trường Lớn / Sân trường..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              {errors.location && <p className="text-[11px] text-rose-500 mt-0.5">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tổ chức <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Ban Chấp hành Đoàn trường"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              {errors.organizer && <p className="text-[11px] text-rose-500 mt-0.5">{errors.organizer}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Người phụ trách điều phối</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Đ/c Trần Văn Minh"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái chương trình</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              >
                <option value="Sắp diễn ra">Sắp diễn ra</option>
                <option value="Đang diễn ra">Đang diễn ra</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Banner selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Hình ảnh đại diện (Banner):</label>
              <span className="text-[11px] text-slate-400">Chọn mẫu nhanh hoặc nhập link</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {BANNER_PRESETS.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: b.url })}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                    formData.image_url === b.url
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Chỉ tiêu, khen thưởng, lưu ý cho tình nguyện viên..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
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
              {programToEdit ? 'Lưu Thay Đổi' : 'Tạo Chương Trình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
