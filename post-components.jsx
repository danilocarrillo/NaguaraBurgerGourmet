/* globals React */
const { useEffect, useRef } = React;

// Shared post wrapper - 1080x1350 Instagram portrait
const PostBase = ({ children, bg = 'espresso', grain = true, className = '', style = {} }) => {
  const bgStyles = {
    espresso: { background: 'radial-gradient(1200px 800px at 30% 20%, #2a1a12, #1a0f0a 80%)' },
    cream:    { background: 'radial-gradient(1000px 700px at 50% 30%, #f4e9d3, #e5d5b8 80%)' },
    ember:    { background: 'radial-gradient(1000px 800px at 50% 20%, #e08a3c, #b9641f 80%)' },
    dark:     { background: 'radial-gradient(1000px 700px at 50% 40%, #241510, #120a07 80%)' },
    paper:    { background: '#efe3cc' },
  };
  return (
    <div className={'post ' + className} style={{
      width: 1080, height: 1350, position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif", color: '#f4e9d3',
      ...bgStyles[bg], ...style
    }}>
      {children}
      {grain && <div className="grain" />}
    </div>
  );
};

// Small logo corner mark
const LogoMark = ({ size = 96, style = {} }) => (
  <img src="../assets/naguara-logo.png" alt="" style={{
    width: size, height: size, borderRadius: '50%', display: 'block',
    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))', ...style
  }} />
);

// Corner pair used on most posts
const Corners = ({ color = '#e08a3c' }) => (
  <>
    {[['tl', '0 0', 'translate(40px, 40px)'],
      ['tr', '100% 0', 'translate(-40px, 40px)'],
      ['bl', '0 100%', 'translate(40px, -40px)'],
      ['br', '100% 100%', 'translate(-40px, -40px)']].map(([k, pos, t]) => {
      const [x, y] = pos.split(' ');
      return (
        <div key={k} style={{
          position: 'absolute',
          left: x === '0' ? 40 : 'auto', right: x === '100%' ? 40 : 'auto',
          top: y === '0' ? 40 : 'auto', bottom: y === '100%' ? 40 : 'auto',
          width: 28, height: 28,
          borderTop: y === '0' ? `2px solid ${color}` : 'none',
          borderBottom: y === '100%' ? `2px solid ${color}` : 'none',
          borderLeft: x === '0' ? `2px solid ${color}` : 'none',
          borderRight: x === '100%' ? `2px solid ${color}` : 'none',
        }} />
      );
    })}
  </>
);

const Badge = ({ children, color = '#e08a3c', style = {} }) => (
  <span style={{
    display: 'inline-block', padding: '10px 18px', borderRadius: 999,
    border: `1.5px solid ${color}`, color,
    fontSize: 16, letterSpacing: '0.26em', textTransform: 'uppercase',
    fontWeight: 600, fontFamily: "'DM Sans', sans-serif", ...style
  }}>{children}</span>
);

// ---------- POST 1: Logo reveal ----------
const PostLogo = () => (
  <PostBase bg="espresso">
    <Corners />
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ color: '#e08a3c', fontSize: 16, letterSpacing: '0.4em', fontWeight: 600, marginBottom: 40, textTransform: 'uppercase' }}>
        — Est. 2025 · Fort Lauderdale —
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: -40, borderRadius: '50%',
          border: '1px dashed rgba(224,138,60,0.35)'
        }} />
        <LogoMark size={680} />
      </div>
      <div style={{ color: '#efe3cc', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 36, marginTop: 60, letterSpacing: '0.01em' }}>
        Handmade · Gourmet · Venezolano
      </div>
    </div>
  </PostBase>
);

// ---------- POST 2: "Ya abrimos" hero type ----------
const PostOpen = () => (
  <PostBase bg="espresso">
    <Corners color="#e08a3c" />
    <LogoMark size={90} style={{ position: 'absolute', top: 80, left: 80 }} />
    <div style={{ position: 'absolute', top: 110, right: 80, textAlign: 'right' }}>
      <div style={{ color: '#e08a3c', fontSize: 14, letterSpacing: '0.3em', fontWeight: 700, textTransform: 'uppercase' }}>Food truck</div>
      <div style={{ color: '#efe3cc', fontSize: 14, letterSpacing: '0.12em', marginTop: 6, opacity: 0.7 }}>4385 GRIFFIN RD</div>
    </div>
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '0 80px', textAlign: 'center'
    }}>
      <div style={{ color: '#e08a3c', fontSize: 18, letterSpacing: '0.4em', fontWeight: 700, marginBottom: 30, textTransform: 'uppercase' }}>
        Abrimos esta noche
      </div>
      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 800,
        fontSize: 220, lineHeight: 0.88, margin: 0, color: '#efe3cc',
        letterSpacing: '-0.02em'
      }}>
        ¡Naguará,<br />
        <span style={{ fontStyle: 'italic', color: '#e08a3c', fontWeight: 600 }}>qué rico!</span>
      </h1>
      <div style={{ width: 80, height: 1, background: '#e08a3c', margin: '50px 0 30px' }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, color: '#efe3cc', maxWidth: 700 }}>
        Hamburguesas gourmet y pepitos venezolanos — hechos al momento.
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center' }}>
      <Badge>Dom–Jue · 6–11pm · Vie–Sáb · 6pm–1am</Badge>
    </div>
  </PostBase>
);

