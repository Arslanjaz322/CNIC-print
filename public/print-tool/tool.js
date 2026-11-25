/* CNIC & Photo Print tool — runs once in the browser after the page markup is on screen */
(function(){
if(window.__printToolReady)return;window.__printToolReady=true;
const $=s=>document.querySelector(s),PX=3.7795;
const PAPER={'4x6':[101.6,152.4],'5x7':[127,177.8],A4:[210,297],Letter:[215.9,279.4],Legal:[215.9,355.6]};
const DEF={cnic:[5,2],photo:[1,1],setcnic:[5,2]};
let S={mode:'cnic',rows:5,cols:2,gap:4,outline:true,rotate:true,filter:'none',name:false,paper:'A4',cw:200,ch:200,quality:'Plain',pq:'High',margin:'',align:'c',scL:.2,scR:2,scT:1,scB:.2,bless:false,books:{cnic:{pages:[[]],pg:0},photo:{pages:[[]],pg:0},setcnic:{pages:[[]],pg:0}},orient:'p',colour:'colour',sel:-1};
let U=[],R=[],clip=null,lastUp=null,tgt=0,RC=new Map(),Z=1;const PR={mode:'cur',txt:''};
const MN={cnic:'CNIC A4',photo:'A4',setcnic:'Set CNIC'},BLS=()=>S.bless&&S.mode!=='setcnic';
Object.defineProperty(S,'pages',{get(){return S.books[S.mode].pages},set(v){S.books[S.mode].pages=v}});
Object.defineProperty(S,'pg',{get(){return S.books[S.mode].pg},set(v){S.books[S.mode].pg=v}});
Object.defineProperty(S,'slots',{get(){return S.pages[S.pg]},set(v){S.pages[S.pg]=v}});
const cpy=b=>({pg:b.pg,pages:b.pages.map(p=>p.slice())});
const snap=()=>{const{sel,books,...r}=S;return{...r,books:{cnic:cpy(books.cnic),photo:cpy(books.photo),setcnic:cpy(books.setcnic)}}};
const rest=o=>{const{books,...r}=o;Object.assign(S,r);S.books={cnic:cpy(books.cnic),photo:cpy(books.photo),setcnic:cpy(books.setcnic)}};
const mut=f=>{U.push(snap());if(U.length>60)U.shift();R=[];f();render()};
const undo=()=>{if(U.length){R.push(snap());rest(U.pop());render()}};
const redo=()=>{if(R.length){U.push(snap());rest(R.pop());render()}};
const count=()=>S.mode==='setcnic'?geom(...dims()).length:S.rows*S.cols;
const PN={'4x6':'4×6 in','5x7':'5×7 in',Other:'Custom'},pName=()=>PN[S.paper]||S.paper;
const dims=()=>{const d=S.paper==='Other'?[S.cw,S.ch]:PAPER[S.paper];return S.orient==='l'?[Math.max(...d),Math.min(...d)]:[Math.min(...d),Math.max(...d)]};
const toast=(m,stay)=>{const t=$('#toast');t.textContent=m;t.style.opacity=1;t.classList.toggle('busy',!!stay);clearTimeout(t._t);if(!stay)t._t=setTimeout(()=>t.style.opacity=0,2600)};
const loadImg=u=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=u});
const firstEmpty=()=>{for(let i=0;i<count();i++)if(!S.slots[i])return i;return 0};
const nextEmpty=i=>{for(let j=i+1;j<count();j++)if(!S.slots[j])return j;for(let j=0;j<=i&&j<count();j++)if(!S.slots[j])return j;return -1};

/* ---------- geometry ---------- */
function geom(pw,ph){
 if(S.mode==='setcnic'){
  const I=25.4,W0=85.6,H0=54,g=S.gap,L=S.scL*I,R=S.scR*I,T=S.scT*I,B=S.scB*I,c=Math.max(1,S.cols),r=Math.max(1,S.rows);
  const aw=pw-L-R-(c-1)*g,ah=ph-T-B-(r-1)*g;
  const w=Math.min(W0,aw/c,ah/r*W0/H0),h=w*H0/W0,o=[];
  S._fit=[c,r];S._sz=w>=10?[w,h]:null;
  if(!(w>=10))return o;
  const tw=c*w+(c-1)*g,x0=S.align==='l'?L:S.align==='r'?pw-R-tw:L+(pw-L-R-tw)/2;
  for(let y=0;y<r;y++)for(let x=0;x<c;x++)o.push({x:x0+x*(w+g),y:T+y*(h+g),w,h});
  return o}
 const cn=S.mode==='cnic',g=S.gap,m=S.margin===''?null:+S.margin,out=[];
 const BL=S.bless;
 const side=BL?0:m!=null?m:cn&&S.cols==2?8:S.cols==2?38.1:S.cols>=3?5.08:10,top=BL?0:m!=null?m:cn?6:10;
 let cw,ch,y0;
 if(BL){const gg=0;cw=pw/S.cols;ch=ph/S.rows;y0=0;const o=[];for(let r=0;r<S.rows;r++)for(let c=0;c<S.cols;c++)o.push({x:c*cw,y:r*ch,w:cw,h:ch});return o}
 if(S.paper==='4x6'){cw=30.48;ch=22.86;y0=(ph-(S.rows*ch+(S.rows-1)*g))/2}
 else{cw=(pw-2*side-(S.cols-1)*g)/S.cols;ch=(ph-2*top-(S.rows-1)*g)/S.rows;
  if(S.mode==='cnic'){ch=Math.min(ch,cw*54/85.6);cw=ch*85.6/54}
  y0=m!=null?(ph-(S.rows*ch+(S.rows-1)*g))/2:top}
 const x0=(pw-(S.cols*cw+(S.cols-1)*g))/2;
 for(let r=0;r<S.rows;r++)for(let c=0;c<S.cols;c++)out.push({x:x0+c*(cw+g),y:y0+r*(ch+g),w:cw,h:ch});
 return out}

/* ---------- sheet ---------- */
function rot(s,c){
 if(!S.rotate||(c.w>c.h)===(s.w>s.h)||Math.abs(s.w-s.h)<s.w*.05)return s.src;
 if(RC.has(s.src))return RC.get(s.src)||s.src;
 RC.set(s.src,null);
 loadImg(s.src).then(im=>{const k=newC(im.height,im.width),x=k.getContext('2d');x.translate(k.width/2,k.height/2);x.rotate(Math.PI/2);x.drawImage(im,-im.width/2,-im.height/2);return blobURL(k)}).then(u=>{RC.set(s.src,u);render()});
 return s.src}
