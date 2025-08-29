"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  subscription: string;
  subscriptionEndsAt?: string;
  role: string;
  _count?: {
    downloads: number;
    conversations: number;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubscription, setFilterSubscription] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch("/api/admin/users-simple");
      
      if (!response.ok || response.status === 404) {
        console.log("Simplified endpoint not available, using fallback");
        response = await fetch("/api/admin/users");
      }
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("No tienes permisos de administrador");
          return;
        }
        if (response.status === 500) {
          toast.error("Error del servidor - intenta más tarde");
          return;
        }
        toast.error("Error cargando usuarios");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        console.error("Response status:", response.status);
        toast.error("Error en formato de respuesta - servidor no disponible");
        return;
      }
      
      const data = await response.json();
      setUsers(data.users || data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSubscription = async (userId: string, subscription: string) => {
    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch(`/api/admin/users-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, subscription }),
      });

      if (!response.ok || response.status === 404) {
        console.log("Simplified update endpoint not available, using fallback");
        response = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription }),
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("No tienes permisos de administrador");
          return;
        }
        toast.error("Error al actualizar suscripción");
        return;
      }

      toast.success("Suscripción actualizada");
      loadUsers();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Error al actualizar suscripción");
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch(`/api/admin/users-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok || response.status === 404) {
        console.log("Simplified update endpoint not available, using fallback");
        response = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("No tienes permisos de administrador");
          return;
        }
        toast.error("Error al actualizar rol");
        return;
      }

      toast.success("Rol actualizado");
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar rol");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Usuario eliminado");
        loadUsers();
      } else {
        toast.error("Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  const extendSubscription = async (userId: string, months: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ months }),
      });

      if (response.ok) {
        toast.success(`Suscripción extendida ${months} mes(es)`);
        loadUsers();
      } else {
        toast.error("Error al extender suscripción");
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Error al extender suscripción");
    }
  };

  const sendTestEmail = async (userId: string, emailType: 'welcome' | 'verification') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/send-test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailType }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Correo de ${emailType === 'welcome' ? 'bienvenida' : 'verificación'} enviado a ${data.sentTo}`);
      } else {
        const error = await response.json();
        toast.error(`❌ Error: ${error.error || 'No se pudo enviar el correo'}`);
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Error enviando correo de prueba");
    }
  };

  const sendDirectEmail = async (userId: string, emailType: 'welcome' | 'verification') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/send-direct-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailType }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Correo DIRECTO de ${emailType === 'welcome' ? 'bienvenida' : 'verificación'} enviado a ${data.sentTo}`);
      } else {
        const error = await response.json();
        toast.error(`❌ Error directo: ${error.error || 'No se pudo enviar el correo'}`);
      }
    } catch (error) {
      console.error("Error sending direct email:", error);
      toast.error("Error enviando correo directo");
    }
  };

  const sendFixedEmail = async (userId: string, emailType: 'welcome' | 'verification') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/send-fixed-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailType }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Correo FIJO de ${emailType === 'welcome' ? 'bienvenida' : 'verificación'} enviado a ${data.sentTo}`);
      } else {
        const error = await response.json();
        toast.error(`❌ Error fijo: ${error.error || 'No se pudo enviar el correo'}`);
      }
    } catch (error) {
      console.error("Error sending fixed email:", error);
      toast.error("Error enviando correo fijo");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubscription === "ALL" || user.subscription === filterSubscription;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Usuario
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
              placeholder="Buscar por nombre o email..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Suscripción
            </label>
            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
            >
              <option value="ALL">Todas</option>
              <option value="FREE">Gratis</option>
              <option value="PRO">PRO</option>
              <option value="EXPIRED">Expiradas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestión de Usuarios ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#00d4ff] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "ADMIN" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-[#00d4ff]/20 text-[#00d4ff] dark:bg-[#00d4ff]/20 dark:text-[#00d4ff]"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription === "PRO" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}>
                      {user.subscription}
                    </span>
                    {user.subscriptionEndsAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Expira: {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>Descargas: {user._count?.downloads || 0}</div>
                    <div>Chats: {user._count?.conversations || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ID: {user.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col space-y-2">
                      {/* Role Control */}
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 w-10">Rol:</label>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                      
                      {/* Subscription Control */}
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400 w-10">Sub:</label>
                        <select
                          value={user.subscription}
                          onChange={(e) => updateUserSubscription(user.id, e.target.value)}
                          className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                        </select>
                        
                        <button
                          onClick={() => extendSubscription(user.id, 1)}
                          className="px-2 py-1 rounded text-xs font-medium bg-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/30 transition-colors"
                          title="Extender 1 mes"
                        >
                          +1m
                        </button>
                      </div>
                      
                      {/* Email Test Buttons */}
                      <div className="flex flex-col space-y-1">
                        <div className="text-xs text-gray-500 font-medium">Con plantillas BD:</div>
                        <button
                          onClick={() => sendTestEmail(user.id, 'welcome')}
                          className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors w-full"
                          title="Enviar correo de bienvenida usando plantillas BD"
                        >
                          📧 Bienvenida (BD)
                        </button>
                        <button
                          onClick={() => sendTestEmail(user.id, 'verification')}
                          className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors w-full"
                          title="Enviar correo de verificación usando plantillas BD"
                        >
                          ✉️ Verificación (BD)
                        </button>
                        
                        <div className="text-xs text-gray-500 font-medium mt-2">Directo (sin BD):</div>
                        <button
                          onClick={() => sendDirectEmail(user.id, 'welcome')}
                          className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800 hover:bg-green-300 transition-colors w-full"
                          title="Enviar correo directo de bienvenida (sin BD)"
                        >
                          📧 Directo Bienvenida
                        </button>
                        <button
                          onClick={() => sendDirectEmail(user.id, 'verification')}
                          className="px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800 hover:bg-blue-300 transition-colors w-full"
                          title="Enviar correo directo de verificación (sin BD)"
                        >
                          ✉️ Directo Verificación
                        </button>
                        
                        <div className="text-xs text-gray-500 font-medium mt-2">FIJO (con BD):</div>
                        <button
                          onClick={() => sendFixedEmail(user.id, 'welcome')}
                          className="px-2 py-1 rounded text-xs font-medium bg-purple-200 text-purple-800 hover:bg-purple-300 transition-colors w-full"
                          title="Enviar correo ARREGLADO de bienvenida"
                        >
                          📧 FIJO Bienvenida
                        </button>
                        <button
                          onClick={() => sendFixedEmail(user.id, 'verification')}
                          className="px-2 py-1 rounded text-xs font-medium bg-purple-200 text-purple-800 hover:bg-purple-300 transition-colors w-full"
                          title="Enviar correo ARREGLADO de verificación"
                        >
                          ✉️ FIJO Verificación
                        </button>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors w-full"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                No se encontraron usuarios
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}