import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Member, 
  Unit, 
  Program, 
  ProgramParticipant, 
  Evaluation, 
  UserProfile, 
  TabType,
  UserRole,
  ConfirmedResult
} from '../types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_UNITS, 
  INITIAL_PROGRAMS, 
  INITIAL_PARTICIPANTS, 
  INITIAL_EVALUATIONS,
  DEMO_USERS 
} from '../data/mockData';
import { calculateProposedResult } from '../utils/evaluation';

const STORAGE_KEYS = {
  MEMBERS: 'yd_members_v1',
  UNITS: 'yd_units_v1',
  PROGRAMS: 'yd_programs_v1',
  PARTICIPANTS: 'yd_participants_v1',
  EVALUATIONS: 'yd_evaluations_v1',
  CURRENT_USER: 'yd_user_v1',
};

interface AppContextType {
  // Navigation & Auth
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  allUsers: UserProfile[];

  // Data
  members: Member[];
  units: Unit[];
  programs: Program[];
  participants: ProgramParticipant[];
  evaluations: Record<string, Evaluation>;

  // Dynamic getters
  getMemberParticipationCount: (memberId: string) => number;
  getMemberPrograms: (memberId: string) => Array<{ participant: ProgramParticipant; program: Program }>;
  getProgramParticipantsList: (programId: string) => Array<{ participant: ProgramParticipant; member: Member; unit?: Unit }>;
  getMemberEvaluation: (memberId: string) => Evaluation;
  getUnitMemberCount: (unitId: string) => number;

  // Actions - Members
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => Member;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  batchDeleteMembers: (ids: string[]) => void;

  // Actions - Units
  addUnit: (unit: Omit<Unit, 'id'>) => Unit;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => boolean;

  // Actions - Programs
  addProgram: (program: Omit<Program, 'id'>) => Program;
  updateProgram: (id: string, program: Partial<Program>) => void;
  deleteProgram: (id: string) => void;

  // Actions - Program Participants
  addParticipantToProgram: (programId: string, memberId: string, status?: ProgramParticipant['status'], note?: string) => boolean;
  addMultipleParticipantsToProgram: (programId: string, memberIds: string[]) => { added: number; skipped: number };
  removeParticipantFromProgram: (programId: string, memberId: string) => void;

  // Actions - Evaluations
  updateEvaluation: (memberId: string, data: { confirmed_result: ConfirmedResult; comment?: string; evaluator?: string }) => void;
  batchConfirmAllProposed: () => void;