function sheet(ed,sl=S.slots){
 const[pw,ph]=dims(),sh=document.createElement('div');
 sh.className='sheet'+(BLS()?' bl':'');sh.style.width=pw+'mm';sh.style.height=(ed?ph:ph-0.8)+'mm';
 geom(pw,ph).forEach((c,i)=>{
  if(i>=count())return;const s=sl[i];if(!s&&!ed)return;
  const d=document.createElement('div');d.className='cell'+(ed?' ed':'')+(ed&&S.sel===i?' sel':'');d.dataset.i=i;
  Object.assign(d.style,{left:c.x+'mm',top:c.y+'mm',width:c.w+'mm',height:c.h+'mm'});
  if(S.mode==='photo'){d.style.justifyContent='center';d.style.alignItems='center'}
  if(s){
   const im=new Image();im.src=rot(s,c);
   {const f=S.colour==='bw'||S.filter==='gray'?'grayscale(1)':S.filter==='sepia'?'sepia(1)':'';if(f)im.style.filter=f}
   if(S.mode!=='photo')im.style.objectFit='cover';if(S.outline)im.classList.add('ol');if(S.mode==='photo'&&!S.bless){const rr=S.rotate&&(c.w>c.h)!==(s.w>s.h)&&Math.abs(s.w-s.h)>=s.w*.05,sw=rr?s.h:s.w,shh=rr?s.w:s.h,k=Math.min(c.w/sw,(c.h-(S.name?4:0))/shh);im.style.cssText+=`flex:none;width:${sw*k}mm;height:${shh*k}mm`}
   d.append(im);
   if(S.name){const p=document.createElement('div');p.className='cap';p.textContent=s.name;d.append(p)}
   if(ed)d.insertAdjacentHTML('beforeend','<div class="tb"><button data-a="crop">Crop</button><button data-a="auto">Auto</button><button data-a="del">✕</button></div>');
  }else if(c.w<50)d.innerHTML='<div class="up"><button data-a="pick" style="font-size:3mm;padding:1mm 2.5mm;border-width:.3mm;border-radius:1mm">+ Upload</button></div>';else d.innerHTML='<div class="up"><div class="cf" data-a="pick"><span>Choose file</span>No file chosen</div><button data-a="pick">Upload a file</button></div>';
  sh.append(d)});
 return sh}
const fit=(wrap,pw,box,ph)=>{let k=Math.max(.15,Math.min(.7,(box.clientWidth-34)/(pw*PX)*.6));
 if(ph)k=Math.max(.15,Math.min(1.6,(box.clientWidth-34)/(pw*PX),(box.clientHeight-44)/(ph*PX)));wrap.style.zoom=k*Z};

function render(){
 $('#rows').value=S.rows;$('#cols').value=S.cols;$('#name').value=S.name?1:0;$('#gap').value=S.gap;
 $('#outline').checked=$('#outline2').checked=S.outline;$('#rotate').checked=S.rotate;$('#enh').checked=ENH.on;
 $('#gray').classList.toggle('on',S.filter==='gray');$('#sepia').classList.toggle('on',S.filter==='sepia');
 document.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===S.mode));
 
 {const sc=S.mode==='setcnic';$('#scPanel').hidden=!sc;$('#rRows').hidden=$('#rCols').hidden=false;$('#rFill').hidden=false;$('#bless').disabled=sc;
  document.querySelectorAll('[data-al]').forEach(b=>b.classList.toggle('on',b.dataset.al===S.align));
  ['scL','scR','scT','scB'].forEach(k=>$('#'+k).value=S[k])}
 {let t=count()+' photos per page';if(S.mode==='setcnic'){const z=S._sz;t=!z?'No room for these rows/columns — reduce margins, rows or columns':`${count()} photos per page (${S.cols} × ${S.rows}) · card ${(z[0]/25.4).toFixed(2)} × ${(z[1]/25.4).toFixed(2)} in`}$('#ppp').textContent=t}
 $('#undo').disabled=!U.length;$('#redo').disabled=!R.length;
 $('#paper').value=$('#paper2').value=S.paper;$('#bless').checked=S.bless;$('#mar').disabled=S.bless||S.mode==='setcnic';$('#qual').value=S.quality;$('#pq').value=S.pq;$('#mar').value=S.margin;{const[pw,ph]=dims(),g0=geom(pw,ph),c0=g0[0],L=g0[g0.length-1],over=c0&&(c0.x<0||c0.y<0||L.x+L.w>pw+.01||L.y+L.h>ph+.01);$('#sizeinfo').innerHTML=`Page ${pw.toFixed(1)} × ${ph.toFixed(1)} mm · box ${c0?c0.w.toFixed(1)+' × '+c0.h.toFixed(1)+' mm':''}`+(over?'<br><b style="color:#d33">Boxes do not fit — reduce rows/columns or interval.</b>':'')}$('#oth').hidden=S.paper!=='Other';$('#cw').value=S.cw;$('#ch').value=S.ch;
 $('#orient').value=$('#orient2').value=S.orient;$('#colour').value=S.colour;$('#pgl').textContent=`${S.pg+1} / ${S.pages.length}`;$('#zl').textContent=Math.round(Z*100)+'%';$('#pvT').textContent='Print preview — '+MN[S.mode];
 const zw=$('#zw');zw.replaceChildren(sheet(true));fit(zw,dims()[0],$('#stage'),dims()[1]);
 if(!$('#pv').hidden)paintPv();if(!$('#pd').hidden)paintLpv()}

function paintLpv(){
 const[pw,ph]=dims(),L=pgList(),p=L.length?L[0]:S.pg,box=$('#lpv'),BW=box.clientWidth-24||300,BH=box.clientHeight-24||300;
 const k=Math.min(BW/(pw*PX),BH/(ph*PX)),w=document.createElement('div');w.className='lw';w.style.width=pw*PX*k+'px';w.style.height=ph*PX*k+'px';
 const sh=sheet(false,S.pages[p]||[]);sh.style.height=ph+'mm';sh.style.transform=`scale(${k})`;w.append(sh);box.replaceChildren(w);
 $('#lpvn').textContent=`Showing page ${p+1} of ${L.length||1} selected · true proportions ${pw.toFixed(1)}:${ph.toFixed(1)} mm`;
 const W=Math.round(pw/25.4*300),H=Math.round(ph/25.4*300);
 $('#pinfo').textContent=`${MN[S.mode]} layout · Page ${pw.toFixed(1)} × ${ph.toFixed(1)} mm · Margins ${S.bless?'none (borderless)':S.margin===''?'auto':S.margin+' mm'} · Export ${W} × ${H} px @ 300 DPI`;
 $('#phelp').innerHTML=`<b>Printer: ${PRN.cur}</b><br>Clicking Print opens your system print dialog — select <b>${PRN.cur}</b> there. Browsers cannot set driver options directly, so in the dialog: set <b>Scale 100% / Actual size</b>, paper size <b>${pName()}</b>${S.bless?', <b>Borderless</b> on':''}, and under <i>Preferences / More settings</i> pick Media type <b>${S.quality}</b>, Quality <b>${S.pq}</b>${S.colour==='bw'?', <b>Grayscale</b>':''}.`}
