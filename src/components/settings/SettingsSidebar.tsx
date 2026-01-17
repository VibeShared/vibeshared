"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import clsx from "clsx";

const navItems = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/privacy", label: "Privacy" },
  { href: "/settings/password", label: "Password" },
  { href: "/settings/blocked", label: "Blocked Users" },
  { href: "/settings/account", label: "Account" },
];

function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="list-group list-group-flush">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "list-group-item list-group-item-action",
              isActive && "active fw-semibold"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default memo(SettingsSidebar);
