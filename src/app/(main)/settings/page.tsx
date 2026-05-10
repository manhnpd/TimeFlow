"use client";

import { useEffect, useState } from "react";
import { getUserPreferences, updateUserPreferences } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Ho_Chi_Minh",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [defaultView, setDefaultView] = useState("week");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function load() {
      const { preferences } = await getUserPreferences();
      if (preferences) {
        setTimezone(preferences.timezone || "UTC");
        setDefaultView(preferences.default_view || "week");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateUserPreferences({
      timezone,
      theme: theme ?? "dark",
      default_view: defaultView,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
                <SelectTrigger className="w-full h-10 bg-surface-container dark:bg-surface-container-low border-outline-variant/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Calendar Preferences */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Calendar
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default View</Label>
              <Select value={defaultView} onValueChange={(v) => v && setDefaultView(v)}>
                <SelectTrigger className="w-full h-10 bg-surface-container dark:bg-surface-container-low border-outline-variant/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                <SelectTrigger className="w-full h-10 bg-surface-container dark:bg-surface-container-low border-outline-variant/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