function pgList(){const n=S.pages.length;if(PR.mode==='all')return[...Array(n).keys()];if(PR.mode==='cur')return[S.pg];const o=[];PR.txt.split(',').forEach(t=>{const m=t.trim().match(/^(\d+)(?:-(\d+))?$/);if(m)for(let a=+m[1];a<=+(m[2]||m[1]);a++)if(a>=1&&a<=n&&!o.includes(a-1))o.push(a-1)});return o.sort((a,b)=>a-b)}
function paintPv(){
 const[pw,ph]=dims();$('#pst').textContent=`@page{size:${pw}mm ${ph}mm;margin:0}`;
 const z=$('#pzw'),L=pgList();z.replaceChildren();
 L.forEach(p=>{const s=sheet(false,S.pages[p]);s.classList.add('pg');s.style.marginBottom='12px';z.append(s)});
 fit(z,pw,$('#holder'),ph);
 const n=L.reduce((a,p)=>a+S.pages[p].slice(0,count()).filter(Boolean).length,0);
 $('#pnote').textContent=n?`${L.length} page(s) · ${n} photo(s) · ${MN[S.mode]} · ${pName()} ${S.orient==='l'?'landscape':'portrait'} · ${S.quality} paper · ${S.pq} — pick the same paper type in your printer dialog.`:'No photos in the selected pages — upload photos first.'}

/* ---------- export 300 DPI ---------- */
async function exportPages(){
 const[pw,ph]=dims(),D=300/25.4,W=Math.round(pw/25.4*300),H=Math.round(ph/25.4*300),G=geom(pw,ph);
 const best=S.pq==='Best Photo',q={Draft:.7,Standard:.85,High:.92}[S.pq]||.92,L=[...S.pages.keys()];
 const list=L.filter(p=>S.pages[p].slice(0,count()).some(Boolean));if(!list.length)return toast('No photos to export');
 for(let n=0;n<50&&rotBusy();n++)await new Promise(r=>setTimeout(r,100));
 for(const p of list){
  const c=newC(W,H),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.imageSmoothingQuality='high';
  const f=S.colour==='bw'||S.filter==='gray'?'grayscale(1)':S.filter==='sepia'?'sepia(1)':'none';
  for(let i=0;i<count();i++){const s=S.pages[p][i],b=G[i];if(!s||!b)continue;
   const im=await loadImg(rot(s,b)),cap=S.name?4:0,bh=b.h-cap,k=(BLS()||S.mode!=='photo'?Math.max:Math.min)(b.w/im.naturalWidth,bh/im.naturalHeight),iw=im.naturalWidth*k,ih=im.naturalHeight*k,ix=b.x+(b.w-iw)/2,iy=b.y+(bh-ih)/2;
   x.save();x.beginPath();x.rect(b.x*D,b.y*D,b.w*D,b.h*D);x.clip();x.filter=f;x.drawImage(im,ix*D,iy*D,iw*D,ih*D);x.restore();
   if(S.outline){x.strokeStyle='#000';x.lineWidth=.35*D;{const ox=Math.max(ix,b.x),oy=Math.max(iy,b.y),ow=Math.min(ix+iw,b.x+b.w)-ox,oh=Math.min(iy+ih,b.y+bh)-oy;x.strokeRect((ox+.175)*D,(oy+.175)*D,(ow-.35)*D,(oh-.35)*D)}}
   if(S.name){x.fillStyle='#000';x.font=`${2.8*D}px system-ui,Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(s.name,(b.x+b.w/2)*D,(b.y+bh+2)*D,b.w*D)}}
  const blob=await new Promise(r=>c.toBlob(r,best?'image/png':'image/jpeg',best?undefined:q)),u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download=`${MN[S.mode].replace(/\s+/g,'_')}_${S.paper}_page${p+1}_300dpi.${best?'png':'jpg'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
  await new Promise(r=>setTimeout(r,300))}
 toast(`Exported ${list.length} page(s) at ${W} × ${H} px`)}

/* ---------- helpers ---------- */
const newC=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
const blobURL=(c,q=.95)=>new Promise((ok,no)=>c.toBlob(b=>b?ok(URL.createObjectURL(b)):no(Error('blob')),'image/jpeg',q));
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const tick=()=>new Promise(r=>setTimeout(r,16));
/* print-ready size: about 600 DPI for the current box size, between 2400 and 3840 px */
const capPx=()=>{const[pw,ph]=dims(),g=geom(pw,ph)[0]||{w:100,h:100};return Math.round(cl(Math.max(g.w,g.h)/25.4*600,2400,3840))};
function capC(c){const k=Math.min(1,capPx()/Math.max(c.width,c.height));if(k>=1)return c;const o=newC(c.width*k,c.height*k),x=o.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,o.width,o.height);return o}

/* ---------- auto crop (detects the card / photo on a plain background) ---------- */
function autoCrop(c){
 const k=Math.min(1,500/Math.max(c.width,c.height)),w=Math.max(4,Math.round(c.width*k)),h=Math.max(4,Math.round(c.height*k));
 const t=newC(w,h),x=t.getContext('2d');x.drawImage(c,0,0,w,h);
 const d=x.getImageData(0,0,w,h).data,p=(i,j)=>(j*w+i)*4,ring=[];
 for(let i=0;i<w;i++)ring.push(p(i,0),p(i,h-1));for(let j=0;j<h;j++)ring.push(p(0,j),p(w-1,j));
 const med=n=>{const a=ring.map(q=>d[q+n]).sort((m,o)=>m-o);return a[a.length>>1]};
 const bg=[med(0),med(1),med(2)],rc=new Uint16Array(h),cc=new Uint16Array(w);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=p(i,j);if(Math.abs(d[q]-bg[0])+Math.abs(d[q+1]-bg[1])+Math.abs(d[q+2]-bg[2])>60){rc[j]++;cc[i]++}}
 let y0=0,y1=h-1,x0=0,x1=w-1;
 while(y0<h&&rc[y0]<w*.02)y0++;while(y1>y0&&rc[y1]<w*.02)y1--;
 while(x0<w&&cc[x0]<h*.02)x0++;while(x1>x0&&cc[x1]<h*.02)x1--;
 if((x1-x0)*(y1-y0)<.08*w*h)return null;
 const pad=.01*Math.max(w,h);x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(w-1,x1+pad);y1=Math.min(h-1,y1+pad);
 return{x:x0/k,y:y0/k,w:(x1-x0)/k,h:(y1-y0)/k}}
function cropC(c,r){const o=newC(r.w,r.h);o.getContext('2d').drawImage(c,r.x,r.y,r.w,r.h,0,0,o.width,o.height);return o}
/* a slot = {orig: enhanced full photo, src: print-ready crop, w,h,name, cs: crop settings so it can be re-edited} */
async function mkq(orig,cc,name,extra){const c=capC(cc);return{orig,src:await blobURL(c),w:c.width,h:c.height,name,...extra}}
async function mk(orig,c,r,name){
 const cs={mode:'rect',rot:0,ang:0,flip:false,ratio:0,rect:r?{x:r.x/c.width,y:r.y/c.height,w:r.w/c.width,h:r.h/c.height}:{x:0,y:0,w:1,h:1}};
 return mkq(orig,r?cropC(c,r):c,name,{cs})}
function warp(c,q){
 const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);let W=Math.max(d(q[0],q[1]),d(q[3],q[2])),H=Math.max(d(q[0],q[3]),d(q[1],q[2]));
 const k=Math.min(1,capPx()/Math.max(W,H));W=Math.max(1,Math.round(W*k));H=Math.max(1,Math.round(H*k));
 const[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=q,dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const den=dx1*dy2-dy1*dx2||1e-9,g=(dx3*dy2-dy3*dx2)/den,h=(dx1*dy3-dy1*dx3)/den,A=x1-x0+g*x1,B=x3-x0+h*x3,D=y1-y0+g*y1,E=y3-y0+h*y3;
 const sw=c.width,sh=c.height,sd=c.getContext('2d').getImageData(0,0,sw,sh).data,o=newC(W,H);
 const ox=o.getContext('2d'),od=ox.createImageData(W,H),T=od.data;
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){
  const u=(i+.5)/W,v=(j+.5)/H,w=g*u+h*v+1,x=(A*u+B*v+x0)/w-.5,y=(D*u+E*v+y0)/w-.5,xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi;
  const xa=cl(xi,0,sw-1),xb=cl(xi+1,0,sw-1),ya=cl(yi,0,sh-1),yb=cl(yi+1,0,sh-1),i00=(ya*sw+xa)*4,i10=(ya*sw+xb)*4,i01=(yb*sw+xa)*4,i11=(yb*sw+xb)*4,q4=(j*W+i)*4;
  for(let n=0;n<3;n++)T[q4+n]=sd[i00+n]*(1-fx)*(1-fy)+sd[i10+n]*fx*(1-fy)+sd[i01+n]*(1-fx)*fy+sd[i11+n]*fx*fy;
  T[q4+3]=255}
 ox.putImageData(od,0,0);return o}
