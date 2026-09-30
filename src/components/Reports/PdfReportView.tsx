import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, 
  FileText, 
  Award, 
  Calendar, 
  Filter, 
  Building2, 
  CheckCircle, 
  Download,
  School,
  Sparkles,
  FileDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatDateVN, 
  formatOfficialDateVN, 
  calculateProposedResult 
} from '../../utils/evaluation';
import { exportElementToPdf } from '../../utils/pdfExport';
import { exportMembersReportDocx } from '../../utils/docxExport';

export const PdfReportView: React.FC = () => {
  const { members, units, programs, participants, evaluations, currentUser, showToast } = useApp();
  const documentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  // Report Type Selection
  const [reportType, setReportType] = useState<
    'evaluation-summary' | 'reward-list' | 'participation-summary' | 'member-roster'
  >('evaluation-summary');

  // Filters
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [reportNumber, setReportNumber] = useState('42/BC-ĐTN');
  const [documentDate, setDocumentDate] = useState('Đà Nẵng, ' + formatOfficialDateVN());
  const [signerTitle, setSignerTitle] = useState('BÍ THƯ');
  const [signerName, setSignerName] = useState('Trần Văn Minh');

  // Filtered dataset
  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (selectedUnit !== 'all') {
      list = list.filter(m => m.unit_id === selectedUnit);
    }

    if (reportType === 'reward-list') {
      list = list.filter(m => {
        const count = participants.filter(p => p.member_id === m.id).length;
        const proposed = calculateProposedResult(count);
        const evalItem = evaluations[m.id];
        return proposed === 'ĐỀ XUẤT KHEN THƯỞNG' || evalItem?.confirmed_result.includes('Khen thưởng');
      });
    }

    return list;
  }, [members, selectedUnit, reportType, participants, evaluations]);

  // Statistics
  const stats = useMemo(() => {
    let dat = 0;
    let chuaDat = 0;
    let khenThuong = 0;

    filteredMembers.forEach(m => {
      const count = participants.filter(p => p.member_id === m.id).length;
      const proposed = calculateProposedResult(count);
      if (proposed === 'ĐẠT') dat++;
      else if (proposed === 'CHƯA ĐẠT') chuaDat++;
      else if (proposed === 'ĐỀ XUẤT KHEN THƯỞNG') khenThuong++;
    });

    return { total: filteredMembers.length, dat, chuaDat, khenThuong };
  }, [filteredMembers, participants]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    showToast('Đang kết xuất tệp PDF chất lượng cao khổ A4...', 'info');
    try {
      const typeSlug = reportType.replace(/-/g, '_');
      await exportElementToPdf(
        documentRef.current,
        `BaoCao_HanhChinh_${typeSlug}_${formatDateVN(new Date().toISOString()).replace(/\//g, '-')}.pdf`
      );
      showToast('Đã tải xuống thành công tệp PDF!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể tạo file tự động, chuyển sang in ấn PDF...', 'info');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    showToast('Đang kết xuất tệp Word (.docx) chuẩn thể thức...', 'info');
    try {
      const typeSlug = reportType.replace(/-/g, '_');
      const titleObj = getReportTitle();
      const unitObj = units.find(u => u.id === selectedUnit);
      await exportMembersReportDocx(
        filteredMembers,
        units,
        participants,
        evaluations,
        {
          title: `${titleObj.header} - ${titleObj.sub}`,
          unitName: unitObj ? unitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_HanhChinh_${typeSlug}_${formatDateVN(new Date().toISOString()).replace(/\//g, '-')}.docx`,
        }
      );
      showToast('Đã tải xuống thành công tệp Word (.docx)!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Có lỗi khi tạo tệp Word', 'error');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'evaluation-summary':
        return {
          header: 'BÁO CÁO',
          sub: 'V/v Kết quả đánh giá, phân loại đoàn viên năm học 2025 - 2026',
        };
      case 'reward-list':
        return {
          header: 'DANH SÁCH ĐỀ NGHỊ KHEN THƯỞNG',
          sub: 'Khen thưởng đoàn viên có thành tích xuất sắc trong công tác Đoàn và phong trào thanh niên',
        };
      case 'participation-summary':
        return {
          header: 'BÁO CÁO TỔNG HỢP',
          sub: 'V/v Tham gia các chương trình, hoạt động phong trào thanh niên tình nguyện',
        };
      case 'member-roster':
        return {
          header: 'DANH SÁCH TRÍCH NGANG ĐOÀN VIÊN',
          sub: 'Sổ theo dõi đoàn viên và công tác quản lý tổ chức cơ sở Đoàn',
        };
    }
  };

  const titleInfo = getReportTitle();

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden when printing via .no-print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-rose-600" />
              Thiết Lập Văn Bản Hành Chính (Nghị định 30/2020/NĐ-CP)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Báo cáo được định dạng phông chữ Tinos/Times New Roman, khổ giấy A4, lề trang và Quốc hiệu, Tiêu ngữ chuẩn thể thức
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloadingDocx}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg shadow-blue-700/20 transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
              title="Tải văn bản định dạng Microsoft Word .docx"
            >
              <FileDown className="w-4 h-4 text-blue-200" />
              <span>{isDownloadingDocx ? 'Đang xuất Word...' : 'Tải File Word (.docx)'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
              title="Tải trực tiếp tệp văn bản .pdf về máy tính"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Đang xuất file PDF...' : 'Tải Xuống File PDF (.pdf)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer"
              title="Mở giao diện in của trình duyệt hoặc lưu PDF máy in"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>In Văn Bản (A4)</span>
            </button>
          </div>
        </div>

        {/* Filter & Options */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Loại báo cáo hành chính:</label>
            <select
              value={reportType}
              onChange={(e: any) => setReportType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              <option value="evaluation-summary">1. Báo cáo đánh giá, phân loại đoàn viên</option>
              <option value="reward-list">2. Danh sách đề xuất khen thưởng (≥ 3 CT)</option>
              <option value="participation-summary">3. Báo cáo hoạt động phong trào</option>
              <option value="member-roster">4. Danh sách trích ngang đoàn viên</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Đơn vị / Chi đoàn:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">Toàn trường (Tất cả chi đoàn)</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.unit_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Số, ký hiệu văn bản:</label>
            <input
              type="text"
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Người ký xác nhận:</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Đ/c Trần Văn Minh"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:ring-1 focus:ring-rose-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled according to Decree 30/2020/ND-CP) */}
      <div className="flex justify-center p-2 sm:p-6 bg-slate-200/60 rounded-2xl overflow-x-auto">
        <div ref={documentRef} className="admin-document bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-14 shadow-2xl text-black font-admin leading-normal border border-slate-300">
          
          {/* HEADER: Decree 30/2020 standard administrative header */}
          <div className="grid grid-cols-12 gap-2 text-center items-start mb-6">
            {/* Left Header: Cơ quan ban hành & Số ký hiệu */}
            <div className="col-span-5 text-center">
              <div className="font-bold text-[13pt] uppercase">
                ĐOÀN TNCS HỒ CHÍ MINH
              </div>
              <div className="font-bold text-[12pt] uppercase tracking-tight">
                ĐOÀN TRƯỜNG ĐẠI HỌC
              </div>
              <div className="w-28 mx-auto border-b border-black my-1"></div>
              <div className="text-[11pt] mt-1 font-normal">
                Số: {reportNumber}
              </div>
            </div>

            {/* Right Header: Quốc hiệu & Tiêu ngữ */}
            <div className="col-span-7 text-center">
              <div className="font-bold text-[12pt] uppercase tracking-wide">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-bold text-[13pt]">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="w-44 mx-auto border-b border-black my-1"></div>
              <div className="text-[12pt] italic mt-1">
                {documentDate}
              </div>
            </div>
          </div>

          {/* DOCUMENT TITLE */}
          <div className="text-center my-6">
            <h1 className="text-[16pt] font-bold uppercase tracking-wide text-black">
              {titleInfo.header}
            </h1>
            <p className="text-[13pt] font-semibold italic mt-1 max-w-xl mx-auto">
              {titleInfo.sub}
            </p>
          </div>

          {/* DOCUMENT PREAMBLE / STATS */}
          <div className="text-[13pt] text-justify space-y-2 mb-4">
            <p className="indent-8">
              Căn cứ Điều lệ Đoàn TNCS Hồ Chí Minh về việc theo dõi, quản lý hồ sơ và phân loại chất lượng đoàn viên định kỳ;
            </p>
            <p className="indent-8">
              Căn cứ Nghị định 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư;
            </p>
            <p className="indent-8">
              Căn cứ kết quả ghi nhận việc tham gia các chương trình, hoạt động phong trào thanh niên và chiến dịch tình nguyện trong năm học 2025 - 2026, Ban Chấp hành Đoàn trường tổng hợp và báo cáo số liệu cụ thể như sau:
            </p>
          </div>

          {/* SUMMARY BOX */}
          <div className="border border-black p-3 mb-6 text-[12pt] bg-slate-50/50">
            <div className="font-bold uppercase text-[12pt] mb-1.5 border-b border-slate-300 pb-1">
              Thống kê tổng hợp số liệu ({selectedUnit === 'all' ? 'Toàn trường' : 'Đơn vị'}):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-1">
                <div>Tổng số đoàn viên:</div>
                <strong className="text-[13pt]">{stats.total}</strong>
              </div>
              <div className="p-1">
                <div>Đề xuất khen thưởng:</div>
                <strong className="text-[13pt]">{stats.khenThuong} ({stats.total ? Math.round((stats.khenThuong/stats.total)*100) : 0}%)</strong>
              </div>
              <div className="p-1">
                <div>Đạt yêu cầu:</div>
                <strong className="text-[13pt]">{stats.dat} ({stats.total ? Math.round((stats.dat/stats.total)*100) : 0}%)</strong>
              </div>
              <div className="p-1">
                <div>Chưa đạt:</div>
                <strong className="text-[13pt]">{stats.chuaDat} ({stats.total ? Math.round((stats.chuaDat/stats.total)*100) : 0}%)</strong>
              </div>
            </div>
          </div>

          {/* MAIN DATA TABLE */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-black text-[11pt]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black p-2 w-10">STT</th>
                  <th className="border border-black p-2 w-24">Mã ĐV</th>
                  <th className="border border-black p-2">Họ và tên</th>
                  <th className="border border-black p-2 w-20">MSSV</th>
                  <th className="border border-black p-2">Chi đoàn / Lớp</th>
                  <th className="border border-black p-2 w-16">Số CT</th>
                  <th className="border border-black p-2 w-28">Đề xuất</th>
                  <th className="border border-black p-2 w-28">Xác nhận</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, idx) => {
                  const count = participants.filter(p => p.member_id === member.id).length;
                  const proposed = calculateProposedResult(count);
                  const evalItem = evaluations[member.id];
                  const confirmed = evalItem?.confirmed_result || 'Chưa xác nhận';
                  const unit = units.find(u => u.id === member.unit_id);

                  return (
                    <tr key={member.id} className="text-center">
                      <td className="border border-black p-1.5">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-mono">{member.member_code}</td>
                      <td className="border border-black p-1.5 text-left font-semibold">
                        {member.full_name}
                      </td>
                      <td className="border border-black p-1.5 font-mono">{member.student_code}</td>
                      <td className="border border-black p-1.5 text-left">
                        {unit?.unit_name.replace('Chi đoàn ', '')} ({member.class})
                      </td>
                      <td className="border border-black p-1.5 font-bold">{count}</td>
                      <td className="border border-black p-1.5 font-medium">{proposed}</td>
                      <td className="border border-black p-1.5 font-semibold">{confirmed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SIGNATURE BLOCK: Standard Decree 30 layout */}
          <div className="grid grid-cols-12 gap-4 mt-8 pt-4 text-[12pt] page-break-inside-avoid">
            {/* Left: Nơi nhận */}
            <div className="col-span-6 text-left space-y-1">
              <div className="font-bold italic text-[11pt]">Nơi nhận:</div>
              <div className="text-[10pt] space-y-0.5">
                <div>- Ban Thường vụ Thành Đoàn;</div>
                <div>- Đảng ủy, Ban Giám hiệu (để b/c);</div>
                <div>- Các Chi đoàn trực thuộc (để t/h);</div>
                <div>- Lưu: VT, VP Đoàn trường.</div>
              </div>
            </div>

            {/* Right: Ký tên đóng dấu */}
            <div className="col-span-6 text-center">
              <div className="font-bold text-[12pt] uppercase">
                TM. BAN THƯỜNG VỤ ĐOÀN TRƯỜNG
              </div>
              <div className="font-bold text-[12pt] uppercase tracking-wide mt-0.5">
                {signerTitle}
              </div>

              {/* Simulated Youth Union Stamp */}
              <div className="my-3 flex justify-center">
                <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-rose-600/70 flex flex-col items-center justify-center text-rose-700/80 p-2 transform -rotate-6 select-none">
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-center">
                    ĐOÀN TNCS HỒ CHÍ MINH
                  </div>
                  <div className="text-[12px] font-black my-0.5">★</div>
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-center">
                    ĐOÀN TRƯỜNG ĐẠI HỌC
                  </div>
                </div>
              </div>

              <div className="font-bold text-[13pt] text-black">
                {signerName}
              </div>
            </div>
          </div>

          {/* Page footer */}
          <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10pt] text-slate-500 italic">
            Trang 1/1 • Mẫu văn bản ban hành theo Nghị định số 30/2020/NĐ-CP về công tác văn thư
          </div>
        </div>
      </div>
    </div>
  );
};
