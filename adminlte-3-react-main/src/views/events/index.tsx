"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { Pagination } from "@app/components/common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";


import { useDebounce } from "@app/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  X,
  Eye,
  Columns,
  Calendar1,
  Loader2,
  Download,
} from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IEventResponse } from "@app/types/events";

const EventList = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_EVENTS]}>
      <EventListContent />
    </RouteGuard>
  );
};

const EventListContent = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    uniqueId: true,
    district: true,
    year: true,
    month: true,
    receivingDate: true,
    programDate: true,
    time: true,
    eventType: true,
    eventDetails: true,
    priority: true,
    venueCity: true,
    referencePerson: true,
    contactNumber: true,
    address: true,
    name: true,
    location: true,
    probability: true,
    duration: true,
    attended: true,
    pressConference: true,
    dispatchDate: true,
    dispatchNumber: true,
    remarks: true,
    addedBy: true,
    action: true,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Events Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IEventResponse>({
    queryKey: [
      "events",
      currentPage,
      entriesPerPage,
      debouncedSearchTerm,
      filterMonth,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearchTerm || undefined,
        month: filterMonth === "All Months" ? undefined : filterMonth,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const { data } = await axios.get("/events", { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/events/${id}`);
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setSyncing(true);
      const { data } = await axios.post("/events/sync", {});
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setSyncing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to sync events");
      setSyncing(false);
    },
  });

  const handleSyncAll = () => {
    syncMutation.mutate();
  };

  const handleExport = async () => {
    const events = response?.data || [];
    if (events.length === 0) return toast.warning("No data to export");
    try {
      const XLSX = await import("xlsx");
      const dataToExport = events.map((e) => ({
        "Unique ID": e.uniqueId,
        District: e.district,
        Year: e.year,
        Month: e.month,
        "Receiving Date": new Date(e.receivingDate).toLocaleDateString(),
        "Program Date": new Date(e.programDate).toLocaleDateString(),
        Time: e.time,
        "Event Type": e.eventType,
        "Event Details": e.eventDetails,
        Priority: e.priority,
        "Venue City": e.venueCity,
        "Reference Person": e.referencePerson,
        "Contact Number": e.contactNumber,
        Address: e.address,
        Name: e.name,
        Location: e.location,
        Probability: e.probability,
        Duration: e.duration,
        Attended: e.attended,
        "Press Conference": e.pressConference,
        "Dispatch Date": e.dispatchDate
          ? new Date(e.dispatchDate).toLocaleDateString()
          : "",
        "Dispatch Number": e.dispatchNumber,
        Remark: e.remarks,
        "Added By": e.addedBy,
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Events");
      XLSX.writeFile(wb, "Events.xlsx");
      toast.success("Exported successfully");
    } catch (error) {
      toast.error("Failed to load export library");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.warning("No data found in excel file");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        let importedCount = 0;

        // Helper to find value by possible keys
        const getVal = (obj: any, keys: string[]) => {
          for (const k of keys) {
            if (obj[k] !== undefined) return obj[k];
          }
          return undefined;
        };

        // Helper to parse Excel date
        const parseDate = (val: any) => {
          if (!val) return new Date();
          if (typeof val === "number") {
            const date = new Date((val - 25569) * 86400 * 1000);
            return date;
          }
          return new Date(val);
        };

        for (const item of data as any[]) {
          try {
            const uniqueId = getVal(item, [
              "uniqueId",
              "Unique ID",
              "UniqueId",
              "ID",
            ]);
            const district = getVal(item, ["district", "District"]);
            const year = getVal(item, ["year", "Year"]);
            const month = getVal(item, ["month", "Month"]);
            const receivingDateRaw = getVal(item, [
              "receivingDate",
              "Receiving Date",
              "ReceivingDate",
            ]);
            const programDateRaw = getVal(item, [
              "programDate",
              "Program Date",
              "ProgramDate",
            ]);
            const time = getVal(item, ["time", "Time"]);
            const eventType = getVal(item, ["eventType", "Event Type", "Type"]);
            const eventDetails = getVal(item, [
              "eventDetails",
              "Event Details",
              "Details",
              "Description",
            ]);

            if (!uniqueId || !programDateRaw) {
              continue;
            }

            const payload = {
              uniqueId: String(uniqueId),
              district: String(district || ""),
              year: String(year || new Date().getFullYear()),
              month: String(month || ""),
              receivingDate: parseDate(receivingDateRaw),
              programDate: parseDate(programDateRaw),
              time: String(time || "00:00"),
              eventType: String(eventType || "General"),
              eventDetails: String(eventDetails || ""),
            };

            await axios.post("/events", payload);
            importedCount++;
          } catch (error) {
            console.error("Failed to import row:", item, error);
          }
        }

        toast.success(`Successfully imported ${importedCount} events`);
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to parse excel file");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const events = response?.data || [];
  // Handle filteredCount if present, otherwise explicit fallbacks
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="Events Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-none mt-6 overflow-hidden">
            {/* Filter Section */}
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Unique ID, District, Event Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleImport}
                  />

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    Import Excel
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleExport}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <Download className="w-5 h-5 mr-2 text-blue-500" /> Export
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSyncAll}
                    disabled={syncing}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    {syncing ? (
                      "Syncing..."
                    ) : (
                      <>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                          alt="GCal"
                          className="w-5 h-5 mr-2"
                        />
                        Sync GCal
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/events/calendar")}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <Calendar1 className="w-5 h-5 mr-2" /> Calendar
                  </Button>

                  {hasPermission(PERMISSIONS.CREATE_EVENTS) && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/events/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Event
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    Show
                  </span>
                  <Select
                    value={entriesPerPage.toString()}
                    onValueChange={(v) => {
                      setEntriesPerPage(v === "-1" ? -1 : Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    entries
                  </span>
                </div>

                <Select
                  value={filterMonth}
                  onValueChange={(val) => {
                    setFilterMonth(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Months">All Months</SelectItem>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="February">February</SelectItem>
                    <SelectItem value="March">March</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="May">May</SelectItem>
                    <SelectItem value="June">June</SelectItem>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="August">August</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                    <SelectItem value="October">October</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="December">December</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Start Date:
                  </span>
                  <Input
                    type="date"
                    className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    End Date:
                  </span>
                  <Input
                    type="date"
                    className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterMonth("All Months");
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ml-auto"
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {Object.keys(visibleColumns).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        visibleColumns[key as keyof typeof visibleColumns]
                      }
                      onCheckedChange={() =>
                        toggleColumn(key as keyof typeof visibleColumns)
                      }
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("SrNo", "Sr No")
                        .replace("UniqueId", "Unique ID")
                        .replace("EventType", "Event Type")
                        .replace("EventDetails", "Event Details")
                        .replace("Action", "Actions")
                        .trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.uniqueId && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.receivingDate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Receiving Date
                      </TableHead>
                    )}
                    {visibleColumns.programDate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Program Date
                      </TableHead>
                    )}
                    {visibleColumns.time && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Time
                      </TableHead>
                    )}
                    {visibleColumns.eventType && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Event Type
                      </TableHead>
                    )}
                    {visibleColumns.eventDetails && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Event Details
                      </TableHead>
                    )}
                    {visibleColumns.priority && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Priority
                      </TableHead>
                    )}
                    {visibleColumns.venueCity && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Venue City
                      </TableHead>
                    )}
                    {visibleColumns.referencePerson && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Reference Person
                      </TableHead>
                    )}
                    {visibleColumns.contactNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Contact Number
                      </TableHead>
                    )}
                    {visibleColumns.address && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Address
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.location && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Location
                      </TableHead>
                    )}
                    {visibleColumns.probability && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Probability
                      </TableHead>
                    )}
                    {visibleColumns.duration && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Duration
                      </TableHead>
                    )}
                    {visibleColumns.attended && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Attended
                      </TableHead>
                    )}
                    {visibleColumns.pressConference && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Press Conference
                      </TableHead>
                    )}
                    {visibleColumns.dispatchDate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Dispatch Date
                      </TableHead>
                    )}
                    {visibleColumns.dispatchNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Dispatch Number
                      </TableHead>
                    )}
                    {visibleColumns.remarks && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Remark
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-10"
                      >
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-red-500"
                      >
                        Failed to fetch events
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event, index) => (
                      <TableRow
                        key={event._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="dark:text-gray-300">
                            {entriesPerPage === -1
                              ? index + 1
                              : (currentPage - 1) * entriesPerPage + index + 1}
                          </TableCell>
                        )}
                        {visibleColumns.uniqueId && (
                          <TableCell className="font-bold text-gray-900 dark:text-gray-200">
                            {event.uniqueId}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell className="dark:text-gray-300">
                            {event.district}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="dark:text-gray-300">
                            {event.year}
                          </TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell className="dark:text-gray-300">
                            {event.month}
                          </TableCell>
                        )}
                        {visibleColumns.receivingDate && (
                          <TableCell className="dark:text-gray-300">
                            {new Date(event.receivingDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        {visibleColumns.programDate && (
                          <TableCell className="dark:text-gray-300">
                            {new Date(event.programDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        {visibleColumns.time && (
                          <TableCell className="dark:text-gray-300">
                            {event.time}
                          </TableCell>
                        )}
                        {visibleColumns.eventType && (
                          <TableCell className="dark:text-gray-300">
                            {event.eventType}
                          </TableCell>
                        )}
                        {visibleColumns.eventDetails && (
                          <TableCell className="max-w-xs truncate">
                            {event.eventDetails}
                          </TableCell>
                        )}
                        {visibleColumns.priority && (
                          <TableCell className="dark:text-gray-300">
                            {event.priority}
                          </TableCell>
                        )}
                        {visibleColumns.venueCity && (
                          <TableCell className="dark:text-gray-300">
                            {event.venueCity || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.referencePerson && (
                          <TableCell className="dark:text-gray-300">
                            {event.referencePerson || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.contactNumber && (
                          <TableCell className="dark:text-gray-300">
                            {event.contactNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.address && (
                          <TableCell className="max-w-xs truncate">
                            {event.address || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-medium dark:text-gray-300">
                            {event.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.location && (
                          <TableCell className="dark:text-gray-300">
                            {event.location || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.probability && (
                          <TableCell className="dark:text-gray-300">
                            {event.probability || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.duration && (
                          <TableCell className="dark:text-gray-300">
                            {event.duration || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.attended && (
                          <TableCell className="dark:text-gray-300">
                            {event.attended || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.pressConference && (
                          <TableCell className="dark:text-gray-300">
                            {event.pressConference || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.dispatchDate && (
                          <TableCell className="dark:text-gray-300">
                            {event.dispatchDate
                              ? new Date(
                                  event.dispatchDate,
                                ).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.dispatchNumber && (
                          <TableCell className="dark:text-gray-300">
                            {event.dispatchNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell className="max-w-xs truncate">
                            {event.remarks || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell className="dark:text-gray-300">
                            {event.addedBy || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/events/${event._id}/view`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                {hasPermission(PERMISSIONS.EDIT_EVENTS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/events/${event._id}/edit`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.DELETE_EVENTS) && (
                                  <ConfirmDialog
                                    onConfirm={() => handleDelete(event._id)}
                                    trigger={
                                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </div>
                                    }
                                  />
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && events.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    {(currentPage - 1) *
                      (entriesPerPage === -1 ? totalCount : entriesPerPage) +
                      1}{" "}
                    to{" "}
                    {entriesPerPage === -1
                      ? totalCount
                      : Math.min(currentPage * entriesPerPage, totalCount)}{" "}
                    of {totalCount} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={
                        entriesPerPage === -1
                          ? 1
                          : Math.ceil(totalCount / entriesPerPage)
                      }
                      onPageChange={setCurrentPage}
                      activeColor="bg-[#00563B]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default EventList;