const fullC=async u=>{const im=await loadImg(u),c=newC(im.naturalWidth,im.naturalHeight);c.getContext('2d').drawImage(im,0,0);return c};

/* ---------- file loading ---------- */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const isImg=f=>/^image\//i.test(f.type||'')||/pdf/i.test(f.type||'')||/\.(jpe?g|png|pdf|webp|gif|bmp|avif)$/i.test(f.name||'');
async function toCanvas(f){
 if(/pdf/i.test(f.type)||/\.pdf$/i.test(f.name||'')){
  if(!window.pdfjsLib)await new Promise((ok,no)=>{const sc=document.createElement('script');sc.src=PDFJS+'pdf.min.js';sc.onload=ok;sc.onerror=no;document.head.append(sc)});
  if(!window.pdfjsLib)throw Error('pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';
  const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,pg=await d.getPage(1),v1=pg.getViewport({scale:1}),v=pg.getViewport({scale:3000/Math.max(v1.width,v1.height)});
  const c=newC(v.width,v.height),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:x,viewport:v}).promise;return c}
 const u=URL.createObjectURL(f),im=await loadImg(u),k=Math.min(1,4096/Math.max(im.naturalWidth,im.naturalHeight));
 const c=newC(im.naturalWidth*k,im.naturalHeight*k),x=c.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);return c}

/* ---------- auto enhance: clean + upscale to 4K (3840 px long edge) + natural detail ---------- */
/* the AI scan prompt lives on the server (src/lib/enhance.server.ts) */
const ENH={on:true},FOURK=3840;
const CF=(()=>{try{const x=newC(1,1).getContext('2d');x.filter='blur(1px)';return x.filter==='blur(1px)'}catch(e){return false}})();
function blur(src,w,h,r){
 const t=new Uint8ClampedArray(src.length),o=new Uint8ClampedArray(src.length),m=2*r+1,cl=(v,a)=>v<0?0:v>a?a:v;
 for(let y=0;y<h;y++)for(let c=0;c<3;c++){let s=0;const b=y*w*4+c;for(let k=-r;k<=r;k++)s+=src[b+cl(k,w-1)*4];
  for(let x=0;x<w;x++){t[b+x*4]=s/m;s+=src[b+cl(x+r+1,w-1)*4]-src[b+cl(x-r,w-1)*4]}}
 for(let x=0;x<w;x++)for(let c=0;c<3;c++){let s=0;const b=x*4+c,st=w*4;for(let k=-r;k<=r;k++)s+=t[b+cl(k,h-1)*st];
  for(let y=0;y<h;y++){o[b+y*st]=s/m;s+=t[b+cl(y+r+1,h-1)*st]-t[b+cl(y-r,h-1)*st]}}
 return o}
/* blurred copy of a canvas (GPU blur when the browser supports it, JS box blur otherwise) */
function blurPx(c,r){
 const w=c.width,h=c.height;
 if(CF){const t=newC(w,h),x=t.getContext('2d');x.filter='blur('+r+'px)';x.drawImage(c,0,0);x.filter='none';return x.getImageData(0,0,w,h).data}
 return blur(c.getContext('2d').getImageData(0,0,w,h).data,w,h,Math.max(1,Math.round(r)))}
/* step 1: restore faded colour (auto levels) and calm sensor noise in flat areas, before upscaling */
function cleanC(c){
 const w=c.width,h=c.height,n=w*h,x=c.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,hist=new Uint32Array(256);
 for(let i=0;i<n;i++)hist[(d[i*4]*77+d[i*4+1]*150+d[i*4+2]*29)>>8]++;
 let lo=0,hi=255,a=0;const t=n*.004;
 for(;lo<255;lo++){a+=hist[lo];if(a>t)break}
 a=0;for(;hi>0;hi--){a+=hist[hi];if(a>t)break}
 if(hi-lo>40){const k=255/(hi-lo);for(let i=0;i<n*4;i++)if((i&3)!==3)d[i]=(d[i]-lo)*k}
 x.putImageData(id,0,0);
 const b1=blurPx(c,1),thr=Math.max(w,h)<1600?14:10;
 for(let i=0;i<n*4;i++){if((i&3)===3)continue;const df=d[i]-b1[i];if(Math.abs(df)<thr)d[i]-=df*.5}
 x.putImageData(id,0,0)}
/* step 2: step-wise high-quality upscale (max 1.5x per step keeps edges clean) */
function upTo(c,L){
 let cur=c;
 while(Math.max(cur.width,cur.height)<L-1){
  const k=Math.min(1.5,L/Math.max(cur.width,cur.height)),n=newC(cur.width*k,cur.height*k),x=n.getContext('2d');
  x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(cur,0,0,n.width,n.height);cur=n}
 return cur}
/* step 3: edge-aware unsharp mask - threshold + overshoot limit = no halos, no noise boost */
function sharpC(c,amt,rad){
 const w=c.width,h=c.height,x=c.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,b=blurPx(c,rad),m=Math.ceil(rad*3)+1,LIM=36;
 for(let y=m;y<h-m;y++){let i=(y*w+m)*4;for(let xx=m;xx<w-m;xx++,i+=4)for(let n=0;n<3;n++){
  const e=d[i+n]-b[i+n];if(e>2||e<-2)d[i+n]+=amt*(e>LIM?LIM:e<-LIM?-LIM:e)}}
 x.putImageData(id,0,0)}
