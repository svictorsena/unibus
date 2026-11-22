import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Bus, GraduationCap, Route as RouteIcon } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import NoticeList from '../components/NoticeList';
import { RefreshButton } from '../components/RefreshButton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const todayLabel = () =>
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const dateLabel = (date) => new Date(date).toLocaleDateString('pt-BR');

export const DashboardPage = () => {
  const { user } = useAuth();
  const hojeISO = new Date().toISOString().split('T')[0];

  const noticesQuery = useQuery({
    queryKey: ['notices'],
    queryFn: async () => (await api.get('/avisos')).data,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => (await api.get('/veiculos')).data,
  });
  const universitiesQuery = useQuery({
    queryKey: ['universities'],
    queryFn: async () => (await api.get('/universidades')).data,
  });
  const routesQuery = useQuery({
    queryKey: [
      user?.perfil === 'ADMIN' ? 'routes' : 'my-route',
      hojeISO,
    ],
    queryFn: async () => {
      const endpoint =
        user?.perfil === 'ADMIN'
          ? `/rotas?data=${hojeISO}`
          : `/rotas/minha-rota?data=${hojeISO}`;
      return (await api.get(endpoint)).data;
    },
    enabled: Boolean(user),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const avisos = noticesQuery.data || [];
  const veiculos = vehiclesQuery.data || [];
  const universidades = universitiesQuery.data || [];
  const rotasDia = user?.perfil === 'ADMIN' ? routesQuery.data || [] : [];
  const minhaRota =
    user?.perfil !== 'ADMIN' && routesQuery.data ? routesQuery.data : [];
  const loading =
    noticesQuery.isLoading ||
    vehiclesQuery.isLoading ||
    universitiesQuery.isLoading ||
    routesQuery.isLoading;

  if (loading) {
    return <p className="text-sm text-[#BEB5BF]">Carregando informações...</p>;
  }

  if (
    noticesQuery.isError ||
    vehiclesQuery.isError ||
    universitiesQuery.isError ||
    routesQuery.isError
  ) {
    return (
      <p className="text-sm text-red-600">
        Erro ao carregar as informações do painel.
      </p>
    );
  }

  const avisosRecentes = avisos.slice(0, 3);
  const isAdmin = user?.perfil === 'ADMIN';

  const headingDescription = isAdmin
    ? 'Acompanhamento da frota e programação de hoje.'
    : user?.perfil === 'MOTORISTA'
      ? 'Sua programação e avisos da operação.'
      : 'Consulte sua programação e informações do transporte.';

  const columnsClass =
    'grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{todayLabel()}</p>
          <h2 className="mb-1 mt-1 text-[23px] font-extrabold leading-tight tracking-tight">
            {isAdmin ? 'Resumo da operação' : `Olá, ${user?.nome}`}
          </h2>
          <p className="m-0 text-sm leading-relaxed text-[#BEB5BF]">
            {headingDescription}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/gerenciar-rotas" className="bg-[#FFD84A] px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-[#e6c200]">
              Editar programação
            </Link>
          )}
          <RefreshButton className="hidden md:flex" />
        </div>
      </div>

      {isAdmin ? (
        <>
          <div
            aria-label="Indicadores"
            className="grid grid-cols-1 border border-[#39343F] bg-[#19171E] sm:grid-cols-3"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#39343F] px-4 py-3 sm:border-b-0 sm:border-r">
              <span className="flex items-center gap-2 text-xs text-[#BEB5BF]">
                <Bus size={16} className="text-[#FFD84A]" />
                Veículos cadastrados
              </span>
              <strong className="text-2xl font-extrabold">{veiculos.length}</strong>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-[#39343F] px-4 py-3 sm:border-b-0 sm:border-r">
              <span className="flex items-center gap-2 text-xs text-[#BEB5BF]">
                <GraduationCap size={16} className="text-[#FFD84A]" />
                Instituições atendidas
              </span>
              <strong className="text-2xl font-extrabold">
                {universidades.length}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-2 text-xs text-[#BEB5BF]">
                <RouteIcon size={16} className="text-[#FFD84A]" />
                Rotas ativas hoje
              </span>
              <strong className="text-2xl font-extrabold">
                {rotasDia.filter((rota) => rota.paradas.length > 0).length}
              </strong>
            </div>
          </div>

          <div className={columnsClass}>
            <div className="border-t border-[#39343F]">
              <SectionHeading
                title="Programação de hoje"
                to="/gerenciar-rotas"
                linkLabel="Abrir programação"
              />

              {rotasDia.length === 0 ? (
                <p className="py-3 text-xs text-[#AAA2AD]">
                  Nenhuma rota programada para hoje.
                </p>
              ) : (
                rotasDia.map((rota) => (
                  <article
                    key={rota.veiculo.id}
                    className="flex gap-3.5 border-b border-[#29252F] py-3.5"
                  >
                    <div className="min-w-[58px] pt-px text-sm font-bold text-[#FFD84A]">
                      {rota.horarioPrevisto}
                    </div>

                    <div className="min-w-0">
                      <strong className="text-[13px]">
                        {rota.veiculo.nome}
                        <span className="ml-1.5 text-[11px] font-medium text-[#AAA2AD]">
                          {rota.veiculo.placa}
                        </span>
                      </strong>
                      <p className="mt-1 text-xs leading-relaxed text-[#AAA2AD]">
                        {rota.paradas.length
                          ? rota.paradas
                              .map((parada) => parada.universidade.nome)
                              .join(' → ')
                          : 'Sem universidades atribuídas para hoje'}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="border-t border-[#39343F]">
              <SectionHeading
                title="Avisos recentes"
                to="/avisos"
                linkLabel="Todos os avisos"
              />
              <NoticeList
                items={avisosRecentes}
                emptyLabel="Nenhum aviso publicado."
              />
            </div>
          </div>
        </>
      ) : (
        <div className={columnsClass}>
          <div className="border border-[#39343F] bg-[#19171E] p-4 sm:p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#AAA2AD]">
              {user?.perfil === 'MOTORISTA'
                ? 'Veículo atribuído'
                : 'Programação de hoje'}{' '}
              - {dateLabel(new Date())}
            </p>

            {(minhaRota && minhaRota.length > 0) ? (
              <>
                <h3 className="mb-0 mt-3.5 text-[25px] font-extrabold">
                  {minhaRota[0].veiculo.nome}
                </h3>
                <p className="mt-1 text-[11px] text-[#AAA2AD]">
                  {minhaRota[0].veiculo.placa} - {minhaRota[0].veiculo.capacidade} lugares
                </p>

                <p className="mb-0 mt-5 text-[10px] uppercase tracking-[0.07em] text-[#AAA2AD]">
                  Saída prevista
                </p>
                <p className="mb-4 mt-1 text-[36px] font-extrabold leading-tight text-[#FFD84A]">
                  {minhaRota[0].horarioPrevisto}
                </p>

                <div className="border-t border-[#39343F]">
                  {minhaRota[0].paradas.map((parada, index) => (
                    <div
                      key={parada.universidade.id}
                      className="flex items-start gap-3 border-b border-[#29252F] py-3"
                    >
                      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-sm bg-[#FFD84A] text-[11px] font-bold text-[#08070B]">
                        {index + 1}
                      </span>

                      <div>
                        <strong className="block text-xs">
                          {parada.universidade.nome}
                        </strong>
                        <small className="mt-1 block text-[10px] text-[#AAA2AD]">
                          {parada.universidade.localizacao}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/rotas"
                  className="mt-4 flex items-center gap-2 text-xs font-bold text-[#FFD84A] no-underline"
                >
                  Ver itinerário completo
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <div className="py-5">
                <p className="mb-4 text-[13px] text-[#DDD5D0]">
                  Nenhuma rota programada para hoje.
                </p>
                <Link to="/rotas" className="bg-[#FFD84A] px-3 py-2 text-sm  font-bold text-slate-950 transition hover:bg-[#e6c200] w-full">
                  Consultar outra data
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-[#39343F]">
            <SectionHeading
              title="Avisos"
              to="/avisos"
              linkLabel="Ver todos"
            />
            <NoticeList
              items={avisosRecentes}
              emptyLabel="Nenhum aviso publicado."
            />
          </div>
        </div>
      )}
    </div>
  );
};
