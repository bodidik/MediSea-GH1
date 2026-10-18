// Kullanım: node kitap/olcum.cjs <bolum.html>  → sayfa başına alt boşluk (mm); negatif = taşma
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const kaynak = path.resolve(process.argv[2]);
const kopya = path.join(path.dirname(kaynak), '_olcum.html');
const betik = `<script>addEventListener('load',()=>setTimeout(()=>{const mm=96/25.4;const ps=[...document.querySelectorAll('section.sayfa')];
const out=ps.map((p,i)=>{const r=p.getBoundingClientRect();const f=p.querySelector('.folyo');const lim=f?f.getBoundingClientRect().top:r.bottom-parseFloat(getComputedStyle(p).paddingBottom);let mx=0;
for(const e of p.querySelectorAll('*')){if(e.closest('.folyo'))continue;const b=e.getBoundingClientRect();if(b.height&&b.bottom>mx)mx=b.bottom}
const h=p.querySelector('h1,h2');return (i+1)+'|'+((lim-mx)/mm).toFixed(1)+'|'+(h?h.textContent.trim().slice(0,45):'')});
const pre=document.createElement('pre');pre.id='OLCUM';pre.textContent='W='+innerWidth+'\\n'+out.join('\\n');document.body.appendChild(pre)},1500))</script>`;
fs.writeFileSync(kopya, fs.readFileSync(kaynak, 'utf8').replace('</body>', betik + '</body>'));
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profil = path.join(require('os').tmpdir(), 'olc-edge-' + process.pid);
const dom = execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--user-data-dir=' + profil,
  '--window-size=1280,1000', '--virtual-time-budget=20000', '--dump-dom', 'file:///' + kopya.replace(/\\/g, '/')], { maxBuffer: 1 << 28 }).toString();
fs.unlinkSync(kopya);
const m = dom.match(/<pre id="OLCUM">([\s\S]*?)<\/pre>/);
console.log(m ? m[1] : 'ÖLÇÜM YOK');