async function enhance(c,say=()=>{}){
 const L0=Math.max(c.width,c.height);
 say('Cleaning');await tick();cleanC(c);
 let o=c;
 if(L0<FOURK){say('Upscaling to 4K');await tick();o=upTo(c,FOURK)}
 say('Restoring detail');await tick();
 const s=Math.max(1,Math.max(o.width,o.height)/L0);
 sharpC(o,Math.min(1.1,.5+.12*s),Math.min(3,.7+.3*s));
 return o}

/* AI scan clean-up (CamScanner-style, done on the server), then upscale to 4K + gentle sharpening */
async function aiScan(c){
 if(typeof window.cnicAiEnhance!=='function')throw Error('AI enhance is not ready yet');
 /* send only the detected card (smaller upload, card fills the frame = faster + sharper text) */
 const r=autoCrop(c),src=r&&r.w*r.h<c.width*c.height*.92?cropC(c,r):c;
 const k=Math.min(1,1024/Math.max(src.width,src.height)),s=newC(src.width*k,src.height*k),x=s.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);x.imageSmoothingQuality='high';x.drawImage(src,0,0,s.width,s.height);
 const out=await window.cnicAiEnhance({image:s.toDataURL('image/jpeg',.85),width:s.width,height:s.height});
 const im=await loadImg(out),o=newC(im.naturalWidth,im.naturalHeight);o.getContext('2d').drawImage(im,0,0);return o}
async function enhanceAI(c,say=()=>{}){
 say('AI scan clean-up',true);
 let o=await aiScan(c);const L0=Math.max(o.width,o.height);
 if(L0<FOURK){say('Upscaling to 4K',true);await tick();o=upTo(o,FOURK)}
 say('Sharpening',true);await tick();
 const s=Math.max(1,Math.max(o.width,o.height)/L0);
 sharpC(o,Math.min(.8,.35+.1*s),Math.min(2.4,.6+.25*s));
 return o}

async function addFiles(fs,idx){
 fs=[...fs].filter(isImg);
 if(!fs.length)return toast('Please choose JPG, PNG, WebP or PDF files');
 const out=[];let aiOk=0,aiErr='';
 for(const f of fs){
  const nm=f.name||'pasted image';
  try{
   toast('Loading '+nm+'…',true);await tick();
   let c=await toCanvas(f);
   if(ENH.on){try{c=await enhanceAI(c,(m,st)=>toast(m+' '+nm+'…',st));aiOk++}
    catch(e){console.error(e);aiErr=(e&&e.message)||'AI enhance failed';c=await enhance(c,m=>toast(m+' '+nm+'…',true))}}
   const orig=await blobURL(c),r=autoCrop(c);
   out.push(await mk(orig,c,r,nm))
  }catch(e){console.error(e);toast('Could not read '+nm)}}
 if(!out.length)return;
 const placed=[];
 mut(()=>{let p=S.pg,i=idx;out.forEach((s,n)=>{if(n){i++;for(;;){if(i>=count()){p++;i=0;S.pages[p]=S.pages[p]||[]}if(!S.pages[p][i])break;i++}}S.pages[p][i]=s;placed.push({p,i})});const L=placed[placed.length-1];S.sel=L&&L.p===S.pg?nextEmpty(L.i):-1});
 lastUp=out[out.length-1];
 toast(aiErr?'Photo added with standard 4K enhance — AI scan unavailable: '+aiErr:(ENH.on?'Photo added — AI scan clean-up, 4K & auto-cropped':'Photo added — auto-cropped')+'. Ctrl+C then Ctrl+V fills the next box.')}

/* ---------- crop editor: ONE tool - 4 corner points + straighten / rotate / flip / zoom ---------- */
let cMode=(()=>{try{return localStorage.getItem('cnicCropMode')==='rect'?'rect':'persp'}catch(e){return'persp'}})(),cDr=null;
let cI=0,cBase=null,cPv=null,cPvT=null,cRot=0,cAng=0,cFlip=false,cZoom=1,cFitW=1,cTok=0,cBusy=false;
const cp=[[0,0],[0,0],[0,0],[0,0]];let cK=1,cD=-1,cCur=null,pend=null;
const bounds=(iw,ih,deg)=>{const t=deg*Math.PI/180,c=Math.abs(Math.cos(t)),s=Math.abs(Math.sin(t));return[iw*c+ih*s,iw*s+ih*c]};
/* image rotated by (90° steps + straighten angle), mirrored if flipped, white where the rotation leaves gaps; k = scale */
function tx(img,iw,ih,k){
 const deg=cRot+cAng,[W,H]=bounds(iw,ih,deg),o=newC(W*k,H*k),x=o.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);
 x.setTransform(k,0,0,k,0,0);x.translate(W/2,H/2);x.rotate(deg*Math.PI/180);x.scale(cFlip?-1:1,1);
 x.imageSmoothingQuality='high';x.drawImage(img,-iw/2,-ih/2,iw,ih);return o}
const norm=()=>{const im=$('#cimg'),w=im.clientWidth,h=im.clientHeight;return cp.map(p=>[p[0]/w,p[1]/h])};
function place(n){const im=$('#cimg'),w=im.clientWidth,h=im.clientHeight;n.forEach((p,i)=>cp[i]=[p[0]*w,p[1]*h]);drawQ()}
const setR=(x0,y0,x1,y1)=>{cp[0]=[x0,y0];cp[1]=[x1,y0];cp[2]=[x1,y1];cp[3]=[x0,y1]};
function toRect(){const xs=cp.map(p=>p[0]),ys=cp.map(p=>p[1]);setR(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys))}
function drawQ(){
 if(cMode==='rect')toRect();
 document.querySelectorAll('#cbox .pt').forEach((p,i)=>{p.style.left=cp[i][0]+'px';p.style.top=cp[i][1]+'px'});
 document.querySelectorAll('#cbox .sd').forEach((p,i)=>{const a=cp[i],b=cp[(i+1)%4];p.style.left=(a[0]+b[0])/2+'px';p.style.top=(a[1]+b[1])/2+'px';p.style.transform=`rotate(${Math.atan2(b[1]-a[1],b[0]-a[0])}rad)`});
 $('#cpoly').setAttribute('points',cp.map(p=>p.join(',')).join(' '));
 const im=$('#cimg'),w=im.clientWidth,h=im.clientHeight;
 $('#cmask').setAttribute('d',`M0 0H${w}V${h}H0Z M${cp.map(p=>p.join(' ')).join(' L')}Z`);
 let g='';if(cMode==='rect'){const[x0,y0]=cp[0],[x1,y1]=cp[2],a=(x1-x0)/3,b=(y1-y0)/3;g=`M${x0+a} ${y0}V${y1}M${x0+2*a} ${y0}V${y1}M${x0} ${y0+b}H${x1}M${x0} ${y0+2*b}H${x1}`}
 $('#cgrid').setAttribute('d',g)}
