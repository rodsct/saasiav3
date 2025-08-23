"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminLink() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      checkAdminStatus();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/downloads");
      setIsAdmin(response.status !== 403);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      <span>🛠️</span>
      <span>Admin Panel</span>
    </Link>
  );
}