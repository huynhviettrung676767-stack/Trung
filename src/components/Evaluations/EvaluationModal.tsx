import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Member, Evaluation, ConfirmedResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { getProposedBadgeStyle, formatDateVN } from '../../utils/evaluation';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  evaluation: Evaluation | null;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  member,
  evaluation,
}) => {
  const { updateEvaluation, currentUser, units } = useApp();

  const [confirmedResult, setConfirmedResult] = useState<ConfirmedResult>(
    evaluation?.confirmed_result && evaluation.confirmed_result !== 'Chưa xác nhận'
      ? evaluation.confirmed_result
      : (evaluation?.proposed_result === 'ĐỀ XUẤT KHEN THƯỞNG' ? 'Đề xuất khen thưởng' : evaluation?.proposed_result === 'ĐẠT' ? 'Đạt' : 'Chưa đạt')
  );
  const [comment, setComment] = useState(evaluation?.comment || '');
  const [evaluator, setEvaluator] = useState(evaluation?.evaluator || currentUser.name);

  if (!isOpen || !member || !evaluation) return null;

  const unit = units.find(u => u.id === member.unit_id);
  const proposedBadge = getProposedBadgeStyle(evaluation.proposed_result);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvaluation(member.id, {
      confirmed_result: confirmedResult,
      comment,
      evaluator,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base font-bold">Xác Nhận & Đánh Giá Đoàn Viên</h3>
              <p className="text-xs text-blue-200">Phê duyệt kết quả rèn luyện đoàn viên theo năm học</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Member Card Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <img
              src={member.avatar_url}
              alt={member.full_name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{member.full_name}</h4>
              <p className="text-xs text-slate-500 font-mono">
                {member.member_code} • MSSV: {member.student_code}
              </p>
              <p className="text-xs text-slate-600 truncate">{unit?.unit_name}</p>
            </div>
          </div>

          {/* System Auto Suggestion */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs block">Số chương trình đã tham gia:</span>
              <strong className="text-blue-900 text-base font-black">
                {evaluation.participation_count} chương trình
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-xs block mb-1">Đề xuất tự động:</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${proposedBadge.badgeClass}`}>
                {evaluation.proposed_result}
              </span>
            </div>
          </div>

          {/* Confirmed Result Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kết Quả Xác Nhận Của Cán Bộ Phụ Trách: <span className="text-rose-500">*</span>
            </label>
            <select
              value={confirmedResult}
              onChange={(e) => setConfirmedResult(e.target.value as ConfirmedResult)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Đề xuất khen thưởng">Đề xuất khen thưởng</option>
              <option value="Khen thưởng cấp Trường">Khen thưởng cấp Trường (Xuất sắc tiêu biểu)</option>
              <option value="Khen thưởng cấp Khoa">Khen thưởng cấp Khoa</option>
              <option value="Đạt">Đạt (Hoàn thành nhiệm vụ đoàn viên)</option>
              <option value="Chưa đạt">Chưa đạt</option>
            </select>
          </div>

          {/* Evaluator name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cán bộ đánh giá / Người ký:
            </label>
            <input
              type="text"
              value={evaluator}
              onChange={(e) => setEvaluator(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nhận xét / Ghi chú đánh giá:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập nhận xét về tinh thần rèn luyện, thái độ tham gia và thành tích..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu Kết Quả
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
