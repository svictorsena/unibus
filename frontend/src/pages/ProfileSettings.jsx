import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SubmitButton from "../components/SubmitButton";
import { Eye, EyeClosed } from "lucide-react";

export const ProfileSettings = () => {
  const { user } = useAuth();

  const [universidades, setUniversidades] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    curso: "",
    universidadeId: "",
    senha: "",
    confirmarSenha: "",
  });

  const isUniversitario = user?.perfil === "UNIVERSITARIO";
  const isAdmin = user?.perfil === "ADMIN";
  const isMotorista = user?.perfil === "MOTORISTA";

  const notify = (msg, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        curso: user.curso || "",
        universidadeId: user.universidadeId
          ? String(user.universidadeId)
          : user.universidade?.id
            ? String(user.universidade.id)
            : "",
        senha: "",
        confirmarSenha: "",
      });
    }
  }, [user]);

  useEffect(() => {
    const carregarUniversidades = async () => {
      try {
        const res = await api.get("/universidades");
        setUniversidades(res.data);
      } catch {
        notify("Erro ao carregar universidades.", true);
      }
    };

    if (isUniversitario) {
      carregarUniversidades();
    }
  }, [isUniversitario]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.senha && form.senha !== form.confirmarSenha) {
      notify("As senhas não coincidem.", true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
      };

      if (isUniversitario) {
        payload.curso = form.curso.trim();
        payload.universidadeId = form.universidadeId;
      }

      if (form.senha.trim()) {
        payload.senha = form.senha;
      }

      if (isUniversitario) await api.put(`/universitarios/${user.id}`, payload);
      if (isAdmin) await api.put(`/admins/${user.id}`, payload);
      if (isMotorista) await api.put(`/motoristas/${user.id}`, payload);

      setForm((f) => ({
        ...f,
        senha: "",
        confirmarSenha: "",
      }));

      setShowPassword(false);
      setShowConfirmPassword(false);

      notify("Perfil atualizado com sucesso!");
    } catch (err) {
      notify(err.response?.data?.message || "Erro ao atualizar perfil.", true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none";

  return (
    <div>
      <div className="flex flex-col mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Configurações de Perfil
        </h2>
        <p className="text-sm text-slate-600">
          Visualize e edite as informações do seu perfil.
        </p>
      </div>

      <div className="page-layout">
        <div className="card">
          <div className="mb-4">
            <h3 className="text-base font-bold">Informações pessoais</h3>
            <p className="text-sm text-slate-600">
              Atualize seus dados de acesso e informações pessoais.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Nome completo
              </label>
              <input
                required
                className={inputClass}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                E-mail
              </label>
              <input
                type="email"
                required
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Telefone
              </label>
              <input
                required
                className={inputClass}
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(99) 99999-9999"
              />
            </div>

            {isUniversitario && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Curso
                  </label>
                  <input
                    className={inputClass}
                    value={form.curso}
                    onChange={(e) =>
                      setForm({ ...form, curso: e.target.value })
                    }
                    placeholder="Ex.: Sistemas de Informação"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Universidade
                  </label>
                  <select
                    required
                    className={`${inputClass} cursor-pointer`}
                    value={form.universidadeId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        universidadeId: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione sua universidade</option>
                    {universidades.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <h3 className="mb-1 text-base font-bold">Alterar senha</h3>
              <p className="mb-4 text-sm text-slate-600">
                Deixe os campos abaixo vazios caso não queira alterar sua senha.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nova senha
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      className={inputClass}
                      value={form.senha}
                      onChange={(e) =>
                        setForm({ ...form, senha: e.target.value })
                      }
                      placeholder="Digite sua nova senha"
                    />

                    <button
                      type="button"
                      className="absolute bottom-2.5 right-3 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye  />
                      ) : (
                        <EyeClosed  />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Confirmar nova senha
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={inputClass}
                      value={form.confirmarSenha}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirmarSenha: e.target.value,
                        })
                      }
                      placeholder="Confirme sua nova senha"
                    />

                    <button
                      type="button"
                      className="absolute bottom-2.5 right-3 cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye  />
                      ) : (
                        <EyeClosed  />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <SubmitButton text="Salvar alterações" loading={loading} />
          </form>
        </div>

        <div className="card mt-5">
          <h3 className="mb-3 text-base font-bold">Dados da conta</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#403A46] pb-3">
              <span className="text-slate-600">Perfil</span>
              <strong className="text-slate-900">{user?.perfil || "—"}</strong>
            </div>

            <div className="flex items-center justify-between border-b border-[#403A46] pb-3">
              <span className="text-slate-600">Status</span>
              <span
                className={`rounded-sm px-2 py-1 text-xs font-bold ${
                  user?.ativo
                    ? "bg-green-400 text-green-700"
                    : "bg-red-400 text-red-700"
                }`}
              >
                {user?.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-sm px-4 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.bad ? "bg-red-700" : "bg-brand-darker"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};