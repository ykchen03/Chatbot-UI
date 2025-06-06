import './Banner.css';

interface BannerProps {
  items: any[];
  speed?: number;
}

export default function Banner({ items, speed = 5000 }: BannerProps) {
  return (
    <div className="inner">
      <div className="wrapper gap-6">
        <section className='gap-6' style={{ "--speed": `${speed}ms` } as React.CSSProperties}>
          {items.map(( item, index ) => (
            <div
                key={index}
                className="rounded-2xl bg-dark-gray p-6 shadow-md"
              >
                <h2 className="text-xl font-semibold text-white mb-2"></h2>
                <p className="text-white">{item}</p>
              </div>
          ))}
        </section>
        <section className='gap-6' style={{ "--speed": `${speed}ms` } as React.CSSProperties}>
          {items.map((item, index ) => (
            <div
                key={index}
                className="rounded-2xl bg-dark-gray p-6 shadow-md"
              >
                <h2 className="text-xl font-semibold text-white mb-2"></h2>
                <p className="text-white">{item}</p>
              </div>
          ))}
        </section>
        <section className='gap-6' style={{ "--speed": `${speed}ms` } as React.CSSProperties}>
          {items.map(( item, index ) => (
            <div
                key={index}
                className="rounded-2xl bg-dark-gray p-6 shadow-md"
              >
                <h2 className="text-xl font-semibold text-white mb-2"></h2>
                <p className="text-white">{item}</p>
              </div>
          ))}
        </section>
      </div>
    </div>
  );
}