// ---------- POST 3: Signature burger (La Naguará) ----------
const PostSignature = () => (
  <PostBase bg="espresso">
    <Corners />
    <div style={{ position: 'absolute', top: 70, left: 80, display: 'flex', alignItems: 'center', gap: 16 }}>
      <LogoMark size={60} />
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#efe3cc' }}>Naguará Burger</div>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', color: '#e08a3c', textTransform: 'uppercase', fontWeight: 700 }}>Handmade · Gourmet</div>
      </div>
    </div>
    <div style={{ position: 'absolute', top: 80, right: 80, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#e08a3c', letterSpacing: '0.2em' }}>
      #01 · FIRMA
    </div>

    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px'
    }}>
      {/* placeholder burger photo */}
      <div style={{
        width: 620, height: 460, borderRadius: 16, marginBottom: 50,
        background: 'repeating-linear-gradient(45deg, rgba(244,233,211,0.06) 0 8px, transparent 8px 18px), linear-gradient(160deg, rgba(224,138,60,0.15), rgba(169,55,31,0.15))',
        border: '1px solid rgba(239,227,204,0.15)',
        display: 'grid', placeItems: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        color: 'rgba(244,233,211,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase'
      }}>foto · burger close-up 4:3</div>

      <div style={{ color: '#e08a3c', fontSize: 14, letterSpacing: '0.35em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
        La hamburguesa firma
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 110,
        margin: 0, color: '#efe3cc', fontStyle: 'italic', letterSpacing: '-0.01em'
      }}>
        La <span style={{ color: '#e08a3c' }}>Naguará</span>
      </h2>
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 22,
        color: 'rgba(239,227,204,0.85)', textAlign: 'center',
        maxWidth: 700, marginTop: 16, lineHeight: 1.4
      }}>
        Doble Angus · queso cheddar fundido · cebolla caramelizada · tocineta · salsa de la casa
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 80, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Badge>Solo por la noche</Badge>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, color: '#e08a3c', fontWeight: 700 }}>$14</div>
    </div>
  </PostBase>
);

// ---------- POST 4: Menu overview ----------
const PostMenu = () => {
  const items = [
    { n: '01', name: 'La Naguará', desc: 'Doble Angus, cheddar, tocineta', price: '14' },
    { n: '02', name: 'La Caraqueña', desc: 'Smash, queso amarillo, papitas', price: '12' },
    { n: '03', name: 'La Maracucha', desc: 'Queso de mano, maduro, aguacate', price: '13' },
    { n: '04', name: 'Pepito Naguará', desc: 'Triple proteína, cuatro salsas', price: '17' },
    { n: '05', name: 'Pepito de Carne', desc: 'Solomo, queso, papitas, salsas', price: '13' },
    { n: '06', name: 'Arepa Reina Pepiada', desc: 'Pollo, aguacate, mayo casera', price: '9' },
    { n: '07', name: 'Patacón Zuliano', desc: 'Plátano verde, carne mechada', price: '14' },
    { n: '08', name: 'Cachapa con queso', desc: 'Maíz tierno, queso de mano', price: '11' },
  ];
  return (
    <PostBase bg="espresso">
      <Corners />
      <div style={{ padding: '80px 80px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ color: '#e08a3c', fontSize: 14, letterSpacing: '0.35em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>
            Menú · 2025
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 88,
            margin: 0, color: '#efe3cc', lineHeight: 0.92, letterSpacing: '-0.01em'
          }}>
            Lo que sale<br />
            <span style={{ fontStyle: 'italic', color: '#e08a3c' }}>de la plancha</span>
          </h2>
        </div>
        <LogoMark size={110} />
      </div>

      <div style={{ padding: '70px 80px 0' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr auto',
            gap: 20, padding: '22px 0',
            borderTop: i === 0 ? '1px solid rgba(239,227,204,0.15)' : 'none',
            borderBottom: '1px solid rgba(239,227,204,0.15)',
            alignItems: 'baseline'
          }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#e08a3c', letterSpacing: '0.15em' }}>{it.n}</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#efe3cc', fontWeight: 600 }}>{it.name}</div>
              <div style={{ fontSize: 16, color: 'rgba(239,227,204,0.65)', marginTop: 2 }}>{it.desc}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, color: '#e08a3c', fontWeight: 700 }}>${it.price}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: 'rgba(239,227,204,0.7)' }}>
          menú completo → WhatsApp +1 (786) 626-6849
        </div>
      </div>
    </PostBase>
  );
};

