"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const settingsTabs = ["معلومات العيادة", "أوقات العمل", "الإشعارات", "المستخدمون", "الأسعار"]

const defaultSchedule = [
  { day: "السبت", active: true, start: "٠٩:٠٠", end: "٢١:٠٠", breakStart: "١٣:٣٠", breakEnd: "١٤:٣٠" },
  { day: "الأحد", active: true, start: "٠٩:٠٠", end: "٢١:٠٠", breakStart: "١٣:٣٠", breakEnd: "١٤:٣٠" },
  { day: "الإثنين", active: true, start: "٠٩:٠٠", end: "٢١:٠٠", breakStart: "١٣:٣٠", breakEnd: "١٤:٣٠" },
  { day: "الثلاثاء", active: true, start: "٠٩:٠٠", end: "٢١:٠٠", breakStart: "١٣:٣٠", breakEnd: "١٤:٣٠" },
  { day: "الأربعاء", active: true, start: "٠٩:٠٠", end: "٢١:٠٠", breakStart: "١٣:٣٠", breakEnd: "١٤:٣٠" },
  { day: "الخميس", active: true, start: "٠٩:٠٠", end: "١٧:٠٠", breakStart: "١٣:٠٠", breakEnd: "١٤:٠٠" },
  { day: "الجمعة", active: false, start: "-- : --", end: "-- : --", breakStart: "-- : --", breakEnd: "-- : --" },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("أوقات العمل")
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [duration, setDuration] = useState(25)
  const [maxAppts, setMaxAppts] = useState(30)

  function toggleDay(idx: number) {
    setSchedule((prev) => {
      const next = [...prev]
      const row = { ...next[idx] }
      if (row.active) {
        row.active = false
        row.start = "-- : --"
        row.end = "-- : --"
        row.breakStart = "-- : --"
        row.breakEnd = "-- : --"
      } else {
        row.active = true
        row.start = "٠٩:٠٠"
        row.end = "٢١:٠٠"
        row.breakStart = "١٣:٣٠"
        row.breakEnd = "١٤:٣٠"
      }
      next[idx] = row
      return next
    })
  }

  function updateTime(idx: number, field: "start" | "end" | "breakStart" | "breakEnd", value: string) {
    setSchedule((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function handleSave() {
    alert("تم حفظ إعدادات أوقات العمل بنجاح")
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Settings Sub-Sidebar */}
      <aside className="lg:w-56 shrink-0">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap text-right px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#1A6B5A] text-white shadow-sm"
                  : "bg-white text-muted-foreground hover:bg-[#1A6B5A]/5 border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#1A6B5A]">أوقات العمل</h2>
          <p className="text-xs text-muted-foreground mt-1">تحديد ساعات العمل وفترات الراحة اليومية</p>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1A6B5A]/5">
                <th className="text-right p-3 font-bold text-[#1A6B5A]">اليوم</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">الحالة</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">بداية الدوام</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">نهاية الدوام</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">بداية الاستراحة</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">نهاية الاستراحة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedule.map((row, i) => (
                <tr key={i} className={row.active ? "" : "bg-gray-50/50 opacity-55"}>
                  <td className="p-3 font-semibold text-on-surface">{row.day}</td>
                  <td className="p-3">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={() => toggleDay(i)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DBFA0]" />
                      <span className="mr-2 text-[10px] font-medium">
                        {row.active ? "نشط" : "عطلة"}
                      </span>
                    </label>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      disabled={!row.active}
                      value={row.start}
                      onChange={(e) => updateTime(i, "start", e.target.value)}
                      className="w-16 px-2 py-1 border border-border rounded-lg text-center text-xs bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      disabled={!row.active}
                      value={row.end}
                      onChange={(e) => updateTime(i, "end", e.target.value)}
                      className="w-16 px-2 py-1 border border-border rounded-lg text-center text-xs bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      disabled={!row.active}
                      value={row.breakStart}
                      onChange={(e) => updateTime(i, "breakStart", e.target.value)}
                      className="w-16 px-2 py-1 border border-border rounded-lg text-center text-xs bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      disabled={!row.active}
                      value={row.breakEnd}
                      onChange={(e) => updateTime(i, "breakEnd", e.target.value)}
                      className="w-16 px-2 py-1 border border-border rounded-lg text-center text-xs bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Duration & Max Appointments */}
        <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Duration Stepper */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-on-surface">مدة الكشف</span>
            <p className="text-[10px] text-muted-foreground">تستخدم لتقسيم ساعات العمل على فترات الحجز</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDuration((d) => Math.max(10, d - 5))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold text-[#1A6B5A] min-w-[80px] text-center">{duration} دقيقة</span>
              <button
                onClick={() => setDuration((d) => Math.min(90, d + 5))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Max Appointments Slider */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-on-surface">الحد الأقصى للحجوزات اليومية</span>
            <p className="text-[10px] text-muted-foreground">لمنع ازدحام العيادة</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10}
                max={60}
                value={maxAppts}
                onChange={(e) => setMaxAppts(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A6B5A]"
              />
              <span className="text-xs font-bold text-[#1A6B5A] shrink-0">{maxAppts} مريض</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors text-center"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  )
}
