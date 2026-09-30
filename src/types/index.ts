export type Gender = 'Nam' | 'Nữ';

export type MemberStatus = 'Đang sinh hoạt' | 'Tạm nghỉ' | 'Đã chuyển sinh hoạt';

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string;
  email: string;
  student_code: string;
  class: string;
  faculty: string;
  unit_id: string;
  position: string;
  union_join_date: string;
  address: string;
  avatar_url: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export type UnitStatus = 'Hoạt động' | 'Tạm dừng';

export interface Unit {
  id: string;
  unit_code: string;
  unit_name: string;
  faculty: string;
  secretary: string;
  vice_secretary: string;
  status: UnitStatus;
}

export type ProgramStatus = 'Sắp diễn ra' | 'Đang diễn ra' | 'Đã hoàn thành' | 'Đã hủy';

export interface Program {
  id: string;
  program_code: string;
  program_name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer: string;
  manager: string;
  status: ProgramStatus;
  image_url?: string;
  note?: string;
}

export type ParticipantStatus = 'Có mặt' | 'Hoàn thành xuất sắc' | 'Ban tổ chức' | 'Vắng mặt';

export interface ProgramParticipant {
  id: string;
  program_id: string;
  member_id: string;
  participation_date: string;
  status: ParticipantStatus;
  note?: string;
}

export type ProposedResult = 'CHƯA ĐẠT' | 'ĐẠT' | 'ĐỀ XUẤT KHEN THƯỞNG';

export type ConfirmedResult = 
  | 'Chưa xác nhận' 
  | 'Chưa đạt' 
  | 'Đạt' 
  | 'Đề xuất khen thưởng' 
  | 'Khen thưởng cấp Khoa' 
  | 'Khen thưởng cấp Trường';

export interface Evaluation {
  id: string;
  member_id: string;
  participation_count: number;
  proposed_result: ProposedResult;
  confirmed_result: ConfirmedResult;
  evaluator: string;
  evaluation_date: string;
  comment: string;
}

export type UserRole = 'ADMIN' | 'CAN_BO_DOAN' | 'NGUOI_XEM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  unit: string;
  avatar: string;
}

export type TabType = 
  | 'dashboard' 
  | 'members' 
  | 'units' 
  | 'programs' 
  | 'participations' 
  | 'evaluations' 
  | 'reports-excel' 
  | 'reports-pdf';
