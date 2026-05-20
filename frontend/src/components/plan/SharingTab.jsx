import { Share2, Eye, Pencil, Copy, QrCode, Trash2, Clock } from 'lucide-react';
import sharingService    from '../../services/sharingService';
import { formatDateLong } from '../../utils/formatDate';

const SharingTab = ({ hook }) => {
  const {
    shareToken, copied, sharings,
    handleShare, handleCopy, handleDeleteSharing,
  } = hook;

  return (
    <div className="space-y-5">
      <h2 className="section-title">
        <Share2 className="w-5 h-5 text-primary-500" />Dijeljenje plana
      </h2>

      <div className="card">
        <p className="text-sm text-slate-500 mb-5">
          Generirajte link i QR kod za dijeljenje plana. Dva nivoa pristupa:
          <strong> VIEW</strong> (samo pregled) i <strong>EDIT</strong> (pregled i uređivanje).
          Link ističe za 7 dana.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              type: 'VIEW', icon: Eye, label: 'VIEW pristup', desc: 'Samo pregled',
              hB: 'hover:border-sky-400', hBg: 'hover:bg-sky-50',
              iB: 'bg-sky-50 group-hover:bg-sky-100', iC: 'text-sky-500', tC: 'text-sky-700',
            },
            {
              type: 'EDIT', icon: Pencil, label: 'EDIT pristup', desc: 'Pregled i uređivanje',
              hB: 'hover:border-emerald-400', hBg: 'hover:bg-emerald-50',
              iB: 'bg-emerald-50 group-hover:bg-emerald-100', iC: 'text-emerald-600', tC: 'text-emerald-700',
            },
          ].map(b => (
            <button key={b.type} onClick={() => handleShare(b.type)}
              className={`group flex flex-col items-center gap-3 p-5 border-2 border-slate-200 rounded-2xl transition-all ${b.hB} ${b.hBg}`}>
              <div className={`w-14 h-14 ${b.iB} rounded-2xl flex items-center justify-center transition-colors`}>
                <b.icon className={`w-7 h-7 ${b.iC}`} />
              </div>
              <div className="text-center">
                <div className={`font-bold ${b.tC}`}>{b.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Novokreirani token — prikazuje se odmah nakon generisanja */}
      {shareToken && (
        <div className="card space-y-5 border-2 border-sky-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">Novi link</span>
            <span className={`badge ${shareToken.accessType === 'EDIT' ? 'badge-success' : 'badge-sky'}`}>
              {shareToken.accessType === 'EDIT' ? '✏️ EDIT' : '👁️ VIEW'}
            </span>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Ističe {formatDateLong(shareToken.expiresAt)}
            </span>
          </div>
          <div>
            <label className="label">Share link</label>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm font-mono bg-slate-50" value={shareToken.shareUrl} readOnly />
              <button onClick={handleCopy}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${copied ? 'bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}>
                <Copy className="w-4 h-4" />{copied ? 'Kopirano!' : 'Kopiraj'}
              </button>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <QrCode className="w-4 h-4 text-sky-500" />QR kod za dijeljenje
            </div>
            <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-card">
              <img
                src={sharingService.getQrCodeUrl(shareToken.token)}
                alt="QR kod za dijeljenje plana"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-slate-400 mt-3">Skenirajte telefonom za brzi pristup planu</p>
          </div>
        </div>
      )}

      {/* Lista svih aktivnih tokena za ovaj plan */}
      {sharings.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Aktivni linkovi ({sharings.length})
          </h3>
          <div className="space-y-3">
            {sharings.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span className={`badge shrink-0 ${s.accessType === 'EDIT' ? 'badge-success' : 'badge-sky'}`}>
                  {s.accessType === 'EDIT' ? '✏️ EDIT' : '👁️ VIEW'}
                </span>
                <input
                  className="input flex-1 text-xs font-mono bg-white py-1.5 h-auto"
                  value={s.shareUrl}
                  readOnly
                />
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                  do {formatDateLong(s.expiresAt)}
                </span>
                <button
                  onClick={() => handleDeleteSharing(s.id)}
                  className="btn-danger shrink-0"
                  title="Opozovi link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingTab;
