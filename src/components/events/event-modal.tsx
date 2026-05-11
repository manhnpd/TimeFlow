"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions";
import { useEventStore } from "@/stores/event-store";
import {
  EVENT_COLORS,
  CATEGORIES,
  REMINDER_OPTIONS,
  type EventCategory,
  type CalendarEvent,
} from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

const eventSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string(),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  all_day: z.boolean(),
  color: z.string(),
  category: z.enum([
    "work",
    "personal",
    "health",
    "study",
    "entertainment",
    "other",
  ]),
  reminders: z.array(z.number()),
});

type EventFormValues = z.infer<typeof eventSchema>;

function dateToLocalInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function EventModal() {
  const { isEventModalOpen, selectedEvent, closeEventModal, addEvent, updateEvent: updateEventStore, removeEvent } =
    useEventStore();
  const [loading, setLoading] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);
  const isEditing = !!selectedEvent?.id;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: dateToLocalInput(new Date()),
      end_time: dateToLocalInput(
        new Date(Date.now() + 60 * 60 * 1000)
      ),
      all_day: false,
      color: "#3b82f6",
      category: "other",
      reminders: [],
    },
  });

  useEffect(() => {
    if (selectedEvent) {
      form.reset({
        title: selectedEvent.title,
        description: selectedEvent.description || "",
        start_time: dateToLocalInput(selectedEvent.start_time),
        end_time: dateToLocalInput(selectedEvent.end_time),
        all_day: selectedEvent.all_day,
        color: selectedEvent.color,
        category: selectedEvent.category as EventCategory,
        reminders: selectedEvent.reminders || [],
      });
      setSelectedReminders(selectedEvent.reminders || []);
    } else {
      form.reset({
        title: "",
        description: "",
        start_time: dateToLocalInput(new Date()),
        end_time: dateToLocalInput(
          new Date(Date.now() + 60 * 60 * 1000)
        ),
        all_day: false,
        color: "#3b82f6",
        category: "other",
        reminders: [],
      });
      setSelectedReminders([]);
    }
  }, [selectedEvent, form]);

  const toggleReminder = (value: number) => {
    const updated = selectedReminders.includes(value)
      ? selectedReminders.filter((r) => r !== value)
      : [...selectedReminders, value];
    setSelectedReminders(updated);
    form.setValue("reminders", updated);
  };

  const onSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      if (isEditing && selectedEvent) {
        const result = await updateEvent(selectedEvent.id, {
          ...values,
          description: values.description || "",
          reminders: selectedReminders,
        });
        if (result.error) {
          toast.error(result.error);
        } else if (result.event) {
          updateEventStore(result.event);
          toast.success("Đã cập nhật sự kiện");
          closeEventModal();
        }
      } else {
        const result = await createEvent({
          ...values,
          description: values.description || "",
          reminders: selectedReminders,
        });
        if (result.error) {
          toast.error(result.error);
        } else if (result.event) {
          addEvent(result.event);
          toast.success("Đã tạo sự kiện");
          closeEventModal();
        }
      }
    } catch {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    setLoading(true);
    const result = await deleteEvent(selectedEvent.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      removeEvent(selectedEvent.id);
      toast.success("Đã xóa sự kiện");
      closeEventModal();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isEventModalOpen} onOpenChange={(open) => !open && closeEventModal()}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Chỉnh sửa sự kiện" : "Sự kiện mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề sự kiện"
              {...form.register("title")}
              className="h-10 bg-surface-container-low dark:bg-surface-container-low border-outline-variant/30"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Thêm mô tả..."
              rows={2}
              {...form.register("description")}
              className="bg-surface-container-low dark:bg-surface-container-low border-outline-variant/30 resize-none"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Cả ngày</Label>
            <Switch
              checked={form.watch("all_day")}
              onCheckedChange={(checked) => form.setValue("all_day", checked)}
            />
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bắt đầu</Label>
              <Input
                type={form.watch("all_day") ? "date" : "datetime-local"}
                {...form.register("start_time")}
                className="h-10 bg-surface-container-low dark:bg-surface-container-low border-outline-variant/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Kết thúc</Label>
              <Input
                type={form.watch("all_day") ? "date" : "datetime-local"}
                {...form.register("end_time")}
                className="h-10 bg-surface-container-low dark:bg-surface-container-low border-outline-variant/30"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) =>
                val && form.setValue("category", val as EventCategory)
              }
            >
              <SelectTrigger className="h-10 bg-surface-container-low dark:bg-surface-container-low border-outline-variant/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Màu sắc</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => form.setValue("color", c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.watch("color") === c.value
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-2">
            <Label>Nhắc nhở</Label>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant={
                    selectedReminders.includes(opt.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer select-none"
                  onClick={() => toggleReminder(opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <DialogFooter className="pt-2 gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="text-destructive hover:text-destructive mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeEventModal}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-primary text-primary-foreground"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {isEditing ? "Lưu thay đổi" : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