/* magnifier shown while a handle is dragged */
function loupe(P,e){
 const L=$('#loupe');if(!P||!cPvT){L.hidden=true;return}
 L.hidden=false;const im=$('#cimg'),s=cPvT.width/im.clientWidth,cv=L.firstElementChild,x=cv.getContext('2d'),Z=3,src=cv.width/2/Z*s;
 x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.imageSmoothingQuality='high';
 x.drawImage(cPvT,P[0]*s-src/2,P[1]*s-src/2,src,src,0,0,cv.width,cv.height);
 const W=innerWidth,top=e.clientY<190?e.clientY+40:e.clientY-170;
 L.style.left=cl(e.clientX-60,6,W-126)+'px';L.style.top=top+'px'}
function setQ(r,sw){const im=$('#cimg'),w=im.clientWidth,h=im.clientHeight,f=r?w/sw:0;
 (r?[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]].map(p=>[p[0]*f,p[1]*f]):[[0,0],[w,0],[w,h],[0,h]]).forEach((p,i)=>cp[i]=p);drawQ()}
const autoQ=()=>{if(cPvT)setQ(autoCrop(cPvT),cPvT.width)};
function applyZoom(){
 const im=$('#cimg');
 if(cZoom===1){im.style.width='';im.style.maxWidth='';im.style.maxHeight=''}
 else{im.style.maxWidth='none';im.style.maxHeight='none';im.style.width=Math.round(cFitW*cZoom)+'px'}
 cK=bounds(cBase.width,cBase.height,cRot+cAng)[0]/im.clientWidth}
async function showRot(){
 const t=++cTok,im=$('#cimg');
 cPvT=tx(cPv,cBase.width,cBase.height,cPv.width/cBase.width);
 im.style.width='';im.style.maxWidth='';im.style.maxHeight='';
 im.src=cPvT.toDataURL('image/jpeg',.9);
 try{await im.decode()}catch(e){}
 if(t!==cTok)return;
 cFitW=im.clientWidth;applyZoom();
 if(pend){const n=pend;pend=null;place(n)}else autoQ()}
/* change rotation / angle / flip but keep the 4 points where they were (relative to the picture) */
function geo(f){if(!cBase)return;const n=norm();f();pend=n;showRot()}
function turnP(d){
 if(!cBase)return;const n=norm();
 pend=d>0?[[1-n[3][1],n[3][0]],[1-n[0][1],n[0][0]],[1-n[1][1],n[1][0]],[1-n[2][1],n[2][0]]]:[[n[1][1],1-n[1][0]],[n[2][1],1-n[2][0]],[n[3][1],1-n[3][0]],[n[0][1],1-n[0][0]]];
 cRot=(cRot+d*90+360)%360;showRot()}
function setZoom(z){if(!cBase)return;const n=norm();cZoom=cl(z,1,8);applyZoom();place(n)}
const cb=$('#cbox');
const cbP=e=>{const b=$('#cimg').getBoundingClientRect();return[cl(e.clientX-b.left,0,b.width),cl(e.clientY-b.top,0,b.height),b.width,b.height]};
cb.onpointerdown=e=>{
 const t=e.target.closest('.pt,.sd'),[x,y]=cbP(e),o=cp.map(p=>p.slice());
 if(t&&t.classList.contains('pt')){cDr={t:'pt',k:+t.dataset.k,o};loupe(cp[cDr.k],e)}
 else if(t){const a=+t.dataset.s,b=(a+1)%4;cDr={t:'sd',k:a,p0:[x,y],o};loupe([(cp[a][0]+cp[b][0])/2,(cp[a][1]+cp[b][1])/2],e)}
 else if(cMode==='rect'&&x>cp[0][0]&&x<cp[2][0]&&y>cp[0][1]&&y<cp[2][1])cDr={t:'mv',p0:[x,y],o};
 else return;
 cb.setPointerCapture(e.pointerId);e.preventDefault()};
cb.onpointermove=e=>{
 if(!cDr)return;const[x,y,w,h]=cbP(e),M=24,o=cDr.o;
 let x0=o[0][0],y0=o[0][1],x1=o[2][0],y1=o[2][1];
 if(cDr.t==='pt'){const k=cDr.k;
  if(cMode==='rect'){if(k===0||k===3)x0=Math.min(x,x1-M);else x1=Math.max(x,x0+M);if(k<2)y0=Math.min(y,y1-M);else y1=Math.max(y,y0+M);setR(x0,y0,x1,y1)}
  else cp[k]=[x,y];
  drawQ();loupe(cp[k],e)}
 else if(cDr.t==='sd'){const a=cDr.k,b=(a+1)%4;
  if(cMode==='rect'){if(a===0)y0=Math.min(y,y1-M);else if(a===1)x1=Math.max(x,x0+M);else if(a===2)y1=Math.max(y,y0+M);else x0=Math.min(x,x1-M);setR(x0,y0,x1,y1)}
  else{const ex=o[b][0]-o[a][0],ey=o[b][1]-o[a][1],L=Math.hypot(ex,ey)||1,nx=-ey/L,ny=ex/L,d=(x-cDr.p0[0])*nx+(y-cDr.p0[1])*ny;[a,b].forEach(i=>cp[i]=[cl(o[i][0]+nx*d,0,w),cl(o[i][1]+ny*d,0,h)])}
  drawQ();loupe([(cp[a][0]+cp[b][0])/2,(cp[a][1]+cp[b][1])/2],e)}
 else{const dx=cl(x-cDr.p0[0],-x0,w-x1),dy=cl(y-cDr.p0[1],-y0,h-y1);setR(x0+dx,y0+dy,x1+dx,y1+dy);drawQ()}};
cb.onpointerup=cb.onpointercancel=()=>{cDr=null;loupe(null)};
function setCMode(m){cMode=m;try{localStorage.setItem('cnicCropMode',m)}catch(e){}$('#cm').dataset.mode=m;document.querySelectorAll('[data-cm]').forEach(b=>b.classList.toggle('on',b.dataset.cm===m));if(cBase)drawQ()}
document.querySelectorAll('[data-cm]').forEach(b=>b.onclick=()=>setCMode(b.dataset.cm));
setCMode(cMode);
function closeCrop(){cTok++;$('#cm').hidden=true;cBase=cPv=cPvT=cCur=null}
async function openCrop(i){
 const s=S.slots[i];if(!s)return false;
 cI=i;const t=++cTok;$('#cm').hidden=false;clearTimeout($('#toast')._t);$('#toast').style.opacity=0;
 try{
  cBase=await fullC(s.orig);if(t!==cTok)return false;
  const k=Math.min(1,1600/Math.max(cBase.width,cBase.height));
  if(k<1){cPv=newC(cBase.width*k,cBase.height*k);const x=cPv.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(cBase,0,0,cPv.width,cPv.height)}else cPv=cBase;
  const st=s.cs||{};cRot=st.rot||0;cAng=st.ang||0;cFlip=!!st.flip;cZoom=1;$('#cAng').value=cAng;$('#cAngV').textContent=cAng.toFixed(1)+'°';pend=null;
  if(st.mode==='persp'&&st.q)pend=st.q.map(p=>p.slice());
  else if(st.rect&&!cRot){const r=st.rect;pend=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]]}
  await showRot();return true
 }catch(e){console.error(e);toast('Could not open the crop tool');$('#cm').hidden=true;return false}}