// ---------- POST 5: Pepito story ----------
const PostPepito = () => (
  <PostBase bg="dark">
    <Corners />
    <div style={{ padding: '80px 80px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: '#e08a3c', fontSize: 14, letterSpacing: '0.35em', fontWeight: 700, textTransform: 'uppercase' }}>
        Historia · Pepito 101
      </div>
      <LogoMark size={70} />
    </div>

    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '120px 100px 140px', flexDirection: 'column'
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", color: '#e08a3c',
        fontSize: 200, lineHeight: 0.5, height: 100, marginBottom: 10
      }}>“</div>
      <blockquote style={{
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        fontSize: 56, lineHeight: 1.15, color: '#efe3cc',
        textAlign: 'center', margin: 0, maxWidth: 900, letterSpacing: '-0.005em'
      }}>
        El pepito es uno de los íconos más queridos de la comida callejera venezolana — creatividad y sencillez, servidas al calor de la noche.
      </blockquote>
      <div style={{ marginTop: 50, width: 60, height: 1, background: '#e08a3c' }} />
      <div style={{
        marginTop: 30, color: '#e08a3c', fontSize: 13, letterSpacing: '0.35em',
        textTransform: 'uppercase', fontWeight: 700
      }}>
        Caracas · Valencia · Maracaibo · años 80
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center' }}>
      <Badge>Aquí lo servimos fiel al original</Badge>
    </div>
  </PostBase>
);

// ---------- POST 6: Pricing ticket ----------
const PostTicket = () => (
  <PostBase bg="paper" grain={false}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'repeating-linear-gradient(0deg, rgba(26,16,9,0.04) 0 1px, transparent 1px 40px)'
    }} />
    <div style={{
      position: 'absolute', top: 80, left: 80, right: 80,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ color: '#1a1009', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: '0.2em' }}>
        TICKET · N°001 · 2025
      </div>
      <LogoMark size={70} />
    </div>

    {/* dashed cut */}
    <div style={{
      position: 'absolute', top: 200, left: 80, right: 80,
      borderTop: '2px dashed #8a5a2b'
    }} />

    <div style={{ padding: '240px 80px 0', color: '#1a1009' }}>
      <div style={{ fontSize: 14, letterSpacing: '0.3em', color: '#c0661f', textTransform: 'uppercase', fontWeight: 700, marginBottom: 20 }}>
        Combo de la semana
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 110,
        margin: 0, lineHeight: 0.9, letterSpacing: '-0.02em'
      }}>
        La <span style={{ fontStyle: 'italic', color: '#c0661f' }}>Naguará</span><br />
        + papas<br />
        + bebida
      </h2>

      <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          ['Doble Angus · cheddar · salsa casa', '14.00'],
          ['Papas de la casa', '5.00'],
          ['Papelón con limón', '4.00'],
        ].map(([k, v], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '18px 0', borderBottom: '1px dashed #8a5a2b',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: '#1a1009'
          }}>
            <span>{k}</span>
            <span>${v}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '26px 0 0',
        }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#8a5a2b', textTransform: 'uppercase' }}>Antes · $23</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, marginTop: 4 }}>Total</div>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 120, fontWeight: 800, color: '#c0661f', letterSpacing: '-0.02em' }}>
            $18
          </div>
        </div>
      </div>
    </div>

    <div style={{
      position: 'absolute', bottom: 140, left: 80, right: 80,
      borderTop: '2px dashed #8a5a2b', paddingTop: 30,
      display: 'flex', justifyContent: 'space-between',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.2em', color: '#1a1009'
    }}>
      <span>Solo este fin de semana</span>
      <span>wa.me/17866266849</span>
    </div>
    <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', color: '#8a5a2b' }}>
      · · · · · · · · · · GRACIAS · · · · · · · · · ·
    </div>
  </PostBase>
);

