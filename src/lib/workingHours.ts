export type ScheduleDay = {
  day: string;
  isWorking: boolean;
  openTime: string;
  openPeriod: "ص" | "م";
  closeTime: string;
  closePeriod: "ص" | "م";
};

export type WorkingHoursData = {
  type: "24/7" | "custom";
  schedule?: ScheduleDay[];
};

export const DAYS_OF_WEEK = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Helper to generate time options (e.g. 01:00, 01:30, 02:00... 12:30)
export const generateTimeOptions = () => {
  const times = [];
  for (let h = 1; h <= 12; h++) {
    const hourStr = h.toString().padStart(2, "0");
    times.push(`${hourStr}:00`);
    times.push(`${hourStr}:30`);
  }
  return times;
};

// Helper to parse working_hours string to object
export const parseWorkingHours = (workingHoursStr?: string): WorkingHoursData | null => {
  if (!workingHoursStr) return null;
  try {
    const data = JSON.parse(workingHoursStr);
    if (data && (data.type === "24/7" || data.type === "custom")) {
      return data as WorkingHoursData;
    }
  } catch (e) {
    // If it's old legacy string format, we can wrap it or return null
    return null;
  }
  return null;
};

// Helper to get today's working hours string
export const getTodayWorkingHoursText = (workingHoursStr?: string): string => {
  if (!workingHoursStr) return "";
  
  // Try to parse new JSON format
  const parsed = parseWorkingHours(workingHoursStr);
  
  if (parsed) {
    if (parsed.type === "24/7") {
      return "مفتوح 24 ساعة 🟢";
    }
    
    if (parsed.type === "custom" && parsed.schedule) {
      const todayIndex = new Date().getDay();
      const todayName = DAYS_OF_WEEK[todayIndex];
      const todaySchedule = parsed.schedule.find(s => s.day === todayName);
      
      if (!todaySchedule) return "غير متوفر";
      
      if (!todaySchedule.isWorking) {
        return "مغلق اليوم (إجازة) 🔴";
      }
      
      return `من ${todaySchedule.openTime} ${todaySchedule.openPeriod} حتي ${todaySchedule.closeTime} ${todaySchedule.closePeriod}`;
    }
  }
  
  // Fallback for legacy text
  return workingHoursStr;
};
