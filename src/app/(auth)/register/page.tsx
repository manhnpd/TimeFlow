"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2, TrendingUp, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    if (password !== confirmPassword) { toast.error("Mật khẩu không khớp"); return; }
    if (password.length < 6) { toast.error("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Tài khoản đã tạo! Vui lòng kiểm tra email.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-6xl relative z-10">
        {/* Left side - Marketing */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Calendar size={28} />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ScheduleMe</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Quản lý lịch trình thông minh cho bạn.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Tối ưu hóa quy trình làm việc, phân bổ thời gian và theo dõi hiệu suất một cách liền mạch.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="bg-card border border-border p-6 rounded-2xl">
              <TrendingUp className="text-blue-400 mb-3" size={24} />
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Hiệu suất tăng</div>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl">
              <Users className="text-purple-400 mb-3" size={24} />
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Người dùng tin chọn</div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-[480px] bg-card/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground">Bắt đầu miễn phí</h3>
              <p className="text-muted-foreground mt-1">Tham gia ngay hôm nay.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary border-border/50 rounded-xl focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-secondary border-border/50 rounded-xl focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-secondary border-border/50 rounded-xl focus:border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Tạo tài khoản <ArrowRight size={18} /></>}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-8">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