// ---------- POST 7: Location ----------
const PostLocation = () => (
  <PostBase bg="espresso">
    <Corners />
    <div style={{ padding: '80px 80px 0' }}>
      <div style={{ color: '#e08a3c', fontSize: 14, letterSpacing: '0.35em', fontWeight: 700, textTransform: 'uppercase' }}>
        Nos encuentras aquí
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 100,
        margin: '20px 0 0', color: '#efe3cc', lineHeight: 0.9, letterSpacing: '-0.01em'
      }}>
        Griffin Road<br />
        <span style={{ fontStyle: 'italic', color: '#e08a3c' }}>food truck</span>
      </h2>
    </div>

    {/* Map */}
    <div style={{
      position: 'absolute', top: 440, left: 80, right: 80, height: 560,
      borderRadius: 20, border: '1px solid rgba(239,227,204,0.2)',
      background: 'repeating-linear-gradient(0deg, rgba(244,233,211,0.05) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, rgba(244,233,211,0.05) 0 1px, transparent 1px 60px), linear-gradient(160deg, #2a1c16, #1a0f0a)',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: 3, background: '#e08a3c', opacity: 0.35 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: 1, background: '#efe3cc', opacity: 0.5, marginTop: 10 }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 28, height: 28, borderRadius: '50%', background: '#e08a3c',
        boxShadow: '0 0 0 12px rgba(224,138,60,0.25), 0 0 0 28px rgba(224,138,60,0.12), 0 0 0 52px rgba(224,138,60,0.06)'
      }} />
      <div style={{
        position: 'absolute', top: 'calc(50% - 100px)', left: '50%', transform: 'translateX(-50%)',
        background: '#efe3cc', color: '#1a1009', padding: '10px 20px', borderRadius: 8,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.12em', whiteSpace: 'nowrap'
      }}>
        NAGUARÁ BURGER
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.2em', color: 'rgba(244,233,211,0.5)' }}>
        <span>GRIFFIN RD · 26.08°N</span>
        <span>FORT LAUDERDALE</span>
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 80, left: 80, right: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.25em', color: '#e08a3c', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Dirección</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#efe3cc', lineHeight: 1.15 }}>4385 Griffin Rd<br />Fort Lauderdale, FL</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.25em', color: '#e08a3c', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Referencia</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#efe3cc', lineHeight: 1.15 }}>Al lado de<br />Brigitt Flowers</div>
        </div>
      </div>
    </div>
  </PostBase>
);

// ---------- POST 8: Hours ----------
const PostHours = () => (
  <PostBase bg="ember" grain={true}>
    <div style={{
      position: 'absolute', inset: 40, border: '2px solid rgba(26,16,9,0.3)', borderRadius: 4
    }} />
    <div style={{ padding: '90px 100px 0', color: '#1a1009' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: '0.25em' }}>
          HORARIO · 2025
        </div>
        <LogoMark size={80} />
      </div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 150,
        margin: '60px 0 0', lineHeight: 0.85, letterSpacing: '-0.02em'
      }}>
        Abierto<br />
        <span style={{ fontStyle: 'italic' }}>de noche.</span>
      </h2>

      <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[
          ['Domingo – Jueves', '6:00 pm — 11:00 pm'],
          ['Viernes – Sábado', '6:00 pm —  1:00 am'],
        ].map(([k, v], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '26px 0', borderTop: '2px solid rgba(26,16,9,0.25)',
            borderBottom: i === 1 ? '2px solid rgba(26,16,9,0.25)' : 'none'
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 600 }}>{k}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 70, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 28, maxWidth: 700 }}>
        Cocinamos pocas, las hacemos bien. Llega temprano — algunas noches se acaban.
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 80, left: 100, right: 100, display: 'flex', justifyContent: 'space-between', color: '#1a1009', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, letterSpacing: '0.2em' }}>
      <span>4385 GRIFFIN RD</span>
      <span>+1 (786) 626-6849</span>
    </div>
  </PostBase>
);

// ---------- POST 9: CTA / WhatsApp ----------
const PostCTA = () => (
  <PostBase bg="espresso">
    <Corners />
    <LogoMark size={90} style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)' }} />

    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '0 80px', textAlign: 'center'
    }}>
      <div style={{ color: '#e08a3c', fontSize: 16, letterSpacing: '0.4em', fontWeight: 700, marginBottom: 30, textTransform: 'uppercase' }}>
        Pedí tu Naguará
      </div>
      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 800,
        fontSize: 150, lineHeight: 0.9, margin: 0, color: '#efe3cc',
        letterSpacing: '-0.02em'
      }}>
        Directo por<br />
        <span style={{ fontStyle: 'italic', color: '#e08a3c' }}>WhatsApp</span>
      </h1>
      <div style={{
        marginTop: 70, padding: '28px 56px',
        border: '2px solid #e08a3c', borderRadius: 999,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 36, color: '#efe3cc',
        letterSpacing: '0.08em'
      }}>
        +1 (786) 626-6849
      </div>
      <div style={{
        marginTop: 40, fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        fontSize: 28, color: 'rgba(239,227,204,0.75)', maxWidth: 700
      }}>
        Mandanos tu pedido. Te confirmamos tiempo y lo preparamos al momento.
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center' }}>
      <div style={{ fontSize: 13, letterSpacing: '0.35em', color: 'rgba(239,227,204,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
        @naguaraburger · Fort Lauderdale
      </div>
    </div>
  </PostBase>
);

Object.assign(window, {
  PostLogo, PostOpen, PostSignature, PostMenu,
  PostPepito, PostTicket, PostLocation, PostHours, PostCTA
});
