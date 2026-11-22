export default function NoticeList({ items, emptyLabel }) {
  const dateLabel = (date) => new Date(date).toLocaleDateString("pt-BR");

  return (
    <div>
      {items.length === 0 ? (
        <p className="py-3 text-xs text-[#AAA2AD]">{emptyLabel}</p>
      ) : (
        items.map((notice) => (
          <article
            key={notice.id}
            className="border-b border-[#29252F] py-3 last:border-b-0"
          >
            <time className="mb-1 block text-[10px] text-[#AAA2AD]">
              {dateLabel(notice.criadoEm)}
            </time>
            <strong className="block text-[13px]">{notice.titulo}</strong>
            <p className="mt-1 text-xs leading-relaxed text-[#BEB5BF]">
              {notice.mensagem}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
