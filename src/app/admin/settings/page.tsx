"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAllSettings, saveSettings, exportData, importData } from "@/actions/settings";
import { downloadBlob } from "@/lib/utils";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return COMMON_TIMEZONES;
  }
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [tzSearch, setTzSearch] = useState("");
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

  const allTimezones = useMemo(() => getAllTimezones(), []);

  const filteredTimezones = useMemo(() => {
    if (!tzSearch) return COMMON_TIMEZONES;
    const q = tzSearch.toLowerCase();
    return allTimezones.filter((tz) => tz.toLowerCase().includes(q));
  }, [tzSearch, allTimezones]);

  useEffect(() => {
    getAllSettings().then(setValues);
  }, []);

  async function handleSave(formData: FormData) {
    await saveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExport() {
    const json = await exportData();
    downloadBlob(json, "status-page-export.json", "application/json");
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = await importData(text);
      setImportResult(result.message ?? result.error ?? null);
      setTimeout(() => setImportResult(null), 3000);
    };
    input.click();
  }

  const selectedTz = values.timezone || "";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                name="site_name"
                defaultValue={values.site_name}
                placeholder="Status Page"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Input
                id="site_description"
                name="site_description"
                defaultValue={values.site_description}
                placeholder="Current status of our services"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                defaultValue={values.logo_url}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone_display">Timezone</Label>
              <p className="text-[12px] text-muted-foreground">
                All dates and times will be displayed in this timezone.
              </p>
              <input type="hidden" name="timezone" value={selectedTz} />
              <div className="relative">
                <Input
                  id="timezone_display"
                  value={tzDropdownOpen ? tzSearch : selectedTz || ""}
                  placeholder="Search timezones... (default: UTC)"
                  onChange={(e) => {
                    setTzSearch(e.target.value);
                    if (!tzDropdownOpen) setTzDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setTzDropdownOpen(true);
                    setTzSearch("");
                  }}
                  onBlur={() => {
                    // Delay to allow click on option
                    setTimeout(() => setTzDropdownOpen(false), 150);
                  }}
                  autoComplete="off"
                />
                {tzDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md">
                    {filteredTimezones.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No timezones found
                      </div>
                    ) : (
                      filteredTimezones.map((tz) => (
                        <button
                          key={tz}
                          type="button"
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                            tz === selectedTz ? "bg-accent font-medium" : ""
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setValues((v) => ({ ...v, timezone: tz }));
                            setTzDropdownOpen(false);
                            setTzSearch("");
                          }}
                        >
                          {tz}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <hr />
            <h3 className="font-medium">SMTP Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">Host</Label>
                <Input
                  id="smtp_host"
                  name="smtp_host"
                  defaultValue={values.smtp_host}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_port">Port</Label>
                <Input
                  id="smtp_port"
                  name="smtp_port"
                  defaultValue={values.smtp_port || "587"}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_user">User</Label>
                <Input
                  id="smtp_user"
                  name="smtp_user"
                  defaultValue={values.smtp_user}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_pass">Password</Label>
                <Input
                  id="smtp_pass"
                  name="smtp_pass"
                  type="password"
                  defaultValue={values.smtp_pass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_from">From Address</Label>
              <Input
                id="smtp_from"
                name="smtp_from"
                defaultValue={values.smtp_from}
                placeholder="status@example.com"
              />
            </div>
            <Button type="submit">{saved ? "Saved!" : "Save Settings"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import / Export</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button variant="outline" onClick={handleExport}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleImport}>
            Import JSON
          </Button>
          {importResult && (
            <span className="text-sm self-center">{importResult}</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
