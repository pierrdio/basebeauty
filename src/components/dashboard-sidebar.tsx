"use client"

import { useState } from "react"
import { ChevronDown, Search, } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { sidebarItems } from "./data"

import Image from 'next/image';

export function AppSidebar() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  )

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex aspect-square size-19 p-2 items-center justify-center bg-black rounded-full">
            <Image
              src="/Base_Logo_Simple.svg"
              alt="BaseBeauty Logo"
              width={120}
              height={120}
            />
          </div>
          <div>
            <h2 className="font-semibold">BaseBeauty</h2>
          </div>
        </div>

        {/* 
        <div className="px-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="bg-muted w-full rounded-2xl py-2 pr-4 pl-9"
            />
          </div>
        </div> */}

      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      open={expandedItems[item.title]}
                      onOpenChange={() => toggleExpanded(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between rounded-2xl",
                            item.isActive && "bg-primary/10 text-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className="rounded-full px-2 py-0.5 text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedItems[item.title] ? "rotate-180" : ""
                              )}
                            />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="rounded-2xl"
                              >
                                <a
                                  href={subItem.url}
                                  className="flex items-center justify-between"
                                >
                                  {subItem.title}
                                  {subItem.badge && (
                                    <Badge
                                      variant="outline"
                                      className="rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className="rounded-2xl"
                    >
                      <a href="#" className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2 py-0.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
