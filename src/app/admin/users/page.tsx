"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/admin-actions";
import type { AdminUser } from "@/types";
import {
  Search, Filter, UserPlus, Edit, Trash2, Users, ShieldCheck,
  ChevronLeft, ChevronRight, Loader2, UserCog, AlertTriangle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const result = await getAllUsers({
      page,
      pageSize: 10,
      search: search || undefined,
      roleFilter: roleFilter !== "all" ? parseInt(roleFilter) : undefined,
    });
    if (result.users) {
      setUsers(result.users);
      setTotalPages(result.totalPages ?? 1);
      setTotal(result.total ?? 0);
    }
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    else loadUsers();
  }, [search, roleFilter]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const newRole = selectedUser.role === 1 ? 0 : 1;
    const result = await updateUserRole(selectedUser.userId, newRole);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(newRole === 1 ? "Đã cấp quyền Admin" : "Đã hạ quyền User");
      setEditDialogOpen(false);
      loadUsers();
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const result = await deleteUser(selectedUser.userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa người dùng");
      setDeleteDialogOpen(false);
      loadUsers();
    }
    setActionLoading(false);
  };

  const adminCount = users.filter((u) => u.role === 1).length;
  const activeCount = users.filter((u) => u.lastActive).length;

  const statCards = [
    { label: "Tổng người dùng hoạt động", value: total.toString(), icon: Users, color: "border-blue-500" },
    { label: "Quản trị viên hệ thống", value: adminCount.toString(), icon: ShieldCheck, color: "border-amber-500" },
    { label: "Đang hoạt động", value: activeCount.toString(), icon: UserCog, color: "border-emerald-500" },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-muted-foreground text-sm">Quản lý tài khoản và phân quyền người dùng.</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => v && setRoleFilter(v)}>
          <SelectTrigger className="w-[160px] h-10 bg-card border border-border">
            <Filter size={16} className="text-muted-foreground mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="1">Admin</SelectItem>
            <SelectItem value="0">Người dùng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("bg-card p-5 rounded-xl border-l-4 shadow-sm", stat.color)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon size={18} className="text-foreground" />
              </div>
              <div>
                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{stat.label}</h3>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Danh sách người dùng</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Người dùng</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vai trò</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trạng thái</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sự kiện</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.userId} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              Tham gia {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          u.role === 1 ? "bg-amber-400/10 text-amber-500" : "bg-secondary text-muted-foreground"
                        )}>
                          {u.role === 1 ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", u.lastActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                          <span className="text-sm text-foreground">{u.lastActive ? "Hoạt động" : "Ngoại tuyến"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{u.eventCount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedUser(u); setEditDialogOpen(true); }}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg"
                            title="Chỉnh sửa vai trò"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedUser(u); setDeleteDialogOpen(true); }}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Trang {page} / {totalPages} — {total} người dùng
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                        pageNum === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò của {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Vai trò hiện tại: <span className="font-bold text-foreground">{selectedUser?.role === 1 ? "Admin" : "User"}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vai trò mới: <span className="font-bold text-foreground">{selectedUser?.role === 1 ? "User" : "Admin"}</span>
            </p>
            {selectedUser?.role === 0 && (
              <p className="text-xs text-amber-500 mt-3 flex items-center gap-1">
                <AlertTriangle size={14} />
                Cấp quyền Admin sẽ cho phép người dùng truy cập trang quản trị.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading}>
              Hủy
            </Button>
            <Button onClick={handleUpdateRole} disabled={actionLoading} className="bg-primary text-primary-foreground">
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <span className="font-bold text-foreground">{selectedUser?.fullName}</span>?
              Hành động này không thể hoàn tác. Tất cả sự kiện và dữ liệu của người dùng sẽ bị xóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Xóa người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
