import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Member, Unit, ProgramParticipant, Evaluation } from '../types';
import { formatDateVN, formatOfficialDateVN, calculateProposedResult } from './evaluation';

/**
 * Xuất một DOM Element bất kỳ ra file PDF (A4) chất lượng cao
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string = 'Bao_Cao_Doan_Vien.pdf',
  options?: {
    orientation?: 'portrait' | 'landscape';
    quality?: number;
  }
): Promise<boolean> {
  try {
    const orientation = options?.orientation || 'portrait';
    const canvas = await html2canvas(element, {
      scale: 2, // Độ phân giải 2x cho chữ sắc nét khi in
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', options?.quality || 0.95);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Trang 1
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Xử lý nhiều trang nếu vượt quá chiều dài 1 trang A4
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất file PDF:', error);
    // Dự phòng mở hộp thoại In để người dùng chọn Lưu PDF
    window.print();
    return false;
  }
}

/**
 * Tạo và tải xuống nhanh file PDF báo cáo danh sách đoàn viên theo chuẩn thể thức
 */
export async function exportMembersReportPdf(
  members: Member[],
  units: Unit[],
  participants: ProgramParticipant[],
  evaluations: Record<string, Evaluation>,
  options?: {
    title?: string;
    unitName?: string;
    fileName?: string;
  }
): Promise<boolean> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.padding = '15mm 15mm 20mm 20mm';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Tinos', 'Times New Roman', serif";
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.3';

  const title = options?.title || 'BÁO CÁO DANH SÁCH ĐOÀN VIÊN & KẾT QUẢ ĐÁNH GIÁ';
  const unitName = options?.unitName || 'ĐOÀN TRƯỜNG ĐẠI HỌC';
  const dateStr = formatOfficialDateVN();

  let rowsHtml = '';
  members.forEach((m, idx) => {
    const u = units.find(unit => unit.id === m.unit_id);
    const pCount = participants.filter(p => p.member_id === m.id).length;
    const prop = calculateProposedResult(pCount);
    const confirmed = evaluations[m.id]?.confirmed_result || prop;

    rowsHtml += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 5px 4px; text-align: center; font-size: 10pt;">${idx + 1}</td>
        <td style="padding: 5px 6px; font-weight: bold; font-size: 10pt;">${m.full_name}</td>
        <td style="padding: 5px 6px; font-size: 10pt; font-family: monospace;">${m.member_code}</td>
        <td style="padding: 5px 6px; font-size: 10pt;">${m.student_code}</td>
        <td style="padding: 5px 6px; font-size: 10pt;">${m.class}</td>
        <td style="padding: 5px 6px; font-size: 10pt;">${u?.unit_name || 'N/A'}</td>
        <td style="padding: 5px 4px; text-align: center; font-weight: bold; font-size: 10pt;">${pCount}</td>
        <td style="padding: 5px 6px; font-size: 10pt;">${confirmed}</td>
        <td style="padding: 5px 6px; font-size: 10pt;">${m.status}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px; text-align: center;">
        <div style="width: 45%;">
          <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">ĐOÀN TNCS HỒ CHÍ MINH</div>
          <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase; color: #1e3a8a;">${unitName}</div>
          <div style="width: 80px; height: 1px; background: #000; margin: 4px auto;"></div>
          <div style="font-size: 10pt; margin-top: 4px;">Số: 26/BC-ĐTN</div>
        </div>
        <div style="width: 55%;">
          <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-weight: bold; font-size: 12pt;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 120px; height: 1px; background: #000; margin: 4px auto;"></div>
          <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">Đà Nẵng, ${dateStr}</div>
        </div>
      </div>

      <div style="text-align: center; margin: 20px 0 16px;">
        <h1 style="font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0;">${title}</h1>
        <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">Năm học 2025 - 2026 (Theo dõi quản lý cơ sở Đoàn)</div>
      </div>

      <div style="margin-bottom: 12px; font-size: 11pt;">
        <div>Tổng số đoàn viên trong danh sách: <strong>${members.length}</strong> đồng chí.</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt;">
        <thead>
          <tr style="background-color: #f1f5f9; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
            <th style="padding: 6px 4px; text-align: center; width: 35px;">STT</th>
            <th style="padding: 6px 6px; text-align: left;">Họ và tên</th>
            <th style="padding: 6px 6px; text-align: left; width: 85px;">Mã ĐV</th>
            <th style="padding: 6px 6px; text-align: left; width: 75px;">MSSV</th>
            <th style="padding: 6px 6px; text-align: left; width: 65px;">Lớp</th>
            <th style="padding: 6px 6px; text-align: left;">Chi đoàn</th>
            <th style="padding: 6px 4px; text-align: center; width: 45px;">Số CT</th>
            <th style="padding: 6px 6px; text-align: left; width: 95px;">Xếp loại</th>
            <th style="padding: 6px 6px; text-align: left; width: 80px;">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 30px; text-align: center;">
        <div style="width: 220px;">
          <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">TM. BAN CHẤP HÀNH</div>
          <div style="font-size: 10pt; font-style: italic; margin-top: 2px;">BÍ THƯ</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 11pt;">Trần Văn Minh</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const success = await exportElementToPdf(container, options?.fileName || 'Bao_Cao_Doan_Vien.pdf');
  document.body.removeChild(container);
  return success;
}
