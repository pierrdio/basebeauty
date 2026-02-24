"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoPreview } from "@/components/ui/photo-preview";
import { EditWorkDialog } from "@/components/ui/edit-work-dialog";
import { EditVideoDialog } from "@/components/ui/edit-video-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ArrowUp, ArrowDown, ChevronsUpDown, Trash2, Pencil, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

const badgeColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export function getColorForValue(value: string) {
  const index = Math.abs(
    value
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % badgeColors.length;
  return badgeColors[index];
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DynamicTableProps {
  data: Array<Record<string, any>>;
  onDataChange?: () => void;
  hideActions?: boolean;
  tableTitle?: string;
  apiBasePath?: string;
  onEditItem?: (item: any) => void;
  viewPath?: string;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ data, onDataChange, hideActions, tableTitle, apiBasePath = "/api/works", onEditItem, viewPath }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [photoPreview, setPhotoPreview] = useState<{ photos: any[]; index: number } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [editVideoDialogOpen, setEditVideoDialogOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [itemToView, setItemToView] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setItemToView((prev: any) => prev ? { ...prev, status: newStatus } : null)
        toast.success('Статус успешно обновлен')
        // Trigger live update in parent
        onDataChange?.()
      } else {
        throw new Error('Failed to update status')
      }
    } catch {
      toast.error('Произошла ошибка при обновлении статуса');
    }
  }

  async function handleDelete(id: any) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function handleView(item: any) {
    setItemToView(item);
    setViewDialogOpen(true);
  }

  async function handleEdit(item: any) {
    if (onEditItem) {
      onEditItem(item);
      return;
    }
    if (item.hasOwnProperty('videoUrl')) {
      setVideoToEdit(item);
      setEditVideoDialogOpen(true);
    } else {
      setItemToEdit(item);
      setEditDialogOpen(true);
    }
  }

  async function confirmDelete() {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`${apiBasePath}/${itemToDelete}`, { method: 'DELETE' });

      if (response.ok) {
        toast.success('Запись успешно удалена');
        // Refresh data
        if (onDataChange) {
          onDataChange();
        }
      } else {
        const error = await response.json();
        toast.error(`Ошибка при удалении: ${error.error || 'Неизвестная ошибка'}`);
      }
    } catch {
      toast.error('Произошла ошибка при удалении');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  } 

  const paginationOptions = useMemo(() => {
    const sizes = [5, 10, 20, 50];
    return sizes.filter((size) => size <= data.length);
  }, [data.length]);

  const columns = useMemo(() => {
    if (!data.length) return [];

    const keys = Object.keys(data[0]);

    // Фильтруем поля, которые не нужно показывать
    const filteredKeys = keys.filter(key => {
      // Скрываем эти поля для всех типов данных
      if (hideActions && key === 'fileName') return false;
      if (key === 'updatedAt') return false;
      if (key === 'blocks') return false;
      if (key === 'videoUrl') return false;
      if (key === 'newsId') return false;

      // Скрываем эти поля только для contact submissions (которые есть поле phone)
      if (data[0]?.hasOwnProperty('phone')) {
        if (key === 'fileName') return false;
        if (key === 'fileUrl') return false;
        if (key === 'updatedAt') return false;
      }
      
      return true;
    });

    const baseColumns = filteredKeys.map((col) => {
      let headerName = toTitleCase(col.replace(/([A-Z])/g, " $1").trim());

      // Русские заголовки для конкретных полей
      if (col === 'id') headerName = 'ID';
      if (col === 'title') headerName = data[0]?.hasOwnProperty('phone') ? 'Имя' : 'Название';
      if (col === 'photos') headerName = 'Фото';
      if (col === 'name') headerName = 'Имя';
      if (col === 'phone') headerName = 'Телефон';
      if (col === 'message') headerName = 'Сообщение';
      if (col === 'fileUrl') headerName = 'Файл';
      if (col === 'fileName') headerName = 'Имя файла';
      if (col === 'status') headerName = 'Статус';
      if (col === 'description') headerName = 'Описание';
      if (col === 'cover') headerName = 'Обложка';
      if (col === 'blocks') headerName = 'Контент';
      if (col === 'createdAt') headerName = 'Создано';
      if (col === 'updatedAt') headerName = 'Обновлено';
      if (col === 'news') headerName = 'Привязана к новости';

      return {
        accessorKey: col,
        header: headerName,
        cell: (info: any) => {
          const value = info.getValue();

          if (
            ["status", "availability", "gender", "category", "genre", "position"].some((key) =>
              col.toLowerCase().includes(key)
            )
          ) {
            const cls = getColorForValue(String(value));
            
            // Перевод статусов на русский
            let translatedValue = String(value);
            if (col === 'status') {
              switch (String(value).toLowerCase()) {
                case 'new':
                  translatedValue = 'Новый';
                  break;
                case 'in_progress':
                  translatedValue = 'В работе';
                  break;
                case 'completed':
                  translatedValue = 'Завершен';
                  break;
                case 'active':
                  translatedValue = 'Активный';
                  break;
                case 'inactive':
                  translatedValue = 'Неактивный';
                  break;
              }
            }
            
            // Для contact submissions добавляем выпадающий список для смены статуса
            if (col === 'status' && data[0]?.hasOwnProperty('phone')) {
              const rowId = info.row.original.id;
              return (
                <Select
                  value={String(value)}
                  onValueChange={(newStatus) => handleStatusChange(rowId, newStatus)}
                >
                  <SelectTrigger className={`w-25 h-6 text-xs px-1 py-0.5 rounded-md border-0 ${cls}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              );
            }
            
            return (
              <Badge className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap ${cls}`}>
                {translatedValue}
              </Badge>
            );
          }

          if (col.toLowerCase().includes("rating")) {
            const ratingValue = Number(value) || 0;
            const maxRating = 5;
            const fullStars = Math.floor(ratingValue);
            const halfStar = ratingValue % 1 >= 0.5;
            const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

            return (
              <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                  <Icon key={`full-${i}`} icon="mdi:star" className="text-[#f3d55b] w-6 h-6 shrink-0" />
                ))}
                {halfStar && <Icon icon="mdi:star-half-full" className="text-[#f3d55b] w-6 h-6 shrink-0" />}
                {[...Array(emptyStars)].map((_, i) => (
                  <Icon key={`empty-${i}`} icon="mdi:star-outline" className="text-[#f3d55b] w-6 h-6 shrink-0" />
                ))}
              </div>
            );
          }

          if (typeof value === "boolean") {
            return value ? (
              <Badge className="px-2 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                Inactive
              </Badge>
            ) : (
              <Badge className="px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                Active
              </Badge>
            );
          }


          if (col.toLowerCase().includes("id")) {
            return <span className="text-gray-600 dark:text-gray-400 text-sm font-medium max-w-12 truncate whitespace-nowrap">{value ?? "-"}</span>;
          }

          if (col === "news") {
            if (!value || typeof value !== "object") {
              return <span className="text-gray-400 text-sm">—</span>;
            }
            return (
              <Badge
                className="px-3 py-1 rounded-md text-sm font-medium bg-[#1DCD9F]/10 text-[#1DCD9F] border border-[#1DCD9F]/30 cursor-pointer hover:bg-[#1DCD9F]/20 transition-colors"
                title={value.title}
                onClick={() => alert(value.title)}
              >
                {value.title.length > 25 ? value.title.slice(0, 25) + '...' : value.title}
              </Badge>
            );
          }

          if (typeof value === "object" && value !== null) {
            const { image, imageUrl, thumbnailUrl, thumbnail, image_url, avatar, qrCode, profileImage, icon, ...rest } = value;
            const keys = Object.keys(rest);

            return (
              <div className="flex items-center gap-2">
                {image || imageUrl || thumbnailUrl || thumbnail || image_url || avatar || qrCode || profileImage || icon ? (
                  <img
                    src={image ?? imageUrl ?? thumbnailUrl ?? thumbnail ?? image_url ?? avatar ?? qrCode ?? profileImage ?? icon}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <Badge className="size-10 flex items-center justify-center rounded-full shrink-0">
                    {keys[0] ? String(rest[keys[0]])[0]?.toUpperCase() : "?"}
                  </Badge>
                )}
                <div className="flex flex-col">
                  {keys.map((k) => {
                    const val = rest[k];
                    let displayValue;

                    const isTimestamp = (v: any) => {
                      if (typeof v !== "string") return false;
                      return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v);
                    };
                    if (isTimestamp(val)) return null;

                    if (typeof val === "object" && val !== null) {
                      if ("lat" in val && "lng" in val) {
                        displayValue = `${val.lat}, ${val.lng}`;
                      } else {
                        displayValue = JSON.stringify(val);
                      }
                    } else {
                      displayValue = val ?? "-";
                    }

                    return (
                      <span
                        key={k}
                        className={
                          k === "name"
                            ? "text-gray-900 dark:text-white font-semibold max-w-50 truncate whitespace-nowrap pe-6"
                            : "text-sm text-gray-500 dark:text-gray-400 max-w-50 truncate whitespace-nowrap pe-6"
                        }
                      >
                        {displayValue}
                      </span>
                    );
                  })}
                </div>

              </div>
            );
          }


          // Handle date fields
          if (col === 'createdAt' || col === 'updatedAt') {
            if (value && typeof value === 'string') {
              try {
                const date = new Date(value);
                const formattedDate = date.toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return <span className="text-gray-600 dark:text-gray-400 text-xs">{formattedDate}</span>;
              } catch {
                return <span className="text-gray-400 text-xs">Invalid date</span>;
              }
            }
            return <span className="text-gray-400 text-xs">-</span>;
          }

          // Handle cover image/video
          if (col === 'cover') {
            if (value && typeof value === 'string') {
              return (
                <img
                  src={value}
                  alt="Обложка"
                  className="w-10 h-10 rounded object-cover border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              );
            }
            return <span className="text-gray-400 text-xs">Нет</span>;
          }

          // Handle blocks JSON - show count
          if (col === 'blocks' && typeof value === 'string') {
            try {
              const blocks = JSON.parse(value);
              if (Array.isArray(blocks)) {
                return <span className="text-gray-600 text-xs">{blocks.length} блок(ов)</span>;
              }
            } catch {}
            return <span className="text-gray-400 text-xs">-</span>;
          }

          // Handle photos JSON array
          if (col === 'photos' && typeof value === 'string') {
            try {
              const photos = JSON.parse(value);
              if (Array.isArray(photos) && photos.length > 0) {
                return (
                  <div className="flex gap-0.5 flex-wrap">
                    {photos.slice(0, 2).map((photo: any, index: number) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setPhotoPreview({ photos, index })}
                      >
                        <img
                          src={photo.fileUrl}
                          alt={photo.fileName}
                          className="w-6 h-6 rounded object-cover border border-gray-200 hover:border-blue-300 transition-colors"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded flex items-center justify-center transition-colors">
                          <div className="w-0 h-0 border-l border-l-white border-t border-transparent border-b border-b-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                    ))}
                    {photos.length > 2 && (
                      <div
                        className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => setPhotoPreview({ photos, index: 2 })}
                      >
                        +{photos.length - 2}
                      </div>
                    )}
                  </div>
                );
              }
            } catch {
              // If JSON parsing fails, show placeholder
              return <span className="text-gray-400 text-xs">Нет фото</span>;
            }
          }

          if (typeof value === "string") {
            if (
              value?.includes("png") ||
              value?.includes("jpg") ||
              value?.includes("jpeg") ||
              value?.includes("svg") ||
              col.toLowerCase().includes("thumbnail") ||
              col.toLowerCase().includes("image")
            ) {
              return <img src={value} className="size-10 rounded-md" />;
            }
          }

          if (
            ["user", "product", "fullname", "author"].some((key) =>
              col.toLowerCase().includes(key)
            )
          ) {
            const cls = getColorForValue(String(value));
            return (
              <div className="flex items-center gap-1">
                <Badge
                  className={`size-8 flex items-center justify-center rounded-full shrink-0 ${cls}`}
                >
                  {value ? String(value)[0]?.toUpperCase() : "?"}
                </Badge>
                <span className="text-gray-900 dark:text-white font-semibold max-w-30 truncate whitespace-nowrap text-xs">
                  {value}
                </span>
              </div>
            );
          }

          return (
            <div className="text-gray-900 dark:text-white font-medium text-xs">
              {value === null || value === undefined ? (
                <span className="text-gray-500">-</span>
              ) : (
                <div 
                  className={`
                    ${col === 'title' || col === 'description'
                      ? 'max-w-70 whitespace-normal wrap-break-word'
                      : typeof value === 'string' && value.length > 50
                        ? 'max-w-xs truncate'
                        : typeof value === 'string' && value.length > 20
                          ? 'max-w-xs wrap-break-word line-clamp-2'
                          : 'max-w-[150px] truncate whitespace-nowrap'
                    }
                  `}
                  title={value}
                >
                  {value}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
        enableGlobalFilter: true,
      };
    });


    const actionColumn: ColumnDef<any> = {
      id: "action",
      header: data[0]?.hasOwnProperty('phone') ? "Просмотр" : "Действия",
      enableSorting: false,
      cell: ({ row }: any) => {
        const rowData = row.original;
        const isContactSubmission = rowData.hasOwnProperty('phone');
        
        return (
          <div className="flex items-center justify-start">
            {isContactSubmission && (
              <Button
                size={"sm"}
                variant="outline"
                className="size-8 rounded-md p-0 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                onClick={() => handleView(rowData)}
                title="Просмотр деталей"
              >
                <Eye className="size-4 text-gray-600" />
              </Button>
            )}
            {!hideActions && !isContactSubmission && (
              <div className="flex gap-1">
                {viewPath && (
                  <Link href={`${viewPath}/${rowData.id}`} target="_blank">
                    <Button
                      size={"sm"}
                      variant="outline"
                      className="size-8 rounded-md p-0"
                      title="Открыть"
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </Link>
                )}
                {rowData.hasOwnProperty('videoUrl') && (
                  <Button
                    size={"sm"}
                    variant="outline"
                    className="size-8 rounded-md p-0"
                    onClick={() => setVideoPreview(rowData)}
                    title="Предпросмотр"
                  >
                    <Eye className="size-4" />
                  </Button>
                )}
                <Button
                  size={"sm"}
                  variant="default"
                  className="size-8 rounded-md p-0"
                  onClick={() => handleEdit(rowData)}
                  title="Редактировать"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size={"sm"}
                  variant="destructive"
                  className="size-8 rounded-md p-0"
                  onClick={() => handleDelete(row.original.id)}
                  title="Удалить"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        );
      },
    };

    return [...baseColumns, ...(hideActions ? [] : [actionColumn])];
  }, [data, hideActions]);

  // Filter data by status if it's contact submissions
  const filteredData = useMemo(() => {
    if (!data.length) return data;
    
    // Only apply status filter for contact submissions (which have phone field)
    if (data[0]?.hasOwnProperty('phone') && statusFilter && statusFilter !== 'all') {
      return data.filter(item => item.status === statusFilter);
    }
    
    return data;
  }, [data, statusFilter]);

  // React Table Setup
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: (row, columnId, value, addMeta) => {
      // Flexible search - search across all columns
      const searchValue = value.toLowerCase().trim();
      if (!searchValue) return true;
      
      return row.original && Object.values(row.original).some(cellValue => {
        if (cellValue === null || cellValue === undefined) return false;
        const cellString = String(cellValue).toLowerCase();
        return cellString.includes(searchValue);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // CSV Download
  const handleDownload = () => {
    if (!data.length) return;

    const headers = columns.map((col) => String(col.header));
    const rows = data.map((item) =>
      columns.map((col) => {
        const accessorKey = (col as any).accessorKey;
        const value = accessorKey ? item[accessorKey] : "";
        if (Array.isArray(value)) return `"[array]"`;
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      })
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "table-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {data.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Нет данных</p>
      ) : (
        <>
          {/* Search + Download */}
          <div className="py-3 flex flex-col gap-3">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">{tableTitle}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                type="text"
                className="max-w-full sm:max-w-80 lg:min-w-64 min-w-0 placeholder:text-gray-400 dark:placeholder:text-white/20 h-9"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Поиск..."
              />
              {data[0]?.hasOwnProperty('phone') && (
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-white/5">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="cursor-pointer select-none px-3 py-2 text-sm font-medium whitespace-nowrap">
                        {header.isPlaceholder ? null : (
                          <Button
                            className="flex items-center gap-1 px-1 bg-transparent hover:bg-transparent text-gray-700 dark:text-gray-300 font-semibold text-sm h-auto py-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ArrowUp className="w-2.5 h-2.5 inline" />,
                              desc: <ArrowDown className="w-2.5 h-2.5 inline" />,
                            }[header.column.getIsSorted() as string] ??
                              (header.column.id !== "action" ? (
                                <ChevronsUpDown className="w-2.5 h-2.5 inline" />
                              ) : null)}
                          </Button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.original.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/10">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center p-2 sm:p-4 text-gray-500 dark:text-gray-400 font-medium text-sm"
                    >
                      Нет результатов.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center gap-3 p-3 border-t border-gray-200 dark:border-white/10">
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                variant={"secondary"}
                className="disabled:bg-gray-300 dark:disabled:bg-white/30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 text-white h-8 px-3 text-sm"
              >
                Назад
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="disabled:bg-gray-300 dark:disabled:bg-white/30 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 text-white h-8 px-3 text-sm"
              >
                Вперед
              </Button>
            </div>

            <div className="text-gray-700 dark:text-gray-300 font-medium text-sm text-center">
              Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
            </div>
          </div>
        </>
      )}

      {/* Photo Preview Popup */}
      {photoPreview && (
        <PhotoPreview
          photos={photoPreview.photos}
          initialIndex={photoPreview.index}
          isOpen={true}
          onClose={() => setPhotoPreview(null)}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту запись? Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Contact Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-125 font-onest">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Детали обращения
            </DialogTitle>
            <DialogDescription>
              Полная информация о клиентском обращении.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="view-name">Имя</Label>
              <Input 
                id="view-name"
                value={itemToView?.name || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="view-phone">Телефон</Label>
              <Input 
                id="view-phone"
                value={itemToView?.phone || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="view-message">Сообщение</Label>
              <textarea 
                id="view-message"
                value={itemToView?.message || ''}
                readOnly
                className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md bg-gray-50 resize-none overflow-y-auto"
                rows={5}
              />
            </div>
            
            {itemToView?.fileName && (
              <div className="grid gap-2">
                <Label htmlFor="view-file">Файл</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="view-file"
                    value={itemToView.fileName}
                    readOnly
                    className="bg-gray-50"
                  />
                  {itemToView.fileUrl && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(itemToView.fileUrl, '_blank')}
                    >
                      Открыть
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="view-status">Статус</Label>
                <Select
                  value={itemToView?.status || ''}
                  onValueChange={(newStatus) => handleStatusChange(itemToView?.id, newStatus)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="view-date">Дата создания</Label>
                <Input 
                  id="view-date"
                  value={itemToView?.createdAt ? new Date(itemToView.createdAt).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Work Dialog */}
      <EditWorkDialog
        work={itemToEdit}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={() => {
          if (onDataChange) {
            onDataChange();
          }
        }}
      />

      {/* Edit Video Dialog */}
      <EditVideoDialog
        video={videoToEdit}
        isOpen={editVideoDialogOpen}
        onClose={() => setEditVideoDialogOpen(false)}
        onSave={() => {
          if (onDataChange) {
            onDataChange();
          }
        }}
      />

      {/* Video Preview Dialog */}
      <Dialog open={!!videoPreview} onOpenChange={() => setVideoPreview(null)}>
        <DialogContent className="sm:max-w-3xl overflow-hidden">
          <DialogHeader className="overflow-hidden">
            <DialogTitle className="pr-6 wrap-break-word break-all">
              {videoPreview?.title}
            </DialogTitle>
          </DialogHeader>
          {videoPreview?.videoUrl && (
            <video
              src={videoPreview.videoUrl}
              controls
              className="w-full rounded-lg max-h-[70vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