$('#cRotL').onclick=()=>turnP(-1);
$('#cRotR').onclick=()=>turnP(1);
$('#cAng').oninput=e=>{const v=+e.target.value;$('#cAngV').textContent=v.toFixed(1)+'°';geo(()=>cAng=v)};
$('#cAng').ondblclick=()=>{$('#cAng').value=0;$('#cAngV').textContent='0.0°';geo(()=>cAng=0)};
$('#cFlip').onclick=()=>geo(()=>cFlip=!cFlip);
$('#cZo').onclick=()=>setZoom(cZoom/1.3);
$('#cZi').onclick=()=>setZoom(cZoom*1.3);
$('#cZf').onclick=()=>setZoom(1);
$('#cAuto').onclick=autoQ;
$('#cFull').onclick=()=>{if(!cBase)return;cRot=0;cAng=0;cFlip=false;cZoom=1;$('#cAng').value=0;$('#cAngV').textContent='0.0°';pend=[[0,0],[1,0],[1,1],[0,1]];showRot()};
$('#cCancel').onclick=closeCrop;
$('#cApply').onclick=async()=>{
 if(cBusy||!cBase)return;cBusy=true;const b=$('#cApply');b.disabled=true;
 try{
  const s=S.slots[cI];if(!s)return closeCrop();
  toast('Applying…');await tick();
  const[W,H]=bounds(cBase.width,cBase.height,cRot+cAng),kk=Math.min(1,5000/Math.max(W,H)),f=cK*kk;
  const q=cp.map(p=>[p[0]*f,p[1]*f]);
  if(Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1])<10||Math.hypot(q[0][0]-q[3][0],q[0][1]-q[3][1])<10)return toast('Crop area is too small');
  const n0=norm();cCur=tx(cBase,cBase.width,cBase.height,kk);
  const n=await mkq(s.orig,warp(cCur,q),s.name,{cs:{mode:'persp',rot:cRot,ang:cAng,flip:cFlip,q:n0}});
  mut(()=>S.slots[cI]=n);closeCrop();toast('Applied')
 }catch(e){console.error(e);toast('Could not apply — try again')}
 finally{cBusy=false;b.disabled=false}};
/* ---------- UI wiring ---------- */
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>mut(()=>{S.mode=b.dataset.m;[S.rows,S.cols]=DEF[S.mode];S.sel=-1}));
const sel=(id,f)=>$(id).onchange=e=>mut(()=>f(e.target));
for(let i=1;i<=20;i++)$('#rows').add(new Option(i+' Row',i));
for(let i=1;i<=4;i++)$('#cols').add(new Option(i+' Col',i));
sel('#rows',t=>S.rows=+t.value);
$('#rowP').onclick=()=>{if(S.rows<20)mut(()=>S.rows++);else toast('Maximum 20 rows')};
$('#rowM').onclick=()=>{if(S.rows>1)mut(()=>S.rows--)};sel('#cols',t=>S.cols=+t.value);sel('#name',t=>S.name=t.value==='1');
sel('#gap',t=>S.gap=Math.max(0,Math.min(30,+t.value||0)));
sel('#outline',t=>S.outline=t.checked);sel('#outline2',t=>S.outline=t.checked);sel('#rotate',t=>S.rotate=t.checked);
sel('#paper',t=>S.paper=t.value);sel('#paper2',t=>S.paper=t.value);sel('#bless',t=>S.bless=t.checked);sel('#pq',t=>S.pq=t.value);sel('#mar',t=>S.margin=t.value===''?'':Math.max(0,Math.min(50,+t.value||0)));$('#exp').onclick=exportPages;sel('#qual',t=>S.quality=t.value);sel('#orient',t=>S.orient=t.value);sel('#orient2',t=>S.orient=t.value);sel('#colour',t=>S.colour=t.value);
sel('#cw',t=>S.cw=Math.max(50,+t.value||200));sel('#ch',t=>S.ch=Math.max(50,+t.value||200));
document.querySelectorAll('[data-al]').forEach(b=>b.onclick=()=>{if(S.align!==b.dataset.al)mut(()=>S.align=b.dataset.al)});
['scL','scR','scT','scB'].forEach(k=>sel('#'+k,t=>S[k]=t.value===''&&(k==='scT'||k==='scR')?(k==='scT'?1:2):Math.max(0,Math.min(6,+t.value||0))));
$('#scReset').onclick=()=>mut(()=>{S.align='c';S.scL=S.scB=.2;S.scR=2;S.scT=1});
$('#gray').onclick=()=>mut(()=>S.filter=S.filter==='gray'?'none':'gray');
$('#sepia').onclick=()=>mut(()=>S.filter=S.filter==='sepia'?'none':'sepia');
$('#reset').onclick=()=>mut(()=>{[S.rows,S.cols]=DEF[S.mode];Object.assign(S,{gap:4,outline:true,rotate:true,filter:'none',name:false})});
$('#fill').onclick=()=>{const f=S.slots[0]||S.slots.find(Boolean);if(!f)return toast('Upload a photo first');mut(()=>{for(let i=0;i<count();i++)S.slots[i]=f})};
$('#clear').onclick=()=>mut(()=>{S.pages=[[]];S.pg=0;S.sel=-1});
$('#undo').onclick=undo;$('#redo').onclick=redo;
const openPd=()=>{$('#pd').hidden=false;paintLpv()};
const rotBusy=()=>[...RC.values()].some(v=>v===null);
let autoPv=false;
async function doPrint(){
 autoPv=$('#pv').hidden;$('#pd').hidden=true;$('#pv').hidden=false;paintPv();
 for(let n=0;n<50&&rotBusy();n++)await new Promise(r=>setTimeout(r,100));
 await Promise.all([...document.querySelectorAll('#pzw img')].map(i=>i.decode().catch(()=>{})));
 setTimeout(()=>window.print(),250)}
