import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  Truck,
  EyeClosed,
  Eye,
} from "lucide-react";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = {
  UNIVERSITARIO: {
    label: "Universitário",
    email: "aluno@transporte.edu.br",
  },
  ADMIN: {
    label: "Administrador",
    email: "admin@transporte.edu.br",
  },
  MOTORISTA: {
    label: "Motorista",
    email: "motorista@transporte.edu.br",
  },
};

const DEMO_PROFILES = [
  { key: "UNIVERSITARIO", label: "Universitário", Icon: GraduationCap },
  { key: "ADMIN", label: "Admin", Icon: ShieldCheck },
  { key: "MOTORISTA", label: "Motorista", Icon: Truck },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedProfile, setSelectedProfile] = useState("UNIVERSITARIO");
  const [email, setEmail] = useState("aluno@transporte.edu.br");
  const [senha, setSenha] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setEmail(DEMO_ACCOUNTS[profile].email);
    setSenha("123456");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "E-mail ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#0B0A0F] lg:grid-cols-[minmax(300px,0.8fr)_minmax(420px,1.2fr)]">
      <div className="relative flex min-h-[260px] flex-col overflow-hidden border-b border-[#29252F] bg-[#08070B] px-6 py-8 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-10">
        <div className="flex items-center">
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Uni<span className="text-[#FFD84A]">Bus</span>
          </p>

          <span className="ml-3 border-l border-[#29252F] pl-3 text-sm text-[#8C8792]">
            Transporte universitário
          </span>
        </div>

        <div className="my-auto max-w-md py-12 lg:py-0">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#FFD84A]">
            SISTEMA DE TRANSPORTE UNIVERSITÁRIO
          </p>

          <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Transporte para quem vai estudar.
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#A6A1AB]">
            Horários de saída, trajetos e informações sobre o transporte da
            universidade.
          </p>

          <div className="mt-10 border-t border-[#29252F] pt-5">
            <div className="flex items-center gap-3 text-sm text-[#D5D1D9]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD84A]" />

              <span>Consulte sua rota de qualquer lugar.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#29252F] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-[#77717D]">UniBus © 2026</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-[410px]">
          <div>
            <h2 className="mb-2 mt-1 text-3xl font-extrabold">
              Acesso ao sistema
            </h2>
            <p className="text-xs leading-relaxed text-[#AAA2AD]">
              Use seus dados de acesso ou selecione um perfil de demonstração.
            </p>
          </div>

          <div className="my-6 flex flex-wrap gap-2">
            {DEMO_PROFILES.map(({ key, label, Icon }) => {
              const isSelected = selectedProfile === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectProfile(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-2 py-2.5 text-[11px] font-semibold transition ${
                    isSelected
                      ? "border-[#FFD84A] bg-[#342D1B] text-[#F0E8DC]"
                      : "border-[#403A46] bg-[#19171E] text-[#BEB5BF] hover:bg-[#302C36]"
                  }`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-bold text-[#DDD5D0]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@transporte.edu.br"
              />
            </div>

            <div className="mb-1">
              <label
                htmlFor="senha"
                className="mb-1.5 block text-[11px] font-bold text-[#DDD5D0]"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••"
                />
                <button type="button"
                  className="absolute bottom-2.5 right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-[#F0A0A8]">{error}</p>}

            <SubmitButton
              text="Entrar"
              disabled={submitting}
              loading={submitting}
            />
          </form>
        </div>
      </div>
    </div>
  );
};
