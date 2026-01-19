import CalendarHeatmap from "react-calendar-heatmap";

interface StreakCalendarProps {
  completedDates: Array<Date>;
}

export function StreakCalendar({ completedDates }: StreakCalendarProps) {
  const today = new Date();
  const lastYearToday = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  return (
    <>
      <style>{`
        .react-calendar-heatmap {
          font-family: inherit;
        }
        .react-calendar-heatmap text {
          font-size: 8px;
          fill: #71717a;
        }
        .react-calendar-heatmap rect {
          fill: #e4e4e7;
          rx: 2;
          ry: 2;
        }
        .react-calendar-heatmap .color-filled {
          fill: #000 !important;
        }
        .react-calendar-heatmap-month-label {
          font-size: 10px;
        }
      `}</style>
      <CalendarHeatmap
        startDate={lastYearToday}
        endDate={today}
        values={completedDates.map((day) => ({
          date: day,
          count: 1,
        }))}
        classForValue={(value: any) =>
          value && value.count > 0 ? "color-filled" : "color-empty"
        }
        showWeekdayLabels={true}
        gutterSize={2}
        monthLabels={[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]}
      />
    </>
  );
}