$('#print').onclick=doPrint;$('#doPrint').onclick=doPrint;$('#prev').onclick=()=>{$('#pv').hidden=false;paintPv()};
$('#pvSet').onclick=openPd;
$('#pvClose').onclick=()=>$('#pv').hidden=true;
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const PRN=(()=>{let l;try{l=JSON.parse(LS.get('cnicPrinters'))}catch(e){}if(!Array.isArray(l)||!l.length)l=['Epson L3350','Canon','HP','Brother','Microsoft Print to PDF'];return{list:l,cur:LS.get('cnicPrinter')||l[0]}})();
function fillPrn(){const p=$('#printer');if(!PRN.list.includes(PRN.cur))PRN.cur=PRN.list[0]||'System default';p.innerHTML=PRN.list.map(n=>`<option>${n.replace(/</g,'&lt;')}</option>`).join('');p.value=PRN.cur;LS.set('cnicPrinters',JSON.stringify(PRN.list));LS.set('cnicPrinter',PRN.cur)}
function prnChanged(){fillPrn();if(typeof paintLpv==='function')try{paintLpv()}catch(e){}try{$('#pd').hidden||openPd()}catch(e){}}
fillPrn();$('#printer').onchange=e=>{PRN.cur=e.target.value;prnChanged()};
$('#prAdd').onclick=()=>{let n='';try{n=(prompt('Printer name (as shown in your system):')||'').trim()}catch(e){};if(n){if(!PRN.list.includes(n))PRN.list.push(n);PRN.cur=n;prnChanged()}};
$('#prDel').onclick=()=>{if(PRN.list.length<2)return;PRN.list=PRN.list.filter(n=>n!==PRN.cur);PRN.cur=PRN.list[0];prnChanged()};
$('#pdOk').onclick=doPrint;$('#pdNo').onclick=()=>$('#pd').hidden=true;
document.querySelectorAll('[name=pr]').forEach(r=>r.onchange=()=>{PR.mode=r.value;paintLpv();if(!$('#pv').hidden)paintPv()});
$('#prt').oninput=e=>{PR.txt=e.target.value;PR.mode='cus';document.querySelector('[name=pr][value=cus]').checked=true;paintLpv();if(!$('#pv').hidden)paintPv()};
$('#pp').onclick=()=>{if(S.pg>0){S.pg--;S.sel=-1;render()}};
$('#pn').onclick=()=>{if(S.pg<S.pages.length-1){S.pg++;S.sel=-1;render()}};
$('#addpg').onclick=()=>mut(()=>{S.pages.splice(S.pg+1,0,[]);S.pg++;S.sel=-1});
$('#delpg').onclick=()=>{if(S.pages.length<2)return toast('At least one page is needed');mut(()=>{S.pages.splice(S.pg,1);S.pg=Math.min(S.pg,S.pages.length-1)})};
const zm=v=>{Z=Math.max(.3,Math.min(3,v));render()};
$('#zo').onclick=()=>zm(Z-.15);$('#zi').onclick=()=>zm(Z+.15);$('#zl').onclick=()=>zm(1);

$('#stage').addEventListener('click',e=>{
 const cell=e.target.closest('.cell');if(!cell)return;const i=+cell.dataset.i,a=e.target.closest('[data-a]')?.dataset.a;
 if(a==='pick'){tgt=i;$('#fi').click();return}
 if(a==='crop'){S.sel=i;return openCrop(i)}
 if(a==='auto'){const s=S.slots[i];fullC(s.orig).then(async c=>{const r=autoCrop(c);if(!r)return toast('Could not detect edges — use Crop');const n=await mk(s.orig,c,r,s.name);mut(()=>S.slots[i]=n)});return}
 if(a==='del'){mut(()=>S.slots[i]=null);return}
 S.sel=i;render()});
$('#fi').onchange=e=>{addFiles(e.target.files,tgt);e.target.value=''};
$('#stage').addEventListener('dragover',e=>e.preventDefault());
$('#stage').addEventListener('drop',e=>{e.preventDefault();const c=e.target.closest('.cell'),ix=c?+c.dataset.i:firstEmpty();
 addFiles(e.dataTransfer.files,ix)});



const MARK='__CNIC_TOOL_CLIP__',inField=t=>['INPUT','SELECT','TEXTAREA'].includes(t.tagName),overlayOpen=()=>!!document.querySelector('.ov:not([hidden])');
function copyMark(){try{const t=document.createElement('textarea');t.value=MARK;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();document.execCommand('copy');t.remove()}catch(e){}}
const pasteClip=i=>mut(()=>{S.slots[i]=clip;S.sel=nextEmpty(i)});
async function fetchImg(u){const r=await fetch(u),b=await r.blob();if(!/^image\//i.test(b.type))throw Error('not an image');return new File([b],'pasted-image.'+(b.type.split('/')[1]||'png').replace('jpeg','jpg'),{type:b.type})}
addEventListener('keydown',e=>{
 if(!$('#cm').hidden){
  if(e.key==='Escape')$('#cCancel').click();
  else if(e.key==='Enter'&&!['SELECT','INPUT','BUTTON'].includes(e.target.tagName)){e.preventDefault();$('#cApply').click()}
  return}
 if(!(e.ctrlKey||e.metaKey))return;const k=e.key.toLowerCase(),tg=e.target.tagName;
 if(k==='p'){e.preventDefault();doPrint();return}
 if(inField(e.target)||overlayOpen())return;
 if(k==='z'){e.preventDefault();undo()}else if(k==='y'){e.preventDefault();redo()}
 else if(k==='c'||k==='x'){let s=S.slots[S.sel];if(!s&&k==='c')s=lastUp;if(!s)return toast('Upload a photo first');e.preventDefault();clip=s;copyMark();
  if(k==='x'&&S.slots[S.sel])mut(()=>S.slots[S.sel]=null);toast(k==='c'?'Copied — press Ctrl+V to paste in the next box':'Cut')}});
/* Ctrl+V: paste an image copied from anywhere (screenshot, web page "Copy image", file copied in Explorer / Gallery, image link) */
addEventListener('paste',e=>{
 if(inField(e.target)||overlayOpen())return;
 const dt=e.clipboardData;if(!dt)return;
 const i=S.sel>=0?S.sel:firstEmpty(),files=[];
 for(const it of dt.items||[])if(it.kind==='file'){const f=it.getAsFile();if(f)files.push(f)}
 if(!files.length)for(const f of dt.files||[])files.push(f);
 const html=dt.getData('text/html')||'',txt=(dt.getData('text/plain')||'').trim();
 e.preventDefault();
 if(files.some(isImg))return addFiles(files,i);
 if(txt===MARK&&clip)return pasteClip(i);
 const m=html.match(/<img[^>]+src=["']([^"']+)["']/i),u=m?m[1].replace(/&amp;/g,'&'):/^(https?:\/\/|data:image\/)/i.test(txt)?txt:'';
 if(u)return fetchImg(u).then(f=>addFiles([f],i)).catch(()=>toast('Could not read the copied image — save it, then upload'));
 if(clip)return pasteClip(i);
 toast('No image in clipboard — copy an image first')});
$('#pasteBtn').onclick=async()=>{
 const i=S.sel>=0?S.sel:firstEmpty();
 try{
  const items=await navigator.clipboard.read(),files=[];
  for(const it of items){const t=it.types.find(x=>x.startsWith('image/'));if(t){const b=await it.getType(t);files.push(new File([b],'pasted-image.'+t.split('/')[1],{type:t}))}}
  if(files.length)return addFiles(files,i)
 }catch(e){}
 if(clip)return pasteClip(i);
 toast('Press Ctrl+V to paste (on phone: long-press a box → Paste)')};
$('#enh').onchange=e=>{ENH.on=e.target.checked};
addEventListener('resize',render);
addEventListener('afterprint',()=>{if(autoPv){autoPv=false;$('#pv').hidden=true}});
addEventListener('beforeprint',()=>{if($('#pv').hidden){$('#pv').hidden=false;paintPv()}});
render();
})();