  // System
  resetToDemoData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonStr: string) => boolean;

  // Dashboard Stats
  dashboardStats: {
    totalMembers: number;
    totalUnits: number;
    totalPrograms: number;
    totalParticipations: number;
    totalDat: number;
    totalChuaDat: number;
    totalKhenThuong: number;
    unitDistribution: Array<{ unit: Unit; count: number }>;
    programDistribution: Array<{ program: Program; count: number }>;
    topMembers: Array<{ member: Member; unit?: Unit; count: number; proposed: string; confirmed: string }>;
  };

  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Auth / Current User
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEMO_USERS[0]; // Admin by default
  });

  const switchRole = useCallback((role: UserRole) => {
    const user = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    showToast(`Đã chuyển sang vai trò: ${user.title}`, 'info');
  }, [showToast]);

  // Main Data States
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MEMBERS;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_UNITS;
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROGRAMS;
  });

  const [participants, setParticipants] = useState<ProgramParticipant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PARTICIPANTS;
  });

  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Seed default evaluations
    const initialMap: Record<string, Evaluation> = {};
    INITIAL_MEMBERS.forEach((m) => {
      const partCount = INITIAL_PARTICIPANTS.filter((p) => p.member_id === m.id).length;
      const proposed = calculateProposedResult(partCount);
      const existing = INITIAL_EVALUATIONS[m.id];
      initialMap[m.id] = {
        id: `eval-${m.id}`,
        member_id: m.id,
        participation_count: partCount,
        proposed_result: proposed,
        confirmed_result: existing?.confirmed_result || 'Chưa xác nhận',
        evaluator: existing?.evaluator || '',
        evaluation_date: existing?.evaluation_date || '',
        comment: existing?.comment || '',
      };
    });
    return initialMap;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  // Dynamic Getters
  const getMemberParticipationCount = useCallback((memberId: string) => {
    return participants.filter(p => p.member_id === memberId).length;
  }, [participants]);

  const getMemberPrograms = useCallback((memberId: string) => {
    const memberParts = participants.filter(p => p.member_id === memberId);
    return memberParts.map(part => ({
      participant: part,
      program: programs.find(p => p.id === part.program_id) || {
        id: part.program_id,
        program_code: 'UNKNOWN',
        program_name: 'Chương trình không xác định',
        description: '',
        start_date: part.participation_date,
        end_date: part.participation_date,
        location: '',
        organizer: 'Đoàn trường',
        manager: '',
        status: 'Đã hoàn thành',
      },
    })).sort((a, b) => new Date(b.participant.participation_date).getTime() - new Date(a.participant.participation_date).getTime());
  }, [participants, programs]);

  const getProgramParticipantsList = useCallback((programId: string) => {
    const progParts = participants.filter(p => p.program_id === programId);
    return progParts.map(part => {
      const member = members.find(m => m.id === part.member_id) || {
        id: part.member_id,
        member_code: 'N/A',
        full_name: 'Đoàn viên không tồn tại',
        date_of_birth: '',
        gender: 'Nam',
        phone: '',
        email: '',
        student_code: '',
        class: '',
        faculty: '',
        unit_id: '',
        position: 'Đoàn viên',
        union_join_date: '',
        address: '',
        avatar_url: '',
        status: 'Đang sinh hoạt',
        created_at: '',
        updated_at: '',
      };
      const unit = units.find(u => u.id === member.unit_id);
      return { participant: part, member, unit };
    });
  }, [participants, members, units]);

  const getMemberEvaluation = useCallback((memberId: string): Evaluation => {
    const count = getMemberParticipationCount(memberId);
    const proposed = calculateProposedResult(count);
    const existing = evaluations[memberId];
    if (existing) {
      // Keep participation_count and proposed_result up to date in real time!
      return {
        ...existing,
        participation_count: count,
        proposed_result: proposed,
      };
    }
    return {
      id: `eval-${memberId}`,
      member_id: memberId,
      participation_count: count,
      proposed_result: proposed,
      confirmed_result: 'Chưa xác nhận',
      evaluator: '',
      evaluation_date: '',
      comment: '',
    };
  }, [evaluations, getMemberParticipationCount]);

  const getUnitMemberCount = useCallback((unitId: string) => {
    return members.filter(m => m.unit_id === unitId).length;
  }, [members]);

  // Synchronize evaluation state when participants change
  useEffect(() => {
    setEvaluations(prev => {
      const updated = { ...prev };
      let changed = false;
      members.forEach(m => {
        const count = participants.filter(p => p.member_id === m.id).length;
        const proposed = calculateProposedResult(count);
        const curr = updated[m.id];
        if (!curr || curr.participation_count !== count || curr.proposed_result !== proposed) {
          changed = true;
          updated[m.id] = {
            id: curr?.id || `eval-${m.id}`,
            member_id: m.id,
            participation_count: count,
            proposed_result: proposed,
            confirmed_result: curr?.confirmed_result || 'Chưa xác nhận',
            evaluator: curr?.evaluator || '',
            evaluation_date: curr?.evaluation_date || '',
            comment: curr?.comment || '',
          };
        }
      });
      return changed ? updated : prev;
    });
  }, [participants, members]);

  // Actions - Members
  const addMember = useCallback((newMemberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
    const id = `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      ...newMemberData,
      id,
      created_at: now,
      updated_at: now,
    };
    setMembers(prev => [newMember, ...prev]);
    showToast(`Đã thêm đoàn viên "${newMember.full_name}" thành công!`, 'success');
    return newMember;
  }, [showToast]);

  const updateMember = useCallback((id: string, updatedFields: Partial<Member>) => {
    const now = new Date().toISOString().split('T')[0];
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields, updated_at: now } : m));
    showToast('Đã cập nhật thông tin đoàn viên thành công!', 'success');
  }, [showToast]);

  const deleteMember = useCallback((id: string) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    // Remove participant records
    setParticipants(prev => prev.filter(p => p.member_id !== id));
    // Remove evaluation
    setEvaluations(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast(`Đã xóa đoàn viên "${member?.full_name || id}"!`, 'info');
  }, [members, showToast]);

  const batchDeleteMembers = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setMembers(prev => prev.filter(m => !idSet.has(m.id)));
    setParticipants(prev => prev.filter(p => !idSet.has(p.member_id)));
    setEvaluations(prev => {
      const next = { ...prev };
      ids.forEach(id => delete next[id]);
      return next;
    });
    showToast(`Đã xóa thành công ${ids.length} đoàn viên đã chọn!`, 'info');
  }, [showToast]);

  // Actions - Units
  const addUnit = useCallback((newUnitData: Omit<Unit, 'id'>) => {
    const id = `unit-${Date.now().toString(36)}`;
    const newUnit: Unit = { ...newUnitData, id };
    setUnits(prev => [...prev, newUnit]);
    showToast(`Đã thêm chi đoàn "${newUnit.unit_name}"!`, 'success');
    return newUnit;
  }, [showToast]);

  const updateUnit = useCallback((id: string, updatedFields: Partial<Unit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    showToast('Đã cập nhật chi đoàn thành công!', 'success');
  }, [showToast]);

  const deleteUnit = useCallback((id: string): boolean => {
    const count = members.filter(m => m.unit_id === id).length;
    if (count > 0) {
      showToast(`Không thể xóa đơn vị vì đang có ${count} đoàn viên thuộc đơn vị này!`, 'error');
      return false;
    }
    const unit = units.find(u => u.id === id);
    setUnits(prev => prev.filter(u => u.id !== id));
    showToast(`Đã xóa chi đoàn "${unit?.unit_name || id}"!`, 'info');
    return true;
  }, [members, units, showToast]);

  // Actions - Programs
  const addProgram = useCallback((newProgData: Omit<Program, 'id'>) => {
    const id = `prog-${Date.now().toString(36)}`;
    const newProg: Program = { ...newProgData, id };
    setPrograms(prev => [newProg, ...prev]);
    showToast(`Đã thêm chương trình "${newProg.program_name}"!`, 'success');
    return newProg;
  }, [showToast]);

  const updateProgram = useCallback((id: string, updatedFields: Partial<Program>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    showToast('Đã cập nhật thông tin chương trình!', 'success');
  }, [showToast]);

  const deleteProgram = useCallback((id: string) => {
    const prog = programs.find(p => p.id === id);
    setPrograms(prev => prev.filter(p => p.id !== id));
    // Remove participant records for this program
    setParticipants(prev => prev.filter(p => p.program_id !== id));
    showToast(`Đã xóa chương trình "${prog?.program_name || id}"!`, 'info');
  }, [programs, showToast]);

  // Actions - Program Participants
  const addParticipantToProgram = useCallback((
    programId: string, 
    memberId: string, 
    status: ProgramParticipant['status'] = 'Có mặt', 
    note: string = ''
  ): boolean => {
    // Check duplication: program_id + member_id cannot be duplicated!
    const exists = participants.some(p => p.program_id === programId && p.member_id === memberId);
    if (exists) {
      showToast('Đoàn viên này đã được ghi nhận trong chương trình!', 'error');
      return false;
    }

    const prog = programs.find(p => p.id === programId);
    const participation_date = prog?.start_date || new Date().toISOString().split('T')[0];
    const newParticipant: ProgramParticipant = {
      id: `part-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      program_id: programId,
      member_id: memberId,
      participation_date,
      status,
      note,
    };

    setParticipants(prev => [...prev, newParticipant]);
    const mem = members.find(m => m.id === memberId);
    showToast(`Đã ghi nhận đoàn viên "${mem?.full_name}" tham gia chương trình!`, 'success');
    return true;
  }, [participants, programs, members, showToast]);

  const addMultipleParticipantsToProgram = useCallback((
    programId: string, 
    memberIds: string[]
  ): { added: number; skipped: number } => {
    const prog = programs.find(p => p.id === programId);
    const participation_date = prog?.start_date || new Date().toISOString().split('T')[0];

    const currentProgMembers = new Set(
      participants.filter(p => p.program_id === programId).map(p => p.member_id)
    );

    const toAdd: ProgramParticipant[] = [];
    let skipped = 0;

    for (const memId of memberIds) {
      if (currentProgMembers.has(memId)) {
        skipped++;
      } else {
        toAdd.push({
          id: `part-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          program_id: programId,
          member_id: memId,
          participation_date,
          status: 'Có mặt',
          note: '',
        });
      }
    }

    if (toAdd.length > 0) {
      setParticipants(prev => [...prev, ...toAdd]);
      showToast(`Đã thêm thành công ${toAdd.length} đoàn viên vào chương trình!${skipped > 0 ? ` (Bỏ qua ${skipped} đoàn viên đã có)` : ''}`, 'success');
    } else {
      showToast('Tất cả đoàn viên được chọn đã có trong chương trình này!', 'info');
    }

    return { added: toAdd.length, skipped };
  }, [programs, participants, showToast]);

  const removeParticipantFromProgram = useCallback((programId: string, memberId: string) => {
    setParticipants(prev => prev.filter(p => !(p.program_id === programId && p.member_id === memberId)));
    const mem = members.find(m => m.id === memberId);
    showToast(`Đã xóa đoàn viên "${mem?.full_name || memberId}" khỏi chương trình. Tự động cập nhật lại đánh giá!`, 'info');
  }, [members, showToast]);

  // Actions - Evaluations
  const updateEvaluation = useCallback((
    memberId: string, 
    data: { confirmed_result: ConfirmedResult; comment?: string; evaluator?: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const count = getMemberParticipationCount(memberId);
    const proposed = calculateProposedResult(count);

    setEvaluations(prev => ({
      ...prev,
      [memberId]: {
        id: prev[memberId]?.id || `eval-${memberId}`,
        member_id: memberId,
        participation_count: count,
        proposed_result: proposed,
        confirmed_result: data.confirmed_result,
        evaluator: data.evaluator || currentUser.name,
        evaluation_date: today,
        comment: data.comment !== undefined ? data.comment : (prev[memberId]?.comment || ''),
      },
    }));
    showToast('Đã lưu kết quả xác nhận đánh giá đoàn viên!', 'success');
  }, [getMemberParticipationCount, currentUser.name, showToast]);

  const batchConfirmAllProposed = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setEvaluations(prev => {
      const next = { ...prev };
      members.forEach(m => {
        const count = participants.filter(p => p.member_id === m.id).length;
        const proposed = calculateProposedResult(count);
        const curr = next[m.id];
        // Map proposed to confirmed title
        let mappedConfirmed: ConfirmedResult = 'Đạt';
        if (proposed === 'CHƯA ĐẠT') mappedConfirmed = 'Chưa đạt';
        else if (proposed === 'ĐỀ XUẤT KHEN THƯỞNG') mappedConfirmed = 'Đề xuất khen thưởng';

        next[m.id] = {
          id: curr?.id || `eval-${m.id}`,
          member_id: m.id,
          participation_count: count,
          proposed_result: proposed,
          confirmed_result: mappedConfirmed,
          evaluator: currentUser.name,
          evaluation_date: today,
          comment: curr?.comment || `Tự động xác nhận theo kết quả đề xuất (${count} hoạt động)`,
        };
      });
      return next;
    });
    showToast('Đã đồng bộ kết quả xác nhận theo đề xuất cho tất cả đoàn viên!', 'success');
  }, [members, participants, currentUser.name, showToast]);

  // System actions
  const resetToDemoData = useCallback(() => {
    setMembers(INITIAL_MEMBERS);
    setUnits(INITIAL_UNITS);
    setPrograms(INITIAL_PROGRAMS);
    setParticipants(INITIAL_PARTICIPANTS);

    const initialMap: Record<string, Evaluation> = {};
    INITIAL_MEMBERS.forEach((m) => {
      const partCount = INITIAL_PARTICIPANTS.filter((p) => p.member_id === m.id).length;
      const proposed = calculateProposedResult(partCount);
      const existing = INITIAL_EVALUATIONS[m.id];
      initialMap[m.id] = {
        id: `eval-${m.id}`,
        member_id: m.id,
        participation_count: partCount,
        proposed_result: proposed,
        confirmed_result: existing?.confirmed_result || 'Chưa xác nhận',
        evaluator: existing?.evaluator || '',
        evaluation_date: existing?.evaluation_date || '',
        comment: existing?.comment || '',
      };
    });
    setEvaluations(initialMap);

    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.UNITS);
    localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);

    showToast('Đã khôi phục dữ liệu mẫu ban đầu thành công!', 'success');
  }, [showToast]);

  const exportDatabaseJson = useCallback(() => {
    const data = {
      members,
      units,
      programs,
      participants,
      evaluations,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuLieu_DoanVien_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống tệp sao lưu JSON!', 'success');
  }, [members, units, programs, participants, evaluations, showToast]);

  const importDatabaseJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.members && parsed.units && parsed.programs && parsed.participants) {
        setMembers(parsed.members);
        setUnits(parsed.units);
        setPrograms(parsed.programs);
        setParticipants(parsed.participants);
        if (parsed.evaluations) setEvaluations(parsed.evaluations);
        showToast('Nhập dữ liệu JSON thành công!', 'success');
        return true;
      }
      showToast('Định dạng tệp JSON không hợp lệ!', 'error');
      return false;
    } catch {
      showToast('Lỗi khi đọc file JSON!', 'error');
      return false;
    }
  }, [showToast]);

  // Dashboard Stats Memo
  const dashboardStats = useMemo(() => {
    const totalMembers = members.length;
    const totalUnits = units.length;
    const totalPrograms = programs.length;
    const totalParticipations = participants.length;

    let totalDat = 0;
    let totalChuaDat = 0;
    let totalKhenThuong = 0;

    const memberStats = members.map(m => {
      const count = participants.filter(p => p.member_id === m.id).length;
      const proposed = calculateProposedResult(count);
      const evalItem = evaluations[m.id];
      const confirmed = evalItem?.confirmed_result || 'Chưa xác nhận';

      if (proposed === 'ĐẠT') totalDat++;
      else if (proposed === 'CHƯA ĐẠT') totalChuaDat++;
      else if (proposed === 'ĐỀ XUẤT KHEN THƯỞNG') totalKhenThuong++;

      return {
        member: m,
        unit: units.find(u => u.id === m.unit_id),
        count,
        proposed,
        confirmed,
      };
    });

    // Top active members
    const topMembers = [...memberStats]
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Distribution by Unit
    const unitDistribution = units.map(unit => ({
      unit,
      count: members.filter(m => m.unit_id === unit.id).length,
    }));

    // Distribution by Program
    const programDistribution = programs.map(program => ({
      program,
      count: participants.filter(p => p.program_id === program.id).length,
    }));

    return {
      totalMembers,
      totalUnits,
      totalPrograms,
      totalParticipations,
      totalDat,
      totalChuaDat,
      totalKhenThuong,
      unitDistribution,
      programDistribution,
      topMembers,
    };
  }, [members, units, programs, participants, evaluations]);

  const value = {
    currentTab,
    setCurrentTab,
    currentUser,
    setCurrentUser,
    switchRole,
    allUsers: DEMO_USERS,
    members,
    units,
    programs,
    participants,
    evaluations,
    getMemberParticipationCount,
    getMemberPrograms,
    getProgramParticipantsList,
    getMemberEvaluation,
    getUnitMemberCount,
    addMember,
    updateMember,
    deleteMember,
    batchDeleteMembers,
    addUnit,
    updateUnit,
    deleteUnit,
    addProgram,
    updateProgram,
    deleteProgram,
    addParticipantToProgram,
    addMultipleParticipantsToProgram,
    removeParticipantFromProgram,
    updateEvaluation,
    batchConfirmAllProposed,
    resetToDemoData,
    exportDatabaseJson,
    importDatabaseJson,
    dashboardStats,
    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
