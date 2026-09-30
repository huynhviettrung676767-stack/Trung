import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  BorderStyle,
  ShadingType
} from 'docx';
import { Member, Unit, Program, ProgramParticipant, Evaluation } from '../types';
import { formatDateVN, formatOfficialDateVN, calculateProposedResult } from './evaluation';

/**
 * Trình hỗ trợ tải xuống tệp Blob trong trình duyệt
 */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
};

/**
 * Xuất Báo Cáo Danh Sách Đoàn Viên ra tệp Word (.docx)
 */
export async function exportMembersReportDocx(
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
  try {
    const title = options?.title || 'BÁO CÁO DANH SÁCH ĐOÀN VIÊN & KẾT QUẢ ĐÁNH GIÁ';
    const unitName = options?.unitName || 'ĐOÀN TRƯỜNG ĐẠI HỌC';
    const dateStr = formatOfficialDateVN();

    // Table Header
    const tableHeader = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 2200, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Họ và tên', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Mã ĐV', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'MSSV', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1000, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Lớp', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Chi đoàn', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 700, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số CT', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1400, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Xếp loại', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1300, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Trạng thái', bold: true, size: 20 })] })],
        }),
      ],
    });

    // Table Data Rows
    const dataRows = members.map((m, idx) => {
      const u = units.find(unit => unit.id === m.unit_id);
      const pCount = participants.filter(p => p.member_id === m.id).length;
      const prop = calculateProposedResult(pCount);
      const confirmed = evaluations[m.id]?.confirmed_result || prop;

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), size: 19 })] })],
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.full_name, bold: true, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1300, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.member_code, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.student_code, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.class, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: u?.unit_name || 'N/A', size: 19 })] })],
          }),
          new TableCell({
            width: { size: 700, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(pCount), bold: true, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: confirmed, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1300, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: m.status, size: 19 })] })],
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1134, // ~20mm
                right: 850, // ~15mm
                bottom: 1134, // ~20mm
                left: 1701, // ~30mm
              },
            },
          },
          children: [
            // Header: Left (Organ) & Right (National Emblem)
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 45, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐOÀN TNCS HỒ CHÍ MINH', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unitName, bold: true, size: 21, color: '1E3A8A' })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số: 26/BC-ĐTN', size: 19 })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 55, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 22 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Đà Nẵng, ${dateStr}`, italics: true, size: 20 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { before: 200, after: 100 } }),

            // Title
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 28,
                  color: '000000',
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Năm học 2025 - 2026 (Theo dõi quản lý cơ sở Đoàn theo Nghị định 30/2020/NĐ-CP)',
                  italics: true,
                  size: 20,
                  color: '555555',
                }),
              ],
              spacing: { after: 250 },
            }),

            // Total summary
            new Paragraph({
              children: [
                new TextRun({ text: 'Tổng số đoàn viên trong danh sách: ', size: 22 }),
                new TextRun({ text: `${members.length} đồng chí.`, bold: true, size: 22 }),
              ],
              spacing: { after: 150 },
            }),

            // Data Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [tableHeader, ...dataRows],
            }),

            new Paragraph({ text: '', spacing: { before: 300 } }),

            // Signature block
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NƠI NHẬN:', bold: true, size: 18 })] }),
                        new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: '- Ban Giám hiệu (để b/c);', size: 18, italics: true })] }),
                        new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: '- Các Chi đoàn trực thuộc;', size: 18, italics: true })] }),
                        new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: '- Lưu: VP Đoàn.', size: 18, italics: true })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TM. BAN CHẤP HÀNH', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BÍ THƯ', italics: true, size: 19 })] }),
                        new Paragraph({ text: '', spacing: { before: 800 } }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Trần Văn Minh', bold: true, size: 21 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, options?.fileName || 'Bao_Cao_Doan_Vien.docx');
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất tệp Word:', error);
    return false;
  }
}

/**
 * Xuất Báo Cáo Cá Nhân Đoàn Viên (Hoạt Động Tham Gia) ra tệp Word (.docx)
 */
export async function exportPersonalReportDocx(
  member: Member,
  unit: Unit | undefined,
  participationHistory: Array<{ participant: ProgramParticipant; program: Program }>,
  evaluation: Evaluation,
  fileName?: string
): Promise<boolean> {
  try {
    const dateStr = formatOfficialDateVN();

    // Table Header for activities
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Mã CT', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 3500, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Tên Chương Trình / Hoạt Động', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1600, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Thời gian', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Đơn vị tổ chức', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: cellBorder,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Trạng thái / Vai trò', bold: true, size: 20 })] })],
        }),
      ],
    });

    const activityRows = participationHistory.map(({ participant, program }, idx) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1500, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: program.program_code, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 3500, type: WidthType.DXA },
            borders: cellBorder,
            children: [
              new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: program.program_name, bold: true, size: 19 })] }),
              new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `Địa điểm: ${program.location}`, italics: true, size: 17, color: '666666' })] }),
            ],
          }),
          new TableCell({
            width: { size: 1600, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: formatDateVN(participant.participation_date), size: 19 })] })],
          }),
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: program.organizer, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            borders: cellBorder,
            children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: participant.status, bold: true, size: 19 })] })],
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1134,
                right: 850,
                bottom: 1134,
                left: 1701,
              },
            },
          },
          children: [
            // Header
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 45, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐOÀN TNCS HỒ CHÍ MINH', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unit?.unit_name || 'ĐOÀN TRƯỜNG ĐẠI HỌC', bold: true, size: 21, color: '1E3A8A' })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Mã ĐV: ${member.member_code}`, size: 19 })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 55, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 22 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Đà Nẵng, ${dateStr}`, italics: true, size: 20 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { before: 200, after: 100 } }),

            // Title
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'PHIẾU BÁO CÁO THAM GIA HOẠT ĐỘNG ĐOÀN',
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Chứng nhận quá trình rèn luyện & thành tích phong trào thanh niên',
                  italics: true,
                  size: 20,
                  color: '555555',
                }),
              ],
              spacing: { after: 250 },
            }),

            // Member Info Box
            new Paragraph({
              children: [
                new TextRun({ text: 'I. THÔNG TIN ĐOÀN VIÊN:', bold: true, size: 22 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '1. Họ và tên: ', size: 21 }),
                new TextRun({ text: member.full_name, bold: true, size: 21 }),
                new TextRun({ text: '          Giới tính: ', size: 21 }),
                new TextRun({ text: member.gender, bold: true, size: 21 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '2. Mã số sinh viên (MSSV): ', size: 21 }),
                new TextRun({ text: member.student_code, bold: true, size: 21 }),
                new TextRun({ text: '          Lớp: ', size: 21 }),
                new TextRun({ text: member.class, bold: true, size: 21 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '3. Khoa / Viện: ', size: 21 }),
                new TextRun({ text: member.faculty, size: 21 }),
                new TextRun({ text: '          Chi đoàn: ', size: 21 }),
                new TextRun({ text: unit?.unit_name || 'N/A', bold: true, size: 21 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '4. Chức vụ Đoàn: ', size: 21 }),
                new TextRun({ text: member.position, bold: true, size: 21 }),
                new TextRun({ text: '          Ngày vào Đoàn: ', size: 21 }),
                new TextRun({ text: formatDateVN(member.union_join_date), size: 21 }),
              ],
              spacing: { after: 200 },
            }),

            // Activity History
            new Paragraph({
              children: [
                new TextRun({ text: 'II. KẾT QUẢ THAM GIA HOẠT ĐỘNG PHONG TRÀO:', bold: true, size: 22 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `- Tổng số chương trình ghi nhận: `, size: 21 }),
                new TextRun({ text: `${participationHistory.length} hoạt động.`, bold: true, size: 21 }),
                new TextRun({ text: `\n- Xếp loại rèn luyện đề xuất: `, size: 21 }),
                new TextRun({ text: `${evaluation.proposed_result}.`, bold: true, size: 21 }),
                new TextRun({ text: `\n- Kết quả xác nhận của BCH: `, size: 21 }),
                new TextRun({ text: `${evaluation.confirmed_result}.`, bold: true, size: 21 }),
              ],
              spacing: { after: 150 },
            }),

            // Table of activities
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [headerRow, ...activityRows],
            }),

            new Paragraph({ text: '', spacing: { before: 300 } }),

            // Signatures
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BÍ THƯ CHI ĐOÀN', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, size: 18 })] }),
                        new Paragraph({ text: '', spacing: { before: 700 } }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: unit?.secretary || 'Bí thư Chi đoàn', bold: true, size: 20 })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TM. BAN CHẤP HÀNH ĐOÀN TRƯỜNG', bold: true, size: 21 })] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BÍ THƯ', italics: true, size: 19 })] }),
                        new Paragraph({ text: '', spacing: { before: 700 } }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Trần Văn Minh', bold: true, size: 21 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, fileName || `BaoCao_HoatDong_${member.student_code}_${member.full_name.replace(/\s+/g, '_')}.docx`);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất tệp Word cá nhân:', error);
    return false;
  }
}
