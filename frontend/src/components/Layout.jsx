import {
  AlertTriangle,
  Bus,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Route,
  Settings2,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { RefreshButton } from "./RefreshButton";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const perfilLabel =
    user.perfil === "ADMIN"
      ? "Administrador"
      : user.perfil === "MOTORISTA"
        ? "Motorista"
        : "Universitário";

  const navClass = ({ isActive }) =>
    `flex min-h-[38px] shrink-0 items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-semibold no-underline transition-colors md:w-[220px] ${
      isActive
        ? "border-b-2 border-[#FFD84A] bg-[#24212A] text-[#FFD84A] md:border-b-0 md:border-l-2 md:pl-2 md:bg-[#24212A]"
        : "border-b-2 border-transparent text-[#BEB5BF] hover:bg-[#19171E] hover:text-[#F0E8DC] md:border-b-0"
    }`;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full flex-col border-b border-[#29252F] bg-[#08070B] p-3 md:sticky md:top-0 md:h-screen md:min-h-screen md:w-[260px] md:shrink-0 md:border-b-0 md:border-r md:p-5">
        <div className="flex items-center gap-2 border-b border-[#29252F] px-1 pb-3 md:px-2 md:pb-5">
          <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-sm bg-[#FFD84A] text-[#08070B]">
            <Bus size={20} />
          </div>

          <div className="text-sm font-bold leading-snug text-nowrap flex items-center justify-between w-full">
            <div className="flex flex-col">
              <p>Transporte Universitário</p>
              <span className="mt-[3px] block text-[10px] font-medium tracking-[0.08em] text-[#AAA2AD]">
                UNIFACIMP WYDEN
              </span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <RefreshButton iconOnly />
              <button
                onClick={handleLogout}
                aria-label="Sair da conta"
                className="grid h-9 w-9 place-items-center rounded-sm border border-[#403A46] bg-transparent p-0 text-[#BEB5BF] hover:bg-[#19171E] hover:text-[#F0E8DC]"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex gap-1 overflow-x-auto pt-2 md:flex-col md:gap-1 md:overflow-visible md:pt-4"
        >
          <NavLink to="/dashboard" className={navClass}>
            <LayoutDashboard size={17} />
            Visão Geral
          </NavLink>

          {user.perfil !== "ADMIN" && (
            <NavLink to="/rotas" className={navClass}>
              <Route size={17} />
              {user.perfil === "MOTORISTA"
                ? "Meu Itinerário"
                : "Consultar Rotas"}
            </NavLink>
          )}

          {user.perfil === "ADMIN" && (
            <>
              <NavLink to="/gerenciar-rotas" className={navClass}>
                <Settings2 size={17} />
                Gerenciar Rotas
              </NavLink>

              <NavLink to="/cadastros" className={navClass}>
                <Users size={17} />
                Cadastros
              </NavLink>
            </>
          )}

          <NavLink to="/avisos" className={navClass}>
            <Megaphone size={17} />
            Quadro de Avisos
          </NavLink>

          <NavLink to="/ocorrencias" className={navClass}>
            <AlertTriangle size={17} />
            Ocorrências
          </NavLink>

          <NavLink to="/calendario" className={navClass}>
            <CalendarDays size={17} />
            Calendário
          </NavLink>
        </nav>

        <div className="mt-auto hidden border-t border-[#29252F] pt-3 md:block">
          <NavLink to="/profile-settings">
            <div className="flex items-center gap-2.5 px-1 pb-3">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-sm border border-[#403A46] bg-[#19171E] text-xs font-bold text-[#FFD84A]">
                {user.nome.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0">
                <strong className="block max-w-[175px] truncate text-xs">
                  {user.nome}
                </strong>
                <small className="mt-0.5 block text-[10px] text-[#AAA2AD]">
                  {perfilLabel}
                </small>
              </div>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm border border-[#403A46] bg-transparent px-2 py-2 text-left text-xs text-[#BEB5BF] hover:bg-[#19171E] hover:text-[#F0E8DC] "
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div
          id="conteudo-principal"
          className="mx-auto max-w-[1440px] px-3.5 pb-10 pt-5 md:px-5 md:pb-14 md:pt-7"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
