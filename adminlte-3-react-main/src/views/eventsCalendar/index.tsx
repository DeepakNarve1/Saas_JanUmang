"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  getWeekOfMonth,
  isToday,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "@app/components/ui/button";
import { cn } from "@app/lib/utils";
import axios from "@app/utils/axios";
import { useQuery } from "@tanstack/react-query";

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  pink: "bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  green:
    "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  purple:
    "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  orange:
    "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  neutral:
    "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  emerald:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  red: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  cyan: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  yellow:
    "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  indigo:
    "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
} as const;

type ColorStyleKey = keyof typeof colorStyles;

// Types matching the provided attachment structure
interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: ColorStyleKey;
  date: Date;
  details: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState("Month view");

  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);

  const getEventColor = (title: string): CalendarEvent["color"] => {
    const t = title.toLowerCase();

    if (t.includes("social")) return "pink";
    if (t.includes("religious")) return "purple";
    if (t.includes("political") || t.includes("rally")) return "red";
    if (t.includes("meeting")) return "blue";
    if (t.includes("inauguration")) return "orange";

    if (t.includes("visit")) return "green";
    if (t.includes("conference") || t.includes("vc")) return "indigo";
    if (t.includes("ceremony")) return "cyan";

    return "neutral";
  };

  interface IEvent {
    _id: string;
    eventType: string;
    time?: string;
    programDate: string | Date;
    eventDetails?: string;
  }

  interface IEventResponse {
    data: IEvent[];
    total?: number;
  }
  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["events-calendar"],
    queryFn: async () => {
      const { data } = await axios.get<IEventResponse>("/events", {
        params: { limit: -1 },
      });

      return data.data.map((e: IEvent) => ({
        id: e._id,
        title: e.eventType,
        time: e.time || "",
        color: getEventColor(e.eventType || ""),
        date: new Date(e.programDate),
        details: e.eventDetails || "No details provided",
      }));
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  const getCalendarDays = () => {
    switch (view) {
      case "Week view":
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        });
      case "Day view":
        return [currentDate];
      case "Month view":
      default:
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        return eachDayOfInterval({
          start: startDate,
          end: endDate,
        });
    }
  };

  const calendarDays = getCalendarDays();

  const handleNext = () => {
    switch (view) {
      case "Week view":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "Day view":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "Month view":
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handlePrev = () => {
    switch (view) {
      case "Week view":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "Day view":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "Month view":
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <main className="min-h-screen bg-white dark:bg-[#1a1c1e] p-4 md:p-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Calendar Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            {/* Date Chip */}
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#202123] shadow-sm">
              <span className="text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                {format(currentDate, "MMM")}
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                {format(currentDate, "d")}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {format(currentDate, "MMMM yyyy")}
                </h1>
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Week {getWeekOfMonth(currentDate)}
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {format(monthStart, "MMM d, yyyy")} –{" "}
                {format(monthEnd, "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202123] p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 border-neutral-200 dark:border-neutral-800 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-transparent"
                >
                  {view}
                  <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="dark:bg-[#202123] dark:border-neutral-800"
              >
                <DropdownMenuItem
                  onClick={() => setView("Month view")}
                  className="dark:text-neutral-300 dark:focus:bg-neutral-800"
                >
                  Month view
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setView("Week view")}
                  className="dark:text-neutral-300 dark:focus:bg-neutral-800"
                >
                  Week view
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setView("Day view")}
                  className="dark:text-neutral-300 dark:focus:bg-neutral-800"
                >
                  Day view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#1a1c1e] shadow-sm">
          {/* Day Headers - Hidden in Day view */}
          {view !== "Day view" && (
            <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202123]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-neutral-400 dark:text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Days */}
          <div
            className={cn(
              "grid",
              view === "Day view" ? "grid-cols-1" : "grid-cols-7",
            )}
          >
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const isSelected = isSameDay(day, currentDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative min-h-[140px] border-b border-r border-neutral-200 dark:border-neutral-800 p-2 transition-colors",
                    (i + 1) % 7 === 0 && "border-r-0",
                    !isCurrentMonth &&
                      "bg-neutral-50/30 dark:bg-neutral-900/10",
                    isSelected && "bg-indigo-50/20 dark:bg-indigo-900/10",
                  )}
                  onClick={() => setCurrentDate(day)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      view !== "Day view"
                        ? "inline-flex h-7 w-7 items-center justify-center"
                        : "inline-block mb-2",
                      !isCurrentMonth
                        ? "text-neutral-300 dark:text-neutral-700"
                        : "text-neutral-900 dark:text-neutral-100",
                      isToday(day) &&
                        (view !== "Day view"
                          ? "rounded-full bg-indigo-600 text-white"
                          : "text-indigo-600 dark:text-indigo-400 font-bold"),
                    )}
                  >
                    {view !== "Day view"
                      ? format(day, "d")
                      : format(day, "EEEE, d")}
                  </span>

                  <div className="mt-2 flex flex-col gap-1">
                    {(view === "Month view"
                      ? dayEvents.slice(0, 3)
                      : dayEvents
                    ).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between transition-shadow hover:shadow-sm",
                          colorStyles[event.color],
                          view === "Month view"
                            ? "rounded-md px-2 py-1 text-[11px] font-medium"
                            : "rounded-md px-3 py-2 text-xs font-semibold",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <span className="truncate">{event.title}</span>
                        <span className="ml-1 shrink-0 opacity-60">
                          {event.time}
                        </span>
                      </div>
                    ))}
                    {view === "Month view" && dayEvents.length > 3 && (
                      <div className="px-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-600">
                        {dayEvents.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-[425px] dark:bg-[#202123] dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-neutral-100">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  selectedEvent?.color === "blue" && "bg-blue-500",
                  selectedEvent?.color === "pink" && "bg-pink-500",
                  selectedEvent?.color === "green" && "bg-green-500",
                  selectedEvent?.color === "purple" && "bg-purple-500",
                  selectedEvent?.color === "orange" && "bg-orange-500",
                  selectedEvent?.color === "neutral" && "bg-gray-500",
                  selectedEvent?.color === "emerald" && "bg-emerald-500",
                  selectedEvent?.color === "red" && "bg-red-500",
                  selectedEvent?.color === "cyan" && "bg-cyan-500",
                  selectedEvent?.color === "yellow" && "bg-yellow-500",
                  selectedEvent?.color === "indigo" && "bg-indigo-500",
                )}
              />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription className="dark:text-neutral-400">
              {selectedEvent?.date &&
                format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
              {selectedEvent?.time && ` at ${selectedEvent.time}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              {selectedEvent?.details}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
              className="dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
