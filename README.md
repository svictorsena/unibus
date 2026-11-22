# Plataforma Web de Gestão e Consulta do Transporte Universitário

Implementação Full Stack (**React + JavaScript + Tailwind CSS + Vite** no Frontend e **Java 21 + Spring Boot 3 + Spring Security + JWT + JPA + PostgreSQL** no Backend) baseada integralmente nas especificações da documentação técnica (`documentacao_transporte_universitario-2.0.md`), nos 6 fluxos essenciais do MVP (`explicacao_fluxos_mvp.md`) e na identidade visual do protótipo (`Prototipo-do-MVP-Versao em site.html`).

---

## Arquitetura e Tecnologias

### Backend (`./backend`)
- **Java 21** + **Spring Boot 3.3.5**
- **Spring Security + JWT (JWS / HMAC-SHA256)** com autenticação *stateless* e controle de acesso baseado em papéis (`ADMIN`, `UNIVERSITARIO`, `MOTORISTA`).
- **Spring Data JPA / Hibernate** + **PostgreSQL 16** (com perfil `dev` opcional em **H2** para testes rápidos sem Docker).
- **Bean Validation (`jakarta.validation`)** e tratamento padronizado de exceções (`GlobalExceptionHandler`).
- **Carga inicial automática (`DataSeeder`)** criando usuários de demonstração, universidades, veículos, rotas para hoje e amanhã, avisos e ocorrências.

### Frontend (`./frontend`)
- **React 18** + **JavaScript (ES2022)** + **Tailwind CSS** + **Vite**
- **React Router DOM v6** com rotas protegidas por perfil (`ProtectedRoute`).
- **Axios** com interceptor automático de token JWT e tratamento de expiração de sessão (`401`).
- **Design System fiel ao Protótipo MVP**: tema escuro/âmbar (`#0f172a` / `#f59e0b`), layout responsivo com barra lateral fixa no desktop e drawer/adaptação mobile, cartões de métricas, timeline de paradas e feedback por *toast*.

---

## Credenciais de Demonstração (Pré-carregadas)

| Perfil | E-mail | Senha | Acesso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@transporte.edu.br` | `123456` | Gestão de rotas diárias, redistribuição de veículos, cadastros (universitários, universidades, veículos, motoristas), avisos e ocorrências. |
| **Universitário** | `aluno@transporte.edu.br` | `123456` | Consulta automática da rota do dia vinculada à sua universidade, consulta manual por data/universidade, avisos e suporte. |
| **Motorista** | `motorista@transporte.edu.br` | `123456` | Consulta do veículo e itinerário atribuído, registro de ocorrências operacionais e consulta de avisos. |

---

## Como Executar

### Opção 1: Via Docker Compose (Recomendado — sobe PostgreSQL + Spring Boot + React)
```bash
docker-compose up --build
```
- **Frontend Web:** http://localhost:5173
- **API Backend:** http://localhost:8080/api

### Opção 2: Execução Local Manual

#### 1. Banco de Dados PostgreSQL
Crie um banco chamado `transporte_universitario` (ou inicie apenas o container do Postgres: `docker-compose up -d postgres`).

#### 2. Backend (Spring Boot)
```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```
> **Dica:** Caso queira rodar localmente sem instalar o PostgreSQL, execute com o perfil H2 em memória:
> ```bash
> ./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
> ```

#### 3. Frontend (React + Vite)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Acesse http://localhost:5173.

---

## Cobertura dos Fluxos do MVP e Requisitos

1. **Fluxo 1 — Autenticação e Controle de Acesso (HU01, HU02 / RF01, RF02, RNF03, RNF04):** Login com validação, senha cifrada com `BCrypt`, emissão de JWT e bloqueio de rotas por perfil tanto na API (`@PreAuthorize`) quanto no React Router.
2. **Fluxo 2 — Consulta de Rotas e Horários (HU08, HU09 / RF10, RF13):** Aba *"Minha rota"* carrega automaticamente o ônibus, horário previsto e sequência ordenada de universidades para o aluno autenticado; aba *"Consulta manual"* permite filtrar qualquer data e universidade.
3. **Fluxo 3 — Gerenciamento de Cadastros (HU03, HU04, HU05 / RF04–RF08):** CRUD completo de Universitários (vinculados à instituição), Universidades, Veículos (com placa e capacidade) e Motoristas.
4. **Fluxo 4 — Configuração Dinâmica e Redistribuição de Rotas (HU06, HU07 / RF09, RF11, RF12, RN05):** Seleção por data de operação; reordenação de paradas (`↑` `↓`), atribuição/redistribuição transacional garantindo que uma universidade não fique duplicada em dois ônibus na mesma data, sem alterar o histórico de outros dias.
5. **Fluxo 5 — Publicação e Consulta de Avisos (HU10 / RF14, RF15, RN06):** Publicação e exclusão de comunicados pelo Administrador com autor e data, visíveis a Universitários e Motoristas.
6. **Fluxo 6 — Registro de Ocorrências e Suporte (HU11 / RF18–RF20, RN07):** Motoristas registram ocorrências operacionais vinculadas ao veículo; Universitários abrem chamados de suporte com acompanhamento de status (`ABERTO`, `EM_ATENDIMENTO`, `RESOLVIDO`).